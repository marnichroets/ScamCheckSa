import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import useWindowWidth from '../hooks/useWindowWidth';

const PAGE_SIZE = 10;

const FIELDS = [
  { value: 'all',          label: 'All fields' },
  { value: 'phone',        label: 'Phone' },
  { value: 'bank_account', label: 'Bank account' },
  { value: 'name',         label: 'Name' },
  { value: 'id_number',    label: 'ID number' },
  { value: 'category',     label: 'Category' },
];

function ReportCard({ report }) {
  const navigate = useNavigate();
  const s = {
    card: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '1.5rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'border-color 0.15s' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' },
    name: { color: '#fff', fontWeight: 600, fontSize: '1.05rem' },
    verified: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#4caf50', background: '#1a2a1a', border: '1px solid #2d5a2d', borderRadius: '12px', padding: '0.2rem 0.6rem', marginLeft: '0.5rem' },
    catBadge: { padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: '#1a2535', color: '#5b9cf6', border: '1px solid #1a3a6e', whiteSpace: 'nowrap' },
    meta: { display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' },
    metaItem: { color: '#9aa3ae', fontSize: '0.85rem' },
    metaLabel: { color: '#6b7280', fontSize: '0.75rem' },
    desc: { color: '#c0c8d4', fontSize: '0.875rem', lineHeight: 1.6 },
    viewLink: { display: 'block', textAlign: 'right', color: '#1a73e8', fontSize: '0.8rem', marginTop: '0.75rem', textDecoration: 'none' },
  };

  return (
    <div style={s.card} onClick={() => navigate(`/scammer/${report.id}`)}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#1a73e8'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2a3a'}
    >
      <div style={s.header}>
        <div>
          <span style={s.name}>{report.name || 'Unknown'}</span>
          <span style={s.verified}>✓ Verified</span>
        </div>
        <span style={s.catBadge}>{report.category}</span>
      </div>
      <div style={s.meta}>
        {report.phone && <div><div style={s.metaLabel}>Phone</div><div style={s.metaItem}>{report.phone}</div></div>}
        {report.bank_account && <div><div style={s.metaLabel}>Bank account</div><div style={s.metaItem}>{report.bank_account}{report.bank_name && ` (${report.bank_name})`}</div></div>}
        {report.id_number && <div><div style={s.metaLabel}>ID number</div><div style={s.metaItem}>{report.id_number}</div></div>}
        {report.amount_lost > 0 && <div><div style={s.metaLabel}>Amount lost</div><div style={{ ...s.metaItem, color: '#ef5350', fontWeight: 600 }}>R{report.amount_lost.toLocaleString('en-ZA')}</div></div>}
        <div><div style={s.metaLabel}>Reported</div><div style={s.metaItem}>{new Date(report.created_at).toLocaleDateString('en-ZA')}</div></div>
      </div>
      <p style={s.desc}>{report.description}</p>
      <span style={s.viewLink}>View full profile →</span>
    </div>
  );
}

export default function ResultsPage() {
  const isMobile = useWindowWidth() < 640;
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(0);

  const [query, setQuery] = useState(params.get('q') || '');
  const [field, setField] = useState(params.get('field') || 'all');

  const doSearch = async (q, f) => {
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
  };

  useEffect(() => {
    const q = params.get('q');
    const f = params.get('field') || 'all';
    if (q) { setQuery(q); setField(f); doSearch(q, f); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('q'), params.get('field')]);

  const handleSearch = (e) => {
    e.preventDefault();
    setParams({ q: query, field });
    doSearch(query, field);
  };

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const pageResults = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const s = {
    page: { minHeight: 'calc(100vh - 60px)', background: '#0A0E14', padding: '2rem 1rem' },
    container: { maxWidth: '800px', margin: '0 auto' },
    searchBar: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', marginBottom: '1.5rem', boxShadow: '0 0 0 1px #1e2a3a', borderRadius: '10px', overflow: 'hidden' },
    input: { flex: 1, padding: '0.85rem 1.25rem', background: '#111827', border: 'none', color: '#e0e0e0', fontSize: '1rem', outline: 'none', minWidth: 0 },
    select: { padding: '0.85rem 1rem', background: '#151d2a', border: isMobile ? '1px solid #1e2a3a' : 'none', borderLeft: isMobile ? 'none' : '1px solid #1e2a3a', color: '#9aa3ae', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' },
    btn: { padding: '0.85rem 1.25rem', background: '#1a73e8', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', borderTop: isMobile ? '1px solid #1e2a3a' : 'none' },
    resultCount: { color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' },
    noResults: { textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' },
    pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', paddingBottom: '2rem' },
    pgBtn: (disabled) => ({ padding: '0.5rem 1.25rem', background: disabled ? '#0d1117' : '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', color: disabled ? '#3d4f63' : '#9aa3ae', cursor: disabled ? 'default' : 'pointer', fontSize: '0.875rem' }),
    pgInfo: { color: '#6b7280', fontSize: '0.875rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <form style={s.searchBar} onSubmit={handleSearch}>
          <input style={s.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search again..." />
          <select style={s.select} value={field} onChange={e => setField(e.target.value)}>
            {FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button type="submit" style={s.btn}>Search</button>
        </form>

        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Searching database...</div>}

        {!loading && searched && (
          <div style={s.resultCount}>
            {results.length === 0
              ? 'No verified reports found.'
              : `${results.length} verified report${results.length !== 1 ? 's' : ''} found`}
          </div>
        )}

        {!loading && pageResults.map(r => <ReportCard key={r.id} report={r} />)}

        {!loading && searched && results.length === 0 && (
          <div style={s.noResults}>
            <div style={{ fontSize: '1.2rem', color: '#9aa3ae', marginBottom: '0.5rem' }}>No matches found</div>
            <p>This person or account hasn't been reported yet. If you've been scammed, <Link to="/report" style={{ color: '#1a73e8' }}>submit a report</Link>.</p>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div style={s.pagination}>
            <button style={s.pgBtn(page === 0)} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Previous</button>
            <span style={s.pgInfo}>Page {page + 1} of {totalPages}</span>
            <button style={s.pgBtn(page >= totalPages - 1)} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
