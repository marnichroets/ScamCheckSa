import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  sub: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.75rem' },
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
    background: '#1a73e8',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  loginRow: {
    marginTop: '1.25rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  loginLink: { color: '#1a73e8', textDecoration: 'none', fontWeight: 500 },
  error: {
    background: '#2a1a1a',
    border: '1px solid #5a2d2d',
    color: '#ef5350',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
  success: {
    background: '#0d2a1a',
    border: '1px solid #1e5a2d',
    color: '#4caf7d',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
};

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password });
      setSuccess('Account created! Redirecting to sign in...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Create account</h1>
        <p style={s.sub}>Join ScamCheckSA to report and track scammers.</p>

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
              autoFocus
              minLength={3}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirm password</label>
            <input
              style={s.input}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={s.loginRow}>
          Already have an account?{' '}
          <Link to="/login" style={s.loginLink}>Sign in</Link>
        </p>

        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
      </div>
    </div>
  );
}
