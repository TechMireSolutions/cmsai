import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import AuthService from '../api/AuthService';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin]         = useState(true);
  const [role, setRole]               = useState('USER'); // 'USER' or 'ADMIN'
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(null);

  // Form State
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [email, setEmail]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const data = await AuthService.login(username, password, role);
        onLoginSuccess(data.user);
      } else {
        await AuthService.register(username, password, email, role);
        setSuccess(`${role === 'ADMIN' ? 'Admin' : 'User'} account created!`);
        setIsLogin(true);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      background: 'var(--clr-bg)',
      overflow: 'hidden'
    }}>
      {/* Background Animated Blobs */}
      <div className="bg-orb bg-orb-1" style={{ width: '400px', height: '400px', top: '-10%', left: '-5%' }} />
      <div className="bg-orb bg-orb-2" style={{ width: '350px', height: '350px', bottom: '0', right: '0' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(13, 13, 20, 0.65)',
          backdropFilter: 'blur(30px)',
          border: `1px solid ${role === 'ADMIN' ? 'var(--violet)' : 'var(--clr-border)'}`,
          borderRadius: '32px',
          boxShadow: role === 'ADMIN' ? '0 20px 80px rgba(167, 139, 250, 0.25)' : '0 20px 80px rgba(0,0,0,0.5)',
          transition: 'all 0.4s ease'
        }}
      >
        {/* Role Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '2rem',
          border: '1px solid var(--clr-border)'
        }}>
          {['USER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setError(null); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: role === r ? (r === 'ADMIN' ? 'var(--violet)' : 'var(--green)') : 'transparent',
                color: role === r ? '#000' : 'var(--clr-muted)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {r} Dashboard
            </button>
          ))}
        </div>

        {/* Brand Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="nav-logo-wrap" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <div className="nav-logo-bg" style={{ background: role === 'ADMIN' ? 'linear-gradient(135deg, var(--violet), #7c3ae9)' : undefined, boxShadow: role === 'ADMIN' ? 'var(--glow-violet)' : undefined }} />
            <div className="nav-logo-icon"><Zap size={30} fill="currentColor" /></div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            {isLogin ? `${role === 'ADMIN' ? 'Admin' : 'User'} Login` : `Create ${role === 'ADMIN' ? 'Admin' : 'User'} Account`}
          </h1>
          <p style={{ color: 'var(--clr-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {role === 'ADMIN' ? 'Access specialized branding controls' : 'Start crafting brand-aware content'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="input-group"
              >
                <label style={labelStyle}><Mail size={12} /> Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </motion.div>
            )}

            <motion.div key="username" className="input-group">
              <label style={labelStyle}><User size={12} /> Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                required
              />
            </motion.div>

            <motion.div key="password" className="input-group">
              <label style={labelStyle}><Lock size={12} /> Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </motion.div>
          </AnimatePresence>

          {/* Feedback Messages */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={errorStyle}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={successStyle}>
              <CheckCircle2 size={14} /> {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading ? 'var(--clr-subtle)' : (role === 'ADMIN' ? 'var(--violet)' : 'var(--green)'),
              boxShadow: loading ? 'none' : (role === 'ADMIN' ? '0 10px 25px rgba(167, 139, 250, 0.3)' : '0 10px 20px rgba(34, 211, 160, 0.2)')
            }}
          >
            {loading ? (
              <span className="processing-ring" style={{ width: '16px', height: '16px' }} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--green)',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        {/* Feature Hint */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ color: 'var(--violet)' }}><Sparkles size={18} /></div>
          <p style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', margin: 0 }}>
            Session data is encrypted & stored on your private engine instances.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Styling Constants
const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.7rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--clr-muted)',
  marginBottom: '0.6rem'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid var(--clr-border)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&:focus': { borderColor: 'var(--green)' }
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '14px',
  border: 'none',
  color: '#011109',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  marginTop: '0.5rem'
};

const errorStyle = {
  color: 'var(--rose)',
  fontSize: '0.8rem',
  fontWeight: 600,
  textAlign: 'center',
  padding: '10px',
  background: 'rgba(251, 113, 133, 0.1)',
  borderRadius: '10px',
  border: '1px solid rgba(251, 113, 133, 0.2)'
};

const successStyle = {
  color: 'var(--green)',
  fontSize: '0.8rem',
  fontWeight: 600,
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '10px',
  background: 'rgba(34, 211, 160, 0.1)',
  borderRadius: '10px',
  border: '1px solid rgba(34, 211, 160, 0.2)'
};
