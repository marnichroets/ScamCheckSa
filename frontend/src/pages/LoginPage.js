import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api';

const s = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0A0E14',
    padding: '2rem',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #1e2a3a',
    borderRadius: '12px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' },
  sub: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', color: '#9aa3ae', fontSize: '0.85rem', marginBottom: '0.4rem' },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#111827',
    border: '1px solid #1e2a3a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '0.9rem',
    background: '#1a3c6e',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  googleBtn: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    color: '#3c4043',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    marginBottom: '0.25rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: '1.25rem 0 1rem',
    color: '#4b5563',
    fontSize: '0.85rem',
  },
  dividerLine: { flex: 1, height: '1px', background: '#1e2a3a' },
  registerRow: {
    marginTop: '1.25rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  registerLink: { color: '#1a3c6e', textDecoration: 'none', fontWeight: 500 },
  error: {
    background: '#2a1a1a',
    border: '1px solid #5a2d2d',
    color: '#ef5350',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/admin', { replace: true });
      return;
    }
    const err = searchParams.get('error');
    if (err === 'google_cancelled') return;
    if (err) setError('Google sign-in failed. Please try again.');
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);
      const { data } = await api.post('/auth/token', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      localStorage.setItem('token', data.access_token);
      navigate('/admin');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const base = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
      : '';
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Sign in</h1>
        <p style={s.sub}>Sign in to your ScamCheckSA account.</p>

        <button style={s.googleBtn} onClick={handleGoogleSignIn} type="button">
          <GoogleIcon />
          Sign in with Google
        </button>

        <div style={s.divider}>
          <div style={s.dividerLine} />
          or
          <div style={s.dividerLine} />
        </div>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Email or username</label>
            <input
              style={s.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. marnichr@gmail.com"
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={s.registerRow}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={s.registerLink}>Create one</Link>
        </p>

        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}
