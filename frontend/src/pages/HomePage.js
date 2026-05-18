import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CATEGORIES = [
  { value: 'romance',    label: 'Romance',    icon: '💔', color: '#E53935', desc: 'Dating & relationship scams' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#E8A01A', desc: 'Ponzi & investment fraud' },
  { value: 'phishing',   label: 'Phishing',   icon: '🎣', color: '#1a73e8', desc: 'Email, SMS & link fraud' },
  { value: 'shopping',   label: 'Shopping',   icon: '🛒', color: '#22C55E', desc: 'Online marketplace scams' },
  { value: 'job',        label: 'Jobs',       icon: '💼', color: '#A855F7', desc: 'Employment & salary fraud' },
  { value: 'other',      label: 'Other',      icon: '⚠️', color: '#64748B', desc: 'All other scam types' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Search', desc: 'Enter a phone number, bank account, name or SA ID number to instantly check our database.' },
  { step: '02', icon: '📋', title: 'Review',  desc: 'See detailed verified reports with risk scores, amounts lost and full scam descriptions.' },
  { step: '03', icon: '🛡️', title: 'Report',  desc: 'Submit new scammer details to help protect other South Africans from being victimised.' },
];

const TRUST = [
  { icon: '🔒', label: 'POPIA Compliant',     sub: 'Privacy protected' },
  { icon: '🤖', label: 'AI Powered',           sub: 'Smart detection' },
  { icon: '✅', label: 'Free Forever',         sub: 'No hidden fees' },
  { icon: '🇿🇦', label: 'South African Built', sub: 'Made for SA' },
];

const TICKER_ITEMS = [
  '🔴 Investment fraud · FNB account · Johannesburg',
  '🔴 Romance scam via WhatsApp · Standard Bank',
  '🔴 Job offer fraud · Cape Town resident',
  '🔴 Phishing SMS · Capitec customers targeted',
  '🔴 Online shopping non-delivery · Pretoria',
  '🔴 Crypto Ponzi scheme · R120 000 lost',
  '🔴 ID theft & impersonation · ABSA Bank',
  '🔴 419 advance-fee fraud · Nedbank account',
];

const FIELDS = [
  { value: 'all',          label: 'All fields' },
  { value: 'phone',        label: 'Phone number' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'name',         label: 'Full name' },
  { value: 'id_number',    label: 'SA ID number' },
];

function fmtAmount(n) {
  if (!n) return 'R0';
  if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `R${(n / 1_000).toFixed(0)}K`;
  return `R${n.toLocaleString('en-ZA')}`;
}

export default function HomePage() {
  const [query,   setQuery]   = useState('');
  const [field,   setField]   = useState('all');
  const [stats,   setStats]   = useState(null);
  const [display, setDisplay] = useState({ total: 0, verified: 0, amount: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports/stats').then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!stats) return;
    let i = 0;
    const steps = 60;
    const t = setInterval(() => {
      i++;
      const p = i / steps;
      setDisplay({
        total:    Math.round(stats.total_reports * p),
        verified: Math.round(stats.verified_reports * p),
        amount:   Math.round(stats.total_amount_lost * p),
      });
      if (i >= steps) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, [stats]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/results?q=${encodeURIComponent(query.trim())}&field=${field}`);
  };

  return (
    <div style={{ background: '#080B10', minHeight: 'calc(100vh - 64px)' }}>
      <style>{`
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        .hero-el { animation: fadeUp 0.55s ease both; }
        .cat-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; cursor: pointer; }
        .cat-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.4) !important; }
        .how-card { transition: border-color 0.18s ease; }
        .how-card:hover { border-color: #1a73e8 !important; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(229,57,53,0.45) !important; }
        .cta-btn { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .search-pill { transition: background 0.15s, color 0.15s; }
        .search-pill:hover { color: #E2E8F0 !important; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(3rem,8vw,6rem) 1.5rem 2.5rem', textAlign: 'center' }}>

        {/* Live badge */}
        <div className="hero-el" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#0D1117', border: '1px solid #1C2636', borderRadius: '999px', padding: '0.4rem 1.1rem', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '2rem', animationDelay: '0s' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          South Africa's #1 Scam Database · Updated in real-time
        </div>

        {/* Headline */}
        <h1 className="hero-el" style={{ fontSize: 'clamp(2.4rem, 7vw, 4.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: '1.25rem', animationDelay: '0.07s' }}>
          Is This Person a{' '}
          <span style={{ background: 'linear-gradient(135deg, #E53935 30%, #FF7043 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Scammer?
          </span>
        </h1>

        <p className="hero-el" style={{ color: '#64748B', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: '500px', margin: '0 auto 2.75rem', lineHeight: 1.75, animationDelay: '0.14s' }}>
          Search our verified database by phone number, bank account, name or SA ID.
          Free. Instant. Trusted by South Africans.
        </p>

        {/* Search bar */}
        <div className="hero-el" style={{ maxWidth: '700px', margin: '0 auto', animationDelay: '0.2s' }}>
          <form
            onSubmit={handleSearch}
            style={{ display: 'flex', background: '#0D1117', border: '2px solid #1C2636', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', transition: 'border-color 0.2s' }}
            onFocus={e => e.currentTarget.style.borderColor = '#E53935'}
            onBlur={e => e.currentTarget.style.borderColor = '#1C2636'}
          >
            <input
              style={{ flex: 1, padding: '1.1rem 1.5rem', background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '1rem', minWidth: 0, outline: 'none' }}
              placeholder="Phone number, bank account, name or ID number..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <select
              style={{ padding: '0 1rem', background: '#12161F', border: 'none', borderLeft: '1px solid #1C2636', color: '#64748B', fontSize: '0.82rem', cursor: 'pointer', outline: 'none', flexShrink: 0 }}
              value={field}
              onChange={e => setField(e.target.value)}
            >
              {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <button
              type="submit"
              style={{ padding: '0 2rem', background: '#E53935', border: 'none', color: '#fff', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.3px', flexShrink: 0, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#c62828'}
              onMouseLeave={e => e.currentTarget.style.background = '#E53935'}
            >
              Search
            </button>
          </form>

          {/* Quick filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className="search-pill"
                onClick={() => navigate(`/results?q=${cat.value}&field=category`)}
                style={{ padding: '0.3rem 0.85rem', borderRadius: '999px', background: '#0D1117', border: '1px solid #1C2636', color: '#64748B', fontSize: '0.78rem', cursor: 'pointer' }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      {stats && (
        <div style={{ background: '#0D1117', borderTop: '1px solid #1C2636', borderBottom: '1px solid #1C2636' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '0', padding: '0' }}>
            {[
              { num: display.total.toLocaleString() + '+', label: 'Reports Submitted', color: '#fff' },
              { num: display.verified.toLocaleString() + '+', label: 'Verified Scammers', color: '#E53935' },
              { num: fmtAmount(display.amount), label: 'Total Losses Tracked', color: '#E8A01A' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1.75rem 2rem', borderRight: i < 2 ? '1px solid #1C2636' : 'none', flex: 1, minWidth: '140px' }}>
                <div style={{ fontSize: '1.85rem', fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>{s.num}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TICKER ── */}
      <div style={{ borderBottom: '1px solid #1C2636', padding: '0.65rem 0', overflow: 'hidden', background: '#0A0E1A' }}>
        <div style={{ display: 'flex', animation: 'tickerScroll 35s linear infinite', width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ color: '#475569', fontSize: '0.775rem', whiteSpace: 'nowrap', padding: '0 2.5rem', fontWeight: 500 }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORY CARDS ── */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 1.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E2E8F0', letterSpacing: '-0.5px' }}>Browse by Scam Type</h2>
          <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.9rem' }}>Find verified reports filtered by category</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.value}
              className="cat-card"
              onClick={() => navigate(`/results?q=${cat.value}&field=category`)}
              style={{ background: '#0D1117', border: '1px solid #1C2636', borderRadius: '14px', padding: '1.5rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '10px', background: '#12161F', border: '1px solid #1C2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div>
                <div style={{ color: cat.color, fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{cat.label} Scams</div>
                <div style={{ color: '#64748B', fontSize: '0.78rem', lineHeight: 1.5 }}>{cat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#E2E8F0', letterSpacing: '-0.5px' }}>How It Works</h2>
          <p style={{ color: '#64748B', marginTop: '0.5rem', fontSize: '0.9rem' }}>Three simple steps to stay scam-free</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="how-card" style={{ background: '#0D1117', border: '1px solid #1C2636', borderRadius: '14px', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '2.5rem', fontWeight: 900, color: '#12161F', lineHeight: 1 }}>{step.step}</div>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#12161F', border: '1px solid #1C2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem' }}>
                {step.icon}
              </div>
              <h3 style={{ color: '#E2E8F0', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.6rem' }}>{step.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <div style={{ background: '#0D1117', borderTop: '1px solid #1C2636', borderBottom: '1px solid #1C2636', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem 2.5rem' }}>
          {TRUST.map((badge, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>{badge.icon}</div>
              <div>
                <div style={{ color: '#E2E8F0', fontWeight: 700, fontSize: '0.875rem' }}>{badge.label}</div>
                <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.1rem' }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '4.5rem 1.5rem 5rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>🛡️</div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 900, color: '#E2E8F0', letterSpacing: '-0.5px', marginBottom: '0.9rem' }}>
          Been Scammed? Report It Now.
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Your report is reviewed by our team and published to protect other South Africans.
          Every submission makes a difference.
        </p>
        <button
          className="cta-btn"
          onClick={() => navigate('/report')}
          style={{ padding: '1rem 2.75rem', background: '#E53935', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(229,57,53,0.3)' }}
        >
          Submit a Report →
        </button>
      </section>
    </div>
  );
}
