from django.db import models
from django.contrib.auth.models import User

class BrandPersona(models.Model):
    """Stores the 'DNA' benchmarks for different channels."""
    NAME_CHOICES = [
        ('LINKEDIN', 'LinkedIn (Friendly)'),
        ('INVESTOR', 'Investor Relations (Professional)'),
        ('SUPPORT', 'Support Docs (Clarity)'),
    ]
    name = models.CharField(max_length=50, choices=NAME_CHOICES, unique=True)
    
    # Target Ranges (Standardized -1.0 to 1.0 or 0.0 to 1.0)
    min_polarity = models.FloatField(default=0.1)  # Higher = More Positive
    max_subjectivity = models.FloatField(default=0.5) # Lower = More Factual
    min_formality_score = models.IntegerField(default=60) # Flesch-Kincaid scale
    
    def __str__(self):
        return self.name

class ContentAnalysis(models.Model):
    """Logs the history of analysis for portfolio tracking."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # Allowed null for demo
    raw_text = models.TextField()
    final_polarity = models.FloatField()
    final_subjectivity = models.FloatField()
    persona_applied = models.ForeignKey(BrandPersona, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis {self.id} - {self.created_at.date()}"
