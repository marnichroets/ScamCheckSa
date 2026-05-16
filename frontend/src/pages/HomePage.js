import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const s = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#0A0E14',
  },
  badge: {
    background: '#1a2a1a',
    color: '#4caf50',
    border: '1px solid #2d5a2d',
    borderRadius: '20px',
    padding: '0.3rem 1rem',
    fontSize: '0.8rem',
    marginBottom: '1.5rem',
    letterSpacing: '0.5px',
  },
  heading: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.2,
    marginBottom: '1rem',
    color: '#ffffff',
  },
  sub: {
    color: '#6b7280',
    fontSize: '1.1rem',
    textAlign: 'center',
    maxWidth: '500px',
    marginBottom: '2.5rem',
    lineHeight: 1.6,
  },
  searchBox: {
    display: 'flex',
    gap: '0',
    width: '100%',
    maxWidth: '620px',
    boxShadow: '0 0 0 1px #1e2a3a',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: '1rem 1.25rem',
    background: '#111827',
    border: 'none',
    color: '#e0e0e0',
    fontSize: '1rem',
    outline: 'none',
  },
  select: {
    padding: '1rem',
    background: '#151d2a',
    border: 'none',
    borderLeft: '1px solid #1e2a3a',
    color: '#9aa3ae',
    fontSize: '0.9rem',
    cursor: 'pointer',
    outline: 'none',
  },
  btn: {
    padding: '1rem 1.5rem',
    background: '#1a73e8',
    border: 'none',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'flex',
    gap: '2rem',
    marginTop: '3rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stat: {
    textAlign: 'center',
  },
  statNum: { fontSize: '1.8rem', fontWeight: 700, color: '#1a73e8' },
  statLabel: { fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' },
  categories: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  catChip: {
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    background: '#111827',
    border: '1px solid #1e2a3a',
    color: '#9aa3ae',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};

const FIELDS = [
  { value: 'all', label: 'All fields' },
  { value: 'phone', label: 'Phone' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'name', label: 'Name' },
  { value: 'id_number', label: 'ID number' },
];

const CATEGORIES = ['Romance', 'Investment', 'Phishing', 'Job', 'Shopping', 'Other'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/results?q=${encodeURIComponent(query.trim())}&field=${field}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/results?q=${cat.toLowerCase()}&field=all`);
  };

  return (
    <div style={s.page}>
      <div style={s.badge}>South Africa's Scam Database</div>
      <h1 style={s.heading}>
        Check Before You <span style={{ color: '#1a73e8' }}>Trust</span>
      </h1>
      <p style={s.sub}>
        Search our verified scammer database by phone number, bank account, name or ID number.
      </p>

      <form style={s.searchBox} onSubmit={handleSearch}>
        <input
          style={s.input}
          type="text"
          placeholder="Enter phone, account number, name or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <select style={s.select} value={field} onChange={(e) => setField(e.target.value)}>
          {FIELDS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <button type="submit" style={s.btn}>Search</button>
      </form>

      <div style={s.categories}>
        {CATEGORIES.map((cat) => (
          <button key={cat} style={s.catChip} onClick={() => handleCategoryClick(cat)}>
            {cat} scams
          </button>
        ))}
      </div>

      <div style={s.stats}>
        <div style={s.stat}>
          <div style={s.statNum}>2,400+</div>
          <div style={s.statLabel}>Reports submitted</div>
        </div>
        <div style={s.stat}>
          <div style={s.statNum}>1,800+</div>
          <div style={s.statLabel}>Verified scammers</div>
        </div>
        <div style={s.stat}>
          <div style={s.statNum}>R42M+</div>
          <div style={s.statLabel}>Losses tracked</div>
        </div>
      </div>
    </div>
  );
}
