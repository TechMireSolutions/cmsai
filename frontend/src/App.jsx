import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Settings2, Sparkles, Activity, User,
  BarChart3, FileText, Globe, BookOpen, Megaphone, Save, CheckCheck
} from 'lucide-react';
import Editor from './components/Editor';
import ToneMeter from './components/ToneMeter';
import Analytics from './pages/Analytics';
import Templates from './pages/Templates';
import History from './pages/History';
import AnalysisService from './api/AnalysisService';
import AuthService from './api/AuthService';
import Auth from './pages/Auth';

const PRESET_ICONS = {
  'LINKEDIN': <Globe size={13} />,
  'INVESTOR': <BarChart3 size={13} />,
  'SUPPORT':  <BookOpen size={13} />,
  'DEFAULT':  <Megaphone size={13} />,
};

const TABS = ['Editor', 'Analytics', 'Templates', 'History'];

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6,  transition: { duration: 0.18 } },
};

export default function App() {
  const [user, setUser]                   = useState(null);
  const [activeTab, setActiveTab]         = useState('Editor');
  const [text, setText]                   = useState(null);
  const [htmlContent, setHtmlContent]     = useState(null);
  const [presets, setPresets]             = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [analysisData, setAnalysisData]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [toast, setToast]                 = useState(null); // { msg, type }

  const editorActionsRef = useRef({});   // highlight / replace / setContent
  const resetRef         = useRef(null); // legacy setContent

  const wordCount     = (text || '').split(/\s+/).filter(Boolean).length;
  // Local sentence estimator for instant UI feedback
  const localSentenceCount = ((text || '').match(/[^.!?]+[.!?]+/g) || []).length;
  const sentenceCount = analysisData?.sentences?.length ?? localSentenceCount;
  const isOffTone     = analysisData?.is_off_tone ?? false;

  /* ── Check user session ── */
  useEffect(() => {
    const saved = AuthService.getCurrentUser();
    if (saved) setUser(saved);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  /* ── Show toast helper ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  /* ── Fetch personas ── */
  useEffect(() => {
    AnalysisService.getPersonas().then(data => {
      setPresets(data);
      if (data.length) setSelectedPreset(data[0]);
    });
  }, []);

  /* ── Get Analysis Utility ── */
  const runAnalysis = useCallback(async (currentText, personaId) => {
    if (!currentText || !currentText.trim() || !personaId) return;
    
    setLoading(true);
    try {
      const data = await AnalysisService.analyzeText(currentText, personaId);
      if (data && data.analysis) {
        setAnalysisData(data);
        if (editorActionsRef.current?.highlightOffTone) {
          if (data.is_off_tone && data.off_tone_sentences?.length > 0) {
            editorActionsRef.current.highlightOffTone(data.off_tone_sentences);
          } else {
            editorActionsRef.current.clearHighlights();
          }
        }
      }
    } catch (e) {
      console.error('Analysis Engine Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Ultra-Stable Analysis Debouncer ── */
  const analysisTimerRef = useRef(null);
  const lastTextRef      = useRef('');

  useEffect(() => {
    if (!text || !text.trim() || !selectedPreset) {
      if (!text || !text.trim()) {
        setAnalysisData(null);
        editorActionsRef.current.clearHighlights?.();
        lastTextRef.current = '';
      }
      return;
    }
    if (text === lastTextRef.current) return;

    if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    analysisTimerRef.current = setTimeout(() => {
      lastTextRef.current = text;
      runAnalysis(text, selectedPreset.id);
    }, 1200);

    return () => {
      if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
    };
  }, [text, selectedPreset, runAnalysis]);

  /* ── One-click text replacement ── */
  const handleReplace = useCallback((original, suggestion) => {
    if (!original || !suggestion) return;
    const success = editorActionsRef.current.replaceText?.(original, suggestion);
    if (success) showToast('AI-powered rewrite applied!', 'success');
  }, []);

  /* ── Save session to history ── */
  const saveSession = () => {
    if (!analysisData || !text || !text.trim()) return;
    const entry = {
      id:           Date.now(),
      timestamp:    new Date().toISOString(),
      snippet:      text.slice(0, 60).replace(/\n/g, ' ') + (text.length > 60 ? '…' : ''),
      preset:       selectedPreset?.name ?? 'Unknown',
      words:        wordCount,
      polarity:     analysisData.analysis.polarity,
      subjectivity: analysisData.analysis.subjectivity,
      formality:    analysisData.analysis.formality,
      fullText:     text,
    };
    const prev = JSON.parse(localStorage.getItem('sw_history') || '[]');
    localStorage.setItem('sw_history', JSON.stringify([entry, ...prev].slice(0, 30)));
    showToast('Session saved to History', 'success');
  };

  /* ── Restore from history ── */
  const handleRestore = (entry) => {
    const content = entry.fullText || '';
    setText(content);
    setHtmlContent(content.split('\n').map(p => `<p>${p || '<br/>'}</p>`).join(''));
    lastTextRef.current = content; // Instantly lock to prevent background timer collision
    setActiveTab('Editor');
    runAnalysis(content, selectedPreset?.id);
  };

  /* ── Template → editor ── */
  const handleUseTemplate = (content) => {
    setText(content);
    setHtmlContent(content.split('\n').map(p => `<p>${p || '<br/>'}</p>`).join(''));
    lastTextRef.current = content;
    setActiveTab('Editor');
    if (selectedPreset) runAnalysis(content, selectedPreset.id);
  };

  if (!user) {
    return <Auth onLoginSuccess={setUser} />;
  }

  return (
    <>
      {/* ── Background ── */}
      <div className="bg-canvas">
        <div className="bg-mesh" />
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0,  x: '-50%' }}
            exit={{   opacity: 0, y: 20,  x: '-50%' }}
            style={{
              position: 'fixed', bottom: '2rem', left: '50%', zIndex: 9999,
              padding: '10px 20px',
              background: toast.type === 'success'
                ? 'rgba(34,211,160,0.15)'
                : 'rgba(251,113,133,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,211,160,0.3)' : 'rgba(251,113,133,0.3)'}`,
              borderRadius: '20px',
              color: toast.type === 'success' ? 'var(--green)' : 'var(--rose)',
              fontSize: '0.85rem', fontWeight: 700,
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <CheckCheck size={14} /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-wrap">
        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="nav-brand">
            <div className="nav-logo-wrap">
              <div className="nav-logo-bg" />
              <div className="nav-logo-icon"><Zap size={22} fill="currentColor" /></div>
            </div>
            <div className="nav-wordmark">SentiWrite<sup>AI</sup></div>
          </div>

          <div className="nav-center">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Editor' && isOffTone && (
                  <span style={{
                    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--rose)', marginLeft: 5, verticalAlign: 'middle',
                    boxShadow: '0 0 6px var(--rose)',
                  }} />
                )}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                  {user.is_staff && (
                    <span style={{ fontSize: '0.55rem', background: 'var(--violet)', color: 'black', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>ADMIN</span>
                  )}
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>{user.username}</div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--clr-muted)', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Logout
                </button>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--clr-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                <User size={16} />
              </div>
            </div>
            <motion.div
              animate={{ borderColor: isOffTone ? 'rgba(251,113,133,0.4)' : 'rgba(34,211,160,0.2)' }}
              transition={{ duration: 0.4 }}
              className="badge-live"
              style={{ borderColor: isOffTone ? 'rgba(251,113,133,0.4)' : undefined,
                       background:   isOffTone ? 'rgba(251,113,133,0.08)' : undefined,
                       color:        isOffTone ? 'var(--rose)' : undefined }}
            >
              <span className="pulse-dot" style={{ background: isOffTone ? 'var(--rose)' : undefined, boxShadow: isOffTone ? '0 0 6px var(--rose)' : undefined }} />
              {isOffTone ? 'Tone Alert' : 'Live Analysis'}
            </motion.div>
          </div>
        </nav>

        {/* ── HERO STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-strip"
          style={{ borderColor: isOffTone ? 'rgba(251,113,133,0.15)' : undefined }}
        >
          <div className="hero-text">
            <h1>Brand-Aware Content <em>Intelligence</em></h1>
            <p>Every sentence is analyzed in real-time against your brand persona. Detect tone drift before it reaches your audience.</p>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">{wordCount}</div>
              <div className="stat-label">{wordCount === 1 ? 'Word' : 'Words'}</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-num">{sentenceCount}</div>
              <div className="stat-label">{sentenceCount === 1 ? 'Sentence' : 'Sentences'}</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-num" style={{ color: isOffTone ? 'var(--rose)' : 'inherit' }}>
                {analysisData ? `${Math.round(((analysisData.analysis.polarity + 1) / 2) * 100)}%` : loading ? '...' : '0%'}
              </div>
              <div className="stat-label">Sentiment</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-num" style={{ fontSize: '0.95rem', paddingTop: '6px', color: loading ? 'var(--green)' : isOffTone ? 'var(--rose)' : 'var(--clr-muted)' }}>
                {loading ? '●' : isOffTone ? '▲' : '○'}
              </div>
              <div className="stat-label">{loading ? 'Scanning' : isOffTone ? 'Alert' : 'Ready'}</div>
            </div>
          </div>
        </motion.div>

        {/* ── PAGE CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* ─── EDITOR TAB ─── */}
          {activeTab === 'Editor' && (
            <motion.div key="editor" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" className="workspace">

              {/* Left — Editor Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Voice Profile */}
                <div className="preset-row">
                  <span className="preset-label"><Sparkles size={13} color="var(--green)" /> Voice Profile</span>
                  <div className="preset-pills">
                    {presets.map(p => (
                      <button
                        key={p.id}
                        className={`preset-pill ${selectedPreset?.id === p.id ? 'active' : ''}`}
                        onClick={() => setSelectedPreset(p)}
                      >
                        {PRESET_ICONS[p.value] || PRESET_ICONS['DEFAULT']} {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor */}
                <Editor
                  onUpdate={(txt, html) => {
                    setText(txt);
                    setHtmlContent(html);
                  }}
                  resetRef={resetRef}
                  editorActionsRef={editorActionsRef}
                  initialContent={htmlContent}
                />

                {/* Status Bar */}
                <div className="statusbar">
                  <div className="status-left">
                    <div className="stat-chip">
                      {loading
                        ? <span className="processing-ring" />
                        : <Activity size={11} color={isOffTone ? 'var(--rose)' : 'var(--green)'} />
                      }
                      <span>NLP: <strong>{loading ? 'Analyzing…' : isOffTone ? 'Tone Alert' : 'Active'}</strong></span>
                    </div>
                    <div className="stat-chip">
                      <FileText size={11} />
                      <span><strong>{wordCount}</strong> words · <strong>{sentenceCount}</strong> sentences</span>
                    </div>
                    {isOffTone && (
                      <div className="stat-chip" style={{ color: 'var(--rose)' }}>
                        <span style={{ fontSize: '11px' }}>⚠ {analysisData.off_tone_sentences?.length} off-tone sentence{(analysisData.off_tone_sentences?.length ?? 0) > 1 ? 's' : ''} highlighted</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ opacity: 0.4, fontSize: '0.72rem' }}>Local · v1.4.2</span>
                    <button
                      onClick={saveSession}
                      disabled={!analysisData}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '8px',
                        border: '1px solid var(--clr-border)',
                        background: analysisData ? 'rgba(34,211,160,0.06)' : 'transparent',
                        color: analysisData ? 'var(--green)' : 'var(--clr-subtle)',
                        fontSize: '0.72rem', fontWeight: 700,
                        cursor: analysisData ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Save size={11} /> Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Right — Sidebar */}
              <aside className="sidebar">
                <div className="card tone-card">
                  <div className="tone-header">
                    <div className="tone-title">
                      <motion.span
                        animate={{ background: isOffTone ? 'var(--rose)' : 'var(--green)', boxShadow: isOffTone ? '0 0 8px var(--rose)' : '0 0 8px var(--green)' }}
                        style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', animation: 'pulse-glow 2s ease-in-out infinite' }}
                      />
                      Linguistic Pulse
                    </div>
                    <motion.div
                      animate={{ borderColor: isOffTone ? 'rgba(251,113,133,0.2)' : 'rgba(34,211,160,0.15)', color: isOffTone ? 'var(--rose)' : 'var(--green)', background: isOffTone ? 'rgba(251,113,133,0.07)' : 'rgba(34,211,160,0.07)' }}
                      className="live-indicator"
                    >
                      <span className="pulse-dot" style={{ width: 5, height: 5, background: isOffTone ? 'var(--rose)' : undefined }} />
                      {isOffTone ? 'Alert' : 'Real-time'}
                    </motion.div>
                  </div>

                  <ToneMeter
                    analysis={analysisData?.analysis}
                    target={analysisData?.target}
                    suggestions={analysisData?.suggestions ?? []}
                    offToneSentences={analysisData?.off_tone_sentences ?? []}
                    isOffTone={isOffTone}
                    onReplace={handleReplace}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="intel-card"
                >
                  <div className="intel-card-header">
                    <div className="intel-icon"><BarChart3 size={18} /></div>
                    <h4>Brand Intelligence</h4>
                  </div>
                  <p>Benchmarked against <span>{selectedPreset?.name ?? '…'}</span>. Switch profiles to retarget your tone goals.</p>
                </motion.div>
              </aside>
            </motion.div>
          )}

          {/* ─── ANALYTICS ─── */}
          {activeTab === 'Analytics' && (
            <motion.div key="analytics" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Analytics currentAnalysis={analysisData?.analysis} />
            </motion.div>
          )}

          {/* ─── TEMPLATES ─── */}
          {activeTab === 'Templates' && (
            <motion.div key="templates" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Templates onUseTemplate={handleUseTemplate} />
            </motion.div>
          )}

          {/* ─── HISTORY ─── */}
          {activeTab === 'History' && (
            <motion.div key="history" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <History onRestore={handleRestore} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
