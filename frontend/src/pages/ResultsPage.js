import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

const s = {
  page: { minHeight: 'calc(100vh - 60px)', background: '#0A0E14', padding: '2rem 1rem' },
  container: { maxWidth: '800px', margin: '0 auto' },
  searchBar: {
    display: 'flex',
    gap: '0',
    marginBottom: '2rem',
    boxShadow: '0 0 0 1px #1e2a3a',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: '0.85rem 1.25rem',
    background: '#111827',
    border: 'none',
    color: '#e0e0e0',
    fontSize: '1rem',
    outline: 'none',
  },
  btn: {
    padding: '0.85rem 1.25rem',
    background: '#1a73e8',
    border: 'none',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  resultCount: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' },
  card: {
    background: '#0d1117',
    border: '1px solid #1e2a3a',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    transition: 'border-color 0.2s',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  name: { color: '#fff', fontWeight: 600, fontSize: '1.05rem' },
  categoryBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: '#1a2535',
    color: '#1a73e8',
    border: '1px solid #1a3a6e',
  },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' },
  metaItem: { color: '#9aa3ae', fontSize: '0.85rem' },
  metaLabel: { color: '#6b7280', fontSize: '0.75rem' },
  desc: { color: '#c0c8d4', fontSize: '0.9rem', lineHeight: 1.6 },
  amount: { color: '#ef5350', fontWeight: 600 },
  noResults: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280',
  },
  noResultsTitle: { fontSize: '1.2rem', color: '#9aa3ae', marginBottom: '0.5rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#6b7280' },
  verified: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem',
    color: '#4caf50',
    background: '#1a2a1a',
    border: '1px solid #2d5a2d',
    borderRadius: '12px',
    padding: '0.2rem 0.6rem',
    marginLeft: '0.5rem',
  },
};

function ReportCard({ report }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div>
          <span style={s.name}>{report.name || 'Unknown'}</span>
          <span style={s.verified}>✓ Verified</span>
        </div>
        <span style={s.categoryBadge}>{report.category}</span>
      </div>
      <div style={s.meta}>
        {report.phone && (
          <div>
            <div style={s.metaLabel}>Phone</div>
            <div style={s.metaItem}>{report.phone}</div>
          </div>
        )}
        {report.bank_account && (
          <div>
            <div style={s.metaLabel}>Bank account</div>
            <div style={s.metaItem}>{report.bank_account} {report.bank_name && `(${report.bank_name})`}</div>
          </div>
        )}
        {report.id_number && (
          <div>
            <div style={s.metaLabel}>ID number</div>
            <div style={s.metaItem}>{report.id_number}</div>
          </div>
        )}
        {report.amount_lost && (
          <div>
            <div style={s.metaLabel}>Amount lost</div>
            <div style={{ ...s.metaItem, ...s.amount }}>R{report.amount_lost.toLocaleString()}</div>
          </div>
        )}
        <div>
          <div style={s.metaLabel}>Reported</div>
          <div style={s.metaItem}>{new Date(report.created_at).toLocaleDateString('en-ZA')}</div>
        </div>
      </div>
      <p style={s.desc}>{report.description}</p>
    </div>
  );
}

export default function ResultsPage() {
  const [params, setParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(params.get('q') || '');
  const [field] = useState(params.get('field') || 'all');
  const [searched, setSearched] = useState(false);

  const doSearch = async (q, f) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
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
    if (q) {
      setQuery(q);
      doSearch(q, f);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('q'), params.get('field')]);

  const handleSearch = (e) => {
    e.preventDefault();
    setParams({ q: query, field });
    doSearch(query, field);
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <form style={s.searchBar} onSubmit={handleSearch}>
          <input
            style={s.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search again..."
          />
          <button type="submit" style={s.btn}>Search</button>
        </form>

        {loading && <div style={s.loading}>Searching database...</div>}

        {!loading && searched && (
          <div style={s.resultCount}>
            {results.length === 0
              ? 'No verified reports found.'
              : `${results.length} verified report${results.length !== 1 ? 's' : ''} found`}
          </div>
        )}

        {!loading && results.map((r) => <ReportCard key={r.id} report={r} />)}

        {!loading && searched && results.length === 0 && (
          <div style={s.noResults}>
            <div style={s.noResultsTitle}>No matches found</div>
            <p>This person or account hasn't been reported yet. If you've been scammed, please <Link to="/report" style={{ color: '#1a73e8' }}>submit a report</Link>.</p>
          </div>
        )}
      </div>
    </div>
  );
}
