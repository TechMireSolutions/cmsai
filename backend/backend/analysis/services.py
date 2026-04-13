import os
import json
import re
from textblob import TextBlob
import textstat
from .models import BrandPersona

# Optional NLTK sentence tokenizer for better sentence splitting
try:
    import nltk
    from nltk.tokenize import sent_tokenize
    _nltk_available = True
except ImportError:
    _nltk_available = False

# Use the new google-genai SDK
try:
    from google import genai
    _api_key = os.getenv('GENAI_API_KEY')
    _genai_client = genai.Client(api_key=_api_key) if _api_key else None
except Exception:
    _genai_client = None

class LinguisticEngine:
    @staticmethod
    def _ensure_nltk_data():
        if not _nltk_available:
            return
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            try:
                nltk.download('punkt', quiet=True)
            except Exception:
                pass

    @staticmethod
    def _tokenize_sentences(text):
        LinguisticEngine._ensure_nltk_data()
        if _nltk_available:
            try:
                return sent_tokenize(text)
            except Exception:
                pass
        blob = TextBlob(text)
        return [str(s).strip() for s in blob.sentences] or [text.strip()]

    @staticmethod
    def _build_off_tone_data(sentences, persona):
        results = []
        target_formality = 1.0 - (persona.min_formality_score / 100)

        for sentence in sentences:
            if not sentence.strip():
                continue
            blob = TextBlob(sentence)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity
            formality = max(0.0, min(1.0, (100 - textstat.flesch_reading_ease(sentence)) / 100))

            reasons = []
            if polarity < persona.min_polarity:
                reasons.append('More positive tone required')
            if subjectivity > persona.max_subjectivity:
                reasons.append('Reduce subjective language')
            if formality < target_formality:
                reasons.append('Increase formality for this brand persona')

            if reasons:
                suggestion_parts = []
                if polarity < persona.min_polarity:
                    suggestion_parts.append('Use more positive language')
                if subjectivity > persona.max_subjectivity:
                    suggestion_parts.append('Frame this sentence more objectively')
                if formality < target_formality:
                    suggestion_parts.append('Use more professional phrasing')

                results.append({
                    'original': sentence,
                    'polarity': polarity,
                    'subjectivity': subjectivity,
                    'formality': formality,
                    'is_off_tone': True,
                    'reason': ' / '.join(reasons),
                    'suggestion': ' '.join(suggestion_parts) + '.',
                })

        return results

    @staticmethod
    def analyze(text, persona_id):
        blob = TextBlob(text)

        try:
            persona = BrandPersona.objects.get(id=persona_id)
        except Exception:
            persona = BrandPersona.objects.first()

        if not persona:
            persona = BrandPersona(name='DEFAULT', min_polarity=0.1, max_subjectivity=0.5, min_formality_score=60)

        # Build baseline results (Fast & Local)
        # We ALWAYS return this structure so the frontend NEVER breaks
        sentences = LinguisticEngine._tokenize_sentences(text)
        analysis_results = {
            'analysis': {
                'polarity':     blob.sentiment.polarity,
                'subjectivity': blob.sentiment.subjectivity,
                'formality':    max(0.0, min(1.0, (100 - textstat.flesch_reading_ease(text)) / 100))
            },
            'target': {
                'name':               persona.get_name_display() if hasattr(persona, 'get_name_display') else str(persona.name),
                'target_polarity':    persona.min_polarity if hasattr(persona, 'min_polarity') else 0.1,
                'target_subjectivity':persona.max_subjectivity if hasattr(persona, 'max_subjectivity') else 0.5,
                'target_formality':   (1.0 - (persona.min_formality_score / 100)) if hasattr(persona, 'min_formality_score') else 0.4,
            },
            'is_off_tone':       False,
            'off_tone_sentences': [],
            'suggestions':       [],
            'sentences':         sentences
        }
        off_tone_data = LinguisticEngine._build_off_tone_data(sentences, persona)

        if off_tone_data:
            analysis_results['off_tone_sentences'] = off_tone_data
            analysis_results['is_off_tone'] = True
            analysis_results['suggestions'] = [item['suggestion'] for item in off_tone_data]

        # Attempt AI enhancement if key and client available
        if _genai_client and persona and text.strip():
            try:
                prompt = f"""
Analyze the following text based on the '{persona.get_name_display()}' brand persona.
Return ONLY a raw JSON array of objects. No markdown, no code block.
Format: [{{"original": "...", "polarity": 0, "subjectivity": 0, "is_off_tone": false, "reason": "...", "suggestion": "..."}}]
TEXT: {text}
"""
                response = _genai_client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=prompt
                )

                raw = response.text.strip()
                # Extract JSON array from response
                json_match = re.search(r'\[\s*\{.*\}\s*\]', raw, re.DOTALL)

                if json_match:
                    sentences_data = json.loads(json_match.group())
                    analysis_results['sentences'] = [s['original'] for s in sentences_data]
                    analysis_results['off_tone_sentences'] = [s for s in sentences_data if s.get('is_off_tone')]
                    analysis_results['suggestions'] = [s.get('suggestion') for s in analysis_results['off_tone_sentences'] if s.get('suggestion')]
                    analysis_results['is_off_tone'] = any(s.get('is_off_tone') for s in sentences_data)
            except Exception as e:
                # Silently fail to baseline if AI is over quota or unavailable
                print(f'Gemini AI Error: {e}')

        return analysis_results
