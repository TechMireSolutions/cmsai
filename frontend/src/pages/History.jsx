import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, ChevronRight, FileText, TrendingUp, TrendingDown } from 'lucide-react';

const PRESET_COLORS = {
  'LinkedIn / Friendly':        'var(--green)',
  'Investor Relations / Formal':'var(--violet)',
  'Technical Documentation':    'var(--blue)',
  'Marketing Copy / Urgency':   'var(--amber)',
};

function ScorePill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color }}>{Math.round(value * 100)}%</div>
      <div style={{ fontSize: '0.62rem', color: 'var(--clr-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function HistoryCard({ entry, onRestore, onDelete }) {
  const color = PRESET_COLORS[entry.preset] || 'var(--green)';
  const date = new Date(entry.timestamp);
  const timeStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card"
      style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
    >
      {/* Color strip */}
      <div style={{ width: '4px', alignSelf: 'stretch', borderRadius: '4px', background: color, flexShrink: 0 }} />

      {/* Meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
            {entry.snippet}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--clr-muted)', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} /> {timeStr}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={11} /> {entry.words} words
          </span>
          <span style={{ color, padding: '2px 8px', background: color + '15', borderRadius: '20px', border: `1px solid ${color}30` }}>
            {entry.preset}
          </span>
        </div>
      </div>

      {/* Scores */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '0 1rem', borderLeft: '1px solid var(--clr-border)', borderRight: '1px solid var(--clr-border)' }}>
        <ScorePill label="Polarity" value={(entry.polarity + 1) / 2} color="var(--green)" />
        <ScorePill label="Subjectivity" value={entry.subjectivity} color="var(--violet)" />
        <ScorePill label="Formality" value={entry.formality} color="var(--rose)" />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => onRestore(entry)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', border: '1px solid var(--clr-border)', background: 'transparent', color: 'var(--clr-text)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Restore <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: '1px solid rgba(251,113,133,0.2)', background: 'rgba(251,113,133,0.05)', color: 'var(--rose)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function History({ onRestore }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sw_history') || '[]');
      setEntries(saved);
    } catch { setEntries([]); }
  }, []);

  const handleDelete = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('sw_history', JSON.stringify(updated));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Writing History</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: '4px' }}>
            Your last {entries.length} saved sessions. Restore any to continue editing.
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => { setEntries([]); localStorage.removeItem('sw_history'); }}
            style={{ padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(251,113,133,0.2)', background: 'rgba(251,113,133,0.05)', color: 'var(--rose)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* List */}
      <AnimatePresence>
        {entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-subtle)' }}
          >
            <Clock size={48} strokeWidth={1} style={{ marginBottom: '1rem' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No history yet</p>
            <p style={{ fontSize: '0.8rem' }}>Sessions are saved automatically as you write and analyze content.</p>
          </motion.div>
        ) : (
          entries.map(e => (
            <HistoryCard key={e.id} entry={e} onRestore={onRestore} onDelete={handleDelete} />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
