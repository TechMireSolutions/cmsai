import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart2, Activity, Brain, Target } from 'lucide-react';

/* Pure SVG sparkline — no side effects, no canvas crashes */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const W = 120, H = 40;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.75 - H * 0.1,
  }));
  const line  = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area  = `${line} L${pts[pts.length-1].x},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi,'')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MOCK_SESSIONS = [
  { id: 1, label: 'Mon', polarity: 0.6, subjectivity: 0.4, formality: 0.5, words: 312 },
  { id: 2, label: 'Tue', polarity: 0.3, subjectivity: 0.6, formality: 0.7, words: 198 },
  { id: 3, label: 'Wed', polarity: 0.7, subjectivity: 0.3, formality: 0.4, words: 450 },
  { id: 4, label: 'Thu', polarity: 0.5, subjectivity: 0.5, formality: 0.6, words: 280 },
  { id: 5, label: 'Fri', polarity: 0.8, subjectivity: 0.7, formality: 0.3, words: 520 },
  { id: 6, label: 'Sat', polarity: 0.4, subjectivity: 0.4, formality: 0.8, words: 145 },
  { id: 7, label: 'Sun', polarity: 0.65, subjectivity: 0.55, formality: 0.5, words: 390 },
];

function StatCard({ label, value, delta, color, chartData, icon }) {
  const up = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-muted)', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>
            {value}
          </p>
        </div>
        <div style={{ padding: '10px', background: color + '18', borderRadius: '12px', color }}>
          {icon}
        </div>
      </div>
      <Sparkline data={chartData} color={color} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: up ? 'var(--green)' : 'var(--rose)', fontWeight: 600 }}>
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        <span>{up ? '+' : ''}{delta}% vs last week</span>
      </div>
    </motion.div>
  );
}

function BarRow({ label, value, color }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--clr-muted)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{Math.round(value * 100)}%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '99px' }}
        />
      </div>
    </div>
  );
}

export default function Analytics({ currentAnalysis }) {
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sw_history') || '[]');
      setHistory(saved.slice(0, 10)); // Take last 10 for charts
    } catch { setHistory([]); }
  }, []);

  const polarityData  = history.length > 0 ? history.map(s => (s.polarity + 1) / 2) : [0.5, 0.6, 0.55];
  const subjData      = history.length > 0 ? history.map(s => s.subjectivity) : [0.4, 0.45, 0.42];
  const wordData      = history.length > 0 ? history.map(s => s.words) : [200, 250, 220];

  const avgPol = history.length > 0 ? (history.reduce((a, s) => a + (s.polarity + 1) / 2, 0) / history.length) : 0;
  const avgSub = history.length > 0 ? (history.reduce((a, s) => a + s.subjectivity, 0) / history.length) : 0;
  const totalWords = history.reduce((a, s) => a + s.words, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <StatCard
          label="Avg Polarity"
          value={`${Math.round(avgPol * 100)}%`}
          delta={history.length > 1 ? Math.round(((avgPol - (history[history.length-1].polarity + 1)/2) / 0.5) * 100) : 0}
          color="var(--green)"
          chartData={polarityData}
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Avg Subjectivity"
          value={`${Math.round(avgSub * 100)}%`}
          delta={history.length > 1 ? Math.round(((avgSub - history[history.length-1].subjectivity) / 0.5) * 100) : 0}
          color="var(--violet)"
          chartData={subjData}
          icon={<Activity size={20} />}
        />
        <StatCard
          label="Total Words"
          value={totalWords.toLocaleString()}
          delta={history.length > 0 ? Math.round((totalWords / (history.length * 200)) * 10) : 0}
          color="var(--blue)"
          chartData={wordData}
          icon={<BarChart2 size={20} />}
        />
      </div>

      {/* Breakdown + Current Session */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Session History Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={18} color="var(--violet)" /> Recent Session Breakdown
          </h3>
          {history.length > 0 ? (
            history.map((s, i) => (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-subtle)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.06em' }}>
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {s.preset}
                </div>
                <BarRow label="Polarity"     value={(s.polarity + 1) / 2}     color="var(--green)"  />
                <BarRow label="Formality"    value={s.formality}    color="var(--rose)"   />
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-subtle)' }}>
              <p style={{ fontSize: '0.8rem' }}>No session data yet.</p>
            </div>
          )}
        </div>

        {/* Current Session Live */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--green)" /> Current Session Live
          </h3>
          {currentAnalysis ? (
            <>
              <BarRow label="Polarity"     value={(currentAnalysis.polarity + 1) / 2} color="var(--green)"  />
              <BarRow label="Subjectivity" value={currentAnalysis.subjectivity}        color="var(--violet)" />
              <BarRow label="Formality"    value={currentAnalysis.formality}           color="var(--rose)"   />
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(34,211,160,0.05)', border: '1px solid rgba(34,211,160,0.12)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', lineHeight: 1.6 }}>
                  Polarity score of <strong style={{ color: 'var(--green)' }}>{Math.round(((currentAnalysis.polarity + 1) / 2) * 100)}%</strong> indicates a{' '}
                  {currentAnalysis.polarity > 0.3 ? 'positive' : currentAnalysis.polarity < -0.3 ? 'negative' : 'neutral'} brand voice in this session.
                </p>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--clr-subtle)' }}>
              <Activity size={40} strokeWidth={1} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Start writing in the Editor to see live session analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
