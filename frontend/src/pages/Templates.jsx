import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCheck, Globe, BarChart3, BookOpen, Megaphone, Zap } from 'lucide-react';

const TEMPLATES = [
  {
    id: 1,
    preset: 'LinkedIn / Friendly',
    icon: <Globe size={16} />,
    color: 'var(--green)',
    tag: 'Social',
    title: 'Quarterly Milestone Announcement',
    content: `We're thrilled to share that our team has just achieved something incredible — we crossed a major milestone this quarter!\n\nThis wouldn't have been possible without the dedication, creativity, and relentless effort of every single person on our team. Together, we're not just building a product — we're building a movement.\n\nThank you for believing in what we do. The best is yet to come. 🚀`,
  },
  {
    id: 2,
    preset: 'Investor Relations / Formal',
    icon: <BarChart3 size={16} />,
    color: 'var(--violet)',
    tag: 'Finance',
    title: 'Q3 Investor Summary',
    content: `Dear Shareholders,\n\nWe are pleased to report that the Company has demonstrated sustained growth and operational efficiency in Q3 FY2026.\n\nKey Performance Indicators:\n— Revenue increased 18% year-over-year\n— EBITDA margin expanded by 340 basis points\n— Customer acquisition cost declined by 12%\n\nThe Board remains confident in the long-term strategic outlook. Full financial statements are enclosed for your review.`,
  },
  {
    id: 3,
    preset: 'Technical Documentation',
    icon: <BookOpen size={16} />,
    color: 'var(--blue)',
    tag: 'Docs',
    title: 'API Integration Guide',
    content: `## Getting Started\n\nThis document provides step-by-step instructions for integrating with the SentiWrite Analysis API.\n\n### Prerequisites\n- API key (obtainable from your dashboard)\n- HTTP client library (e.g., axios, fetch)\n- Node.js 18+ or Python 3.10+\n\n### Authentication\nAll requests must include a valid Bearer token in the Authorization header.\n\n\`\`\`\nAuthorization: Bearer YOUR_API_KEY\n\`\`\`\n\nFor additional configuration options, refer to the full reference documentation.`,
  },
  {
    id: 4,
    preset: 'Marketing Copy / Urgency',
    icon: <Megaphone size={16} />,
    color: 'var(--amber)',
    tag: 'Marketing',
    title: 'Product Launch Campaign',
    content: `⚡ TODAY ONLY — Introducing the tool your team has been waiting for.\n\nSentiWrite AI automatically ensures every email, post, and press release sounds exactly like your brand. No more awkward tone mismatches. No more editorial fire drills.\n\n✅ Real-time brand voice scoring\n✅ AI-powered rewrite suggestions\n✅ Works privately on your own server\n\nJoin 2,000+ teams already writing with brand confidence. Start your free trial — no credit card required.`,
  },
  {
    id: 5,
    preset: 'LinkedIn / Friendly',
    icon: <Globe size={16} />,
    color: 'var(--green)',
    tag: 'Social',
    title: 'Team Appreciation Post',
    content: `A huge shoutout to the incredible people I get to work with every day.\n\nBuilding something meaningful is never easy, but when you're surrounded by people who show up fully — with curiosity, kindness, and a bias toward action — everything changes.\n\nI'm genuinely lucky. Grateful and energized by what we're building together. 💚`,
  },
  {
    id: 6,
    preset: 'Technical Documentation',
    icon: <BookOpen size={16} />,
    color: 'var(--blue)',
    tag: 'Docs',
    title: 'Incident Post-Mortem',
    content: `## Incident Report — Service Degradation\n\n**Date:** April 4, 2026  \n**Severity:** P2 — Partial Service Degradation  \n**Duration:** 43 minutes  \n\n### Timeline\n- 14:17 UTC — Anomalous latency detected on primary API cluster\n- 14:22 UTC — On-call engineer notified via PagerDuty\n- 15:00 UTC — Root cause identified: memory leak in worker pool\n- 15:18 UTC — Hotfix deployed; service fully restored\n\n### Root Cause\nAn unbounded queue in the background task worker accumulated jobs during a spike in traffic.\n\n### Action Items\n- [ ] Implement queue depth alerting\n- [ ] Add circuit breaker to worker pool`,
  },
];

function TemplateTile({ t, onUse }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(t.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', background: t.color + '18', borderRadius: '8px', color: t.color }}>
            {t.icon}
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: t.color }}>
            {t.tag}
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--clr-subtle)', fontWeight: 600, textAlign: 'right', lineHeight: 1.4 }}>
          {t.preset}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
        {t.title}
      </h3>

      {/* Preview */}
      <p style={{
        fontSize: '0.8125rem',
        color: 'var(--clr-muted)',
        lineHeight: 1.65,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        flex: 1,
      }}>
        {t.content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <button
          type="button"
          onClick={() => onUse(t.content)}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '10px',
            border: 'none',
            background: t.color,
            color: '#000',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: `0 0 16px ${t.color}30`,
          }}
        >
          <Zap size={13} fill="currentColor" /> Use Template
        </button>
        <button
          onClick={handleCopy}
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid var(--clr-border)',
            background: 'transparent',
            color: copied ? 'var(--green)' : 'var(--clr-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
        >
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </motion.div>
  );
}

export default function Templates({ onUseTemplate }) {
  const [filter, setFilter] = useState('All');
  const tags = ['All', 'Social', 'Finance', 'Docs', 'Marketing'];
  const shown = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.tag === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', fontWeight: 600, marginRight: '4px' }}>Filter:</span>
        {tags.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === t ? 'var(--green)' : 'var(--clr-border)',
              background: filter === t ? 'rgba(34,211,160,0.08)' : 'transparent',
              color: filter === t ? 'var(--green)' : 'var(--clr-muted)',
              fontSize: '0.775rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <AnimatePresence>
          {shown.map((t, i) => (
            <TemplateTile key={t.id} t={t} onUse={onUseTemplate} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
