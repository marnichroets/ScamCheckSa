import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  sub: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '2rem' },
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

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Sign in</h1>
        <p style={s.sub}>Admin access required to review reports.</p>
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        {error && <div style={s.error}>{error}</div>}
      </div>
    </div>
  );
}
