import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckCircle2, AlertTriangle, TrendingUp,
  Zap, ArrowRight, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

/* ── Metric Gauge ── */
function Gauge({ label, value, target, color, icon }) {
  const pct  = Math.max(0, Math.min(100, Math.round(value  * 100)));
  const tpct = Math.max(0, Math.min(100, Math.round(target * 100)));

  return (
    <div className="metric">
      <div className="metric-head">
        <span className="metric-name">{icon} {label}</span>
        <motion.span
          key={pct}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="metric-val"
          style={{ color }}
        >
          {pct}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-muted)' }}>%</span>
        </motion.span>
      </div>
      <div className="track">
        <motion.div
          className="track-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
        <div className="track-target" style={{ left: `${tpct}%` }} />
      </div>
      <div className="metric-foot">
        <span>Current</span>
        <span>Target {tpct}%</span>
      </div>
    </div>
  );
}

/* ── Suggestion Pill (clickable) ── */
function AltPill({ word, offToneSentence, onReplace }) {
  return (
    <button
      title={`Replace trigger word in the highlighted sentence with "${word}"`}
      onClick={() => onReplace && onReplace(offToneSentence, word)}
      style={{
        padding: '4px 12px',
        background: 'rgba(251,191,36,0.08)',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--amber)',
        fontFamily: "'SF Mono','Fira Code',monospace",
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onMouseEnter={e => { e.target.style.background = 'rgba(251,191,36,0.18)'; e.target.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.target.style.background = 'rgba(251,191,36,0.08)'; e.target.style.transform = 'none'; }}
    >
      {word} <ArrowRight size={10} />
    </button>
  );
}

/* ── Off-Tone Sentence Row ── */
function OffToneRow({ item, onRepl }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="insight-card insight-warn"
      style={{ flexDirection: 'column', gap: '0.85rem', padding: '1.25rem' }}
    >
      {/* Sentence preview */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div className="insight-icon-wrap" style={{ flexShrink: 0, background: 'rgba(251,113,133,0.1)', color: 'var(--rose)' }}>
          <AlertTriangle size={14} strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '6px' }}>
            Flagged Segment
          </p>
          <p style={{
            fontSize: '0.825rem',
            color: '#fff',
            lineHeight: 1.5,
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 500
          }}>
            "{item.original}"
          </p>
        </div>
      </div>

      {/* AI Reasoning */}
      {item.reason && (
        <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', borderLeft: '3px solid var(--violet)' }}>
          <p style={{ fontSize: '0.75rem', color: '#d1d5db', margin: 0, lineHeight: 1.6 }}>
            <Sparkles size={11} style={{ marginRight: '6px' }} color="var(--violet)" />
            {item.reason}
          </p>
        </div>
      )}

      {/* AI Suggestion Actions */}
      {item.suggestion && (
        <div style={{ marginTop: '4px' }}>
          <p style={{ fontSize: '0.675rem', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
             AI Suggestion <RefreshCw size={10} />
          </p>
          <button
            onClick={() => onRepl(item.original, item.suggestion)}
            className="ai-suggestion-btn"
            style={{
              width: '100%',
              padding: '12px',
              textAlign: 'left',
              background: 'rgba(34,211,160,0.06)',
              border: '1px solid rgba(34,211,160,0.2)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: 'var(--green)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{ fontStyle: 'italic', color: '#e2e8f0' }}>"{item.suggestion}"</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '4px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
              REPLACE WITH THIS <ChevronRight size={11} />
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main ToneMeter Component ── */
export default function ToneMeter({ analysis, target, suggestions, offToneSentences, isOffTone, onReplace }) {
  if (!analysis) {
    return (
      <div className="tone-body">
        <div className="empty-state">
          <div className="empty-icon">
            <Activity size={28} strokeWidth={1.5} color="var(--clr-subtle)" />
          </div>
          <p>Start writing to activate real-time brand analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Gauges ── */}
      <div className="tone-body">
        <Gauge
          label="Polarity"
          value={(analysis.polarity + 1) / 2}
          target={target?.target_polarity != null ? (target.target_polarity + 1) / 2 : 0.5}
          color="var(--green)"
          icon={<TrendingUp size={12} />}
        />
        <Gauge
          label="Subjectivity"
          value={analysis.subjectivity}
          target={target?.target_subjectivity ?? 0.5}
          color="var(--violet)"
          icon={<span style={{ fontSize: '10px' }}>◈</span>}
        />
        <Gauge
          label="Formality"
          value={analysis.formality}
          target={target?.target_formality ?? 0.5}
          color="var(--rose)"
          icon={<span style={{ fontSize: '10px' }}>◇</span>}
        />
      </div>

      {/* ── Insights / Suggestions Panel ── */}
      <div style={{ paddingBottom: '1rem' }}>
        <p className="insights-header">
          {isOffTone ? '⚠ Tone Alerts' : 'Strategic Insights'}
        </p>

        <AnimatePresence mode="popLayout">
          {/* All clear */}
          {!isOffTone && suggestions.length === 0 && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="insight-card insight-ok"
            >
              <div className="insight-icon-wrap">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <div className="insight-text">
                <strong>Optimal Match</strong>
                <p>Content aligns with the <em>{target?.name || 'selected'}</em> persona.</p>
              </div>
            </motion.div>
          )}

          {/* Off-tone sentences with clickable replacements */}
          {isOffTone && offToneSentences?.length > 0 && (
            <motion.div key="offtone-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Off-tone banner */}
              <div style={{
                margin: '0 1rem 0.75rem',
                padding: '10px 14px',
                background: 'rgba(251,113,133,0.06)',
                border: '1px solid rgba(251,113,133,0.15)',
                borderRadius: '12px',
                fontSize: '0.78rem',
                color: '#fda4af',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Zap size={13} fill="currentColor" />
                <span><strong>{offToneSentences.length}</strong> sentence{offToneSentences.length > 1 ? 's' : ''} flagged — highlighted in your editor</span>
              </div>

              {offToneSentences.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ margin: '0 1rem 0.75rem' }}
                >
                  <OffToneRow
                    item={item}
                    onRepl={onReplace}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* General suggestions (no specific off-tone sentence) */}
          {!isOffTone && suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.07, type: 'spring', damping: 18 }}
              className="insight-card insight-warn"
            >
              <div className="insight-icon-wrap">
                <AlertTriangle size={16} strokeWidth={2.5} />
              </div>
              <div className="insight-text">
                <strong>{s.label || 'Quality Alert'}</strong>
                <p>{s.message}</p>
                {s.alternatives?.length > 0 && (
                  <div className="alt-pills" style={{ marginTop: '10px' }}>
                    {s.alternatives.map(a => (
                      <span key={a} className="alt-pill">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
