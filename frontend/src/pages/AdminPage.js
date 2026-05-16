import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const s = {
  page: { minHeight: 'calc(100vh - 60px)', background: '#0A0E14', padding: '2rem 1rem' },
  container: { maxWidth: '960px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: (active) => ({
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: '1px solid ' + (active ? '#1a73e8' : '#1e2a3a'),
    background: active ? '#1a2a4a' : 'transparent',
    color: active ? '#1a73e8' : '#6b7280',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 400,
  }),
  fbSection: {
    background: '#0d1117',
    border: '1px solid #1e2a3a',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  fbTitle: { color: '#9aa3ae', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 600 },
  fbRow: { display: 'flex', gap: '0.75rem' },
  textarea: {
    flex: 1,
    padding: '0.75rem',
    background: '#111827',
    border: '1px solid #1e2a3a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '90px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  parseBtn: {
    padding: '0.75rem 1.25rem',
    background: '#1a73e8',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },
  parsedCard: {
    background: '#111827',
    border: '1px solid #1a3a6e',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
  },
  parsedRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' },
  parsedField: { color: '#9aa3ae', fontSize: '0.85rem' },
  parsedVal: { color: '#e0e0e0', fontSize: '0.85rem' },
  approveBtn: {
    padding: '0.5rem 1rem',
    background: '#1a73e8',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginTop: '0.75rem',
  },
  card: {
    background: '#0d1117',
    border: '1px solid #1e2a3a',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '0.75rem',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  reportName: { color: '#fff', fontWeight: 600 },
  meta: { color: '#6b7280', fontSize: '0.82rem', marginBottom: '0.5rem' },
  desc: { color: '#9aa3ae', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  actionBtn: (type) => ({
    padding: '0.45rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    background: type === 'verify' ? '#1a4a1a' : type === 'reject' ? '#4a1a1a' : '#1a2a4a',
    color: type === 'verify' ? '#4caf50' : type === 'reject' ? '#ef5350' : '#1a73e8',
  }),
  badge: (status) => ({
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: status === 'pending' ? '#2a2a1a' : status === 'verified' ? '#1a2a1a' : '#2a1a1a',
    color: status === 'pending' ? '#e8a01a' : status === 'verified' ? '#4caf50' : '#ef5350',
  }),
  empty: { textAlign: 'center', color: '#6b7280', padding: '3rem' },
};

function MetaLine({ report }) {
  const parts = [];
  if (report.phone) parts.push(`📞 ${report.phone}`);
  if (report.bank_account) parts.push(`🏦 ${report.bank_account}${report.bank_name ? ` (${report.bank_name})` : ''}`);
  if (report.id_number) parts.push(`🪪 ${report.id_number}`);
  if (report.amount_lost) parts.push(`💸 R${report.amount_lost.toLocaleString()}`);
  return <div style={s.meta}>{parts.join('  ·  ')} · {report.category} · {new Date(report.created_at).toLocaleDateString('en-ZA')}</div>;
}

export default function AdminPage() {
  const [tab, setTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fbText, setFbText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const navigate = useNavigate();

  const fetchReports = useCallback(async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports', { params: { status } });
      setReports(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchReports(tab); }, [tab, fetchReports]);

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/reports/${id}`, { status });
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    await api.delete(`/admin/reports/${id}`);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const parseFacebook = async () => {
    if (!fbText.trim()) return;
    setParsing(true);
    setParseError('');
    setParsed(null);
    try {
      const { data } = await api.post('/admin/parse-facebook-post', { text: fbText });
      setParsed(data.extracted);
    } catch (err) {
      setParseError(err.response?.data?.detail || 'Parsing failed.');
    } finally {
      setParsing(false);
    }
  };

  const submitParsed = async () => {
    if (!parsed) return;
    try {
      await api.post('/reports/', { ...parsed, source: 'facebook' });
      setParsed(null);
      setFbText('');
      alert('Report submitted for review.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed.');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Admin Panel</h1>
        </div>

        {/* Facebook Parser */}
        <div style={s.fbSection}>
          <div style={s.fbTitle}>Facebook Post Parser (AI-powered)</div>
          <div style={s.fbRow}>
            <textarea
              style={s.textarea}
              value={fbText}
              onChange={(e) => setFbText(e.target.value)}
              placeholder="Paste a Facebook scam post here and Claude will extract the scammer's details..."
            />
            <button style={s.parseBtn} onClick={parseFacebook} disabled={parsing}>
              {parsing ? 'Parsing...' : 'Parse with AI'}
            </button>
          </div>
          {parseError && <div style={{ color: '#ef5350', fontSize: '0.85rem', marginTop: '0.5rem' }}>{parseError}</div>}
          {parsed && (
            <div style={s.parsedCard}>
              <div style={s.parsedRow}>
                {Object.entries(parsed).filter(([k]) => k !== 'source').map(([k, v]) => v && (
                  <React.Fragment key={k}>
                    <div style={s.parsedField}>{k.replace(/_/g, ' ')}</div>
                    <div style={s.parsedVal}>{String(v)}</div>
                  </React.Fragment>
                ))}
              </div>
              <button style={s.approveBtn} onClick={submitParsed}>Submit as Pending Report</button>
            </div>
          )}
        </div>

        {/* Report Queue */}
        <div style={s.tabs}>
          {['pending', 'verified', 'rejected'].map((t) => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading && <div style={s.empty}>Loading reports...</div>}

        {!loading && reports.length === 0 && (
          <div style={s.empty}>No {tab} reports.</div>
        )}

        {!loading && reports.map((report) => (
          <div key={report.id} style={s.card}>
            <div style={s.cardTop}>
              <span style={s.reportName}>{report.name || 'Unknown'}</span>
              <span style={s.badge(report.status)}>{report.status}</span>
            </div>
            <MetaLine report={report} />
            <p style={s.desc}>{report.description}</p>
            <div style={s.actions}>
              {report.status !== 'verified' && (
                <button style={s.actionBtn('verify')} onClick={() => updateStatus(report.id, 'verified')}>
                  Verify
                </button>
              )}
              {report.status !== 'rejected' && (
                <button style={s.actionBtn('reject')} onClick={() => updateStatus(report.id, 'rejected')}>
                  Reject
                </button>
              )}
              <button style={s.actionBtn('delete')} onClick={() => deleteReport(report.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
