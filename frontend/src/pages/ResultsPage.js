import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

const PAGE_SIZE = 12;

const SEARCH_FIELDS = [
  { value: 'all',          label: 'All fields' },
  { value: 'phone',        label: 'Phone' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'name',         label: 'Name' },
  { value: 'id_number',    label: 'ID number' },
  { value: 'category',     label: 'Category' },
];

const CAT_FILTERS = [
  { value: 'all',        label: 'All', icon: '🔍' },
  { value: 'romance',    label: 'Romance',    icon: '💔' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'phishing',   label: 'Phishing',   icon: '🎣' },
  { value: 'shopping',   label: 'Shopping',   icon: '🛒' },
  { value: 'job',        label: 'Jobs',       icon: '💼' },
  { value: 'other',      label: 'Other',      icon: '⚠️' },
];

const CAT_COLORS = {
  romance:    '#E53935',
  investment: '#E8A01A',
  phishing:   '#1a3c6e',
  shopping:   '#22C55E',
  job:        '#A855F7',
  other:      '#64748B',
};

function getRiskScore(r) {
  let s = 0;
  if (r.phone)        s += 20;
  if (r.bank_account) s += 25;
  if (r.id_number)    s += 30;
  if (r.name)         s += 10;
  if (r.amount_lost > 0) s += 10;
  if (r.source === 'facebook') s += 5;
  return Math.min(s, 100);
}

function getRiskLevel(score) {
  if (score >= 70) return { label: 'HIGH RISK',   color: '#EF5350', bg: 'rgba(239,83,80,0.1)',   border: 'rgba(239,83,80,0.3)' };
  if (score >= 40) return { label: 'MEDIUM RISK', color: '#FF7043', bg: 'rgba(255,112,67,0.1)', border: 'rgba(255,112,67,0.3)' };
  return               { label: 'LOW RISK',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)' };
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('');
}

function ReportCard({ report }) {
  const navigate = useNavigate();
  const score = getRiskScore(report);
  const risk  = getRiskLevel(score);
  const cat   = report.category || 'other';
  const catColor = CAT_COLORS[cat] || '#64748B';
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/scammer/${report.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0D1117',
        border: `1px solid ${hovered ? '#2e7d32' : '#1C2636'}`,
        borderRadius: '14px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        display: 'flex',
        gap: '1.1rem',
      }}
    >
      {/* Avatar */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: `${catColor}20`, border: `1px solid ${catColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: catColor }}>
          {getInitials(report.name)}
        </div>
        {/* Risk pill */}
        <div style={{ padding: '0.2rem 0.45rem', borderRadius: '6px', background: risk.bg, border: `1px solid ${risk.border}`, color: risk.color, fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          {risk.label}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <div>
            <div style={{ color: '#E2E8F0', fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>
              {report.name || 'Unknown Scammer'}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '999px', padding: '0.15rem 0.55rem' }}>✓ Verified</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30`, borderRadius: '999px', padding: '0.15rem 0.55rem' }}>
                {CAT_FILTERS.find(c => c.value === cat)?.icon} {cat}
              </span>
            </div>
          </div>

          {/* Risk score */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: risk.color, lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Risk Score</div>
            {/* Mini bar */}
            <div style={{ width: 48, height: 3, background: '#1C2636', borderRadius: '2px', marginTop: '0.3rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: risk.color, borderRadius: '2px' }} />
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', marginBottom: '0.75rem' }}>
          {report.phone        && <Meta label="Phone"        value={report.phone} />}
          {report.bank_account && <Meta label="Bank" value={`${report.bank_account}${report.bank_name ? ` · ${report.bank_name}` : ''}`} />}
          {report.id_number    && <Meta label="ID"           value={report.id_number} />}
          {report.amount_lost > 0 && <Meta label="Lost" value={`R${report.amount_lost.toLocaleString('en-ZA')}`} red />}
          <Meta label="Reported" value={new Date(report.created_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })} />
        </div>

        {report.description && (
          <p style={{ color: '#64748B', fontSize: '0.825rem', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {report.description}
          </p>
        )}
      </div>
    </div>
  );
}

function Meta({ label, value, red }) {
  return (
    <div>
      <div style={{ color: '#475569', fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ color: red ? '#EF5350' : '#94A3B8', fontSize: '0.82rem', fontFamily: label !== 'Reported' ? 'monospace' : 'inherit', fontWeight: red ? 700 : 400 }}>{value}</div>
    </div>
  );
}

export default function ResultsPage() {
  const [params,  setParams]  = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page,    setPage]    = useState(0);
  const [query,   setQuery]   = useState(params.get('q') || '');
  const [field,   setField]   = useState(params.get('field') || 'all');
  const [catFilter,  setCatFilter]  = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy,     setSortBy]     = useState('newest');

  const doSearch = useCallback(async (q, f) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setPage(0);
    try {
      const { data } = await api.get('/reports/search', { params: { q: q.trim(), field: f } });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = params.get('q');
    const f = params.get('field') || 'all';
    if (q) { setQuery(q); setField(f); doSearch(q, f); }
  }, [params, doSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    setParams({ q: query, field });
    doSearch(query, field);
  };

  // Client-side filtering & sorting
  const filtered = results
    .filter(r => catFilter === 'all' || r.category === catFilter)
    .filter(r => {
      if (riskFilter === 'all') return true;
      const s = getRiskScore(r);
      if (riskFilter === 'high')   return s >= 70;
      if (riskFilter === 'medium') return s >= 40 && s < 70;
      return s < 40;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return (b.amount_lost || 0) - (a.amount_lost || 0);
      if (sortBy === 'risk')   return getRiskScore(b) - getRiskScore(a);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageResults = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const FilterPill = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.85rem', borderRadius: '999px',
        background: active ? '#2e7d32' : '#0D1117',
        border: `1px solid ${active ? '#2e7d32' : '#1C2636'}`,
        color: active ? '#fff' : '#64748B',
        fontSize: '0.78rem', fontWeight: active ? 700 : 400,
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#080B10', padding: '1.75rem 1rem 4rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', background: '#0D1117', border: '1px solid #1C2636', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          <input
            style={{ flex: 1, padding: '0.9rem 1.25rem', background: 'transparent', border: 'none', color: '#E2E8F0', fontSize: '0.95rem', outline: 'none', minWidth: 0 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search the database..."
          />
          <select
            style={{ padding: '0 0.75rem', background: '#12161F', border: 'none', borderLeft: '1px solid #1C2636', color: '#64748B', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
            value={field}
            onChange={e => setField(e.target.value)}
          >
            {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button
            type="submit"
            style={{ padding: '0 1.25rem', background: '#2e7d32', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        {/* Filter bar */}
        {searched && results.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>Category:</span>
              {CAT_FILTERS.map(c => (
                <FilterPill key={c.value} active={catFilter === c.value} onClick={() => { setCatFilter(c.value); setPage(0); }}>
                  {c.icon} {c.label}
                </FilterPill>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>Risk:</span>
              {[
                { value: 'all',    label: 'All' },
                { value: 'high',   label: '🔴 High' },
                { value: 'medium', label: '🟠 Medium' },
                { value: 'low',    label: '🟢 Low' },
              ].map(r => (
                <FilterPill key={r.value} active={riskFilter === r.value} onClick={() => { setRiskFilter(r.value); setPage(0); }}>{r.label}</FilterPill>
              ))}
              <div style={{ width: 1, height: 20, background: '#1C2636', margin: '0 0.25rem' }} />
              <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '0.25rem' }}>Sort:</span>
              {[
                { value: 'newest', label: 'Newest' },
                { value: 'risk',   label: 'Risk Score' },
                { value: 'amount', label: 'Amount Lost' },
              ].map(s => (
                <FilterPill key={s.value} active={sortBy === s.value} onClick={() => { setSortBy(s.value); setPage(0); }}>{s.label}</FilterPill>
              ))}
            </div>
          </div>
        )}

        {/* Result count */}
        {!loading && searched && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
              {filtered.length === 0
                ? 'No verified reports found'
                : <><span style={{ color: '#E2E8F0', fontWeight: 700 }}>{filtered.length}</span> verified report{filtered.length !== 1 ? 's' : ''} found</>
              }
              {results.length !== filtered.length && ` (${results.length} total, filtered)`}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ width: 44, height: 44, border: '3px solid #1C2636', borderTopColor: '#2e7d32', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#64748B', fontSize: '0.9rem' }}>Searching database...</div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Results */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pageResults.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#0D1117', border: '1px solid #1C2636', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ color: '#E2E8F0', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {results.length > 0 ? 'No results match your filters' : 'No matches found'}
            </div>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
              {results.length > 0
                ? 'Try adjusting your filters above.'
                : "This person hasn't been reported yet. If you've been scammed, submit a report to warn others."
              }
            </p>
            {results.length === 0 && (
              <Link to="/report" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: '#2e7d32', color: '#fff', fontWeight: 700, borderRadius: '10px', textDecoration: 'none', fontSize: '0.875rem' }}>
                Submit a Report
              </Link>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#475569' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔎</div>
            <div style={{ fontSize: '1rem', color: '#64748B' }}>Enter a name, phone, bank account or ID to search</div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
            <button
              disabled={page === 0}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ padding: '0.6rem 1.25rem', background: page === 0 ? 'transparent' : '#0D1117', border: '1px solid #1C2636', borderRadius: '8px', color: page === 0 ? '#1C2636' : '#94A3B8', cursor: page === 0 ? 'default' : 'pointer', fontSize: '0.875rem' }}
            >
              ← Previous
            </button>
            <span style={{ color: '#64748B', fontSize: '0.875rem' }}>Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ padding: '0.6rem 1.25rem', background: page >= totalPages - 1 ? 'transparent' : '#0D1117', border: '1px solid #1C2636', borderRadius: '8px', color: page >= totalPages - 1 ? '#1C2636' : '#94A3B8', cursor: page >= totalPages - 1 ? 'default' : 'pointer', fontSize: '0.875rem' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
