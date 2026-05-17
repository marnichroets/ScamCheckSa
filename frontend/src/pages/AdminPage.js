import React, { useEffect, useState, useCallback, useRef } from 'react';
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

  // FB parser section
  fbSection: {
    background: '#0d1117',
    border: '1px solid #1e2a3a',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  fbTitle: { color: '#9aa3ae', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0', alignItems: 'stretch' },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: '#111827',
    border: '1px solid #1e2a3a',
    borderRadius: '8px',
    color: '#e0e0e0',
    fontSize: '0.9rem',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  orDivider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1rem',
    color: '#3d4f63',
    fontSize: '0.8rem',
    fontWeight: 600,
    gap: '0.5rem',
  },
  orLine: { width: '1px', flex: 1, background: '#1e2a3a' },
  dropZone: (dragging, hasFile) => ({
    border: `2px dashed ${dragging ? '#1a73e8' : hasFile ? '#2d5a2d' : '#1e2a3a'}`,
    borderRadius: '8px',
    background: dragging ? '#0d1e35' : hasFile ? '#0d1a0d' : '#111827',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    minHeight: '120px',
    padding: '1rem',
    gap: '0.5rem',
  }),
  dropIcon: { fontSize: '1.6rem', lineHeight: 1 },
  dropLabel: { color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' },
  dropHint: { color: '#3d4f63', fontSize: '0.75rem' },
  imgPreview: {
    width: '100%',
    maxHeight: '180px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: '1px solid #2d5a2d',
  },
  clearImg: {
    background: 'none',
    border: '1px solid #3d4f63',
    borderRadius: '4px',
    color: '#6b7280',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '0.2rem 0.5rem',
    alignSelf: 'flex-end',
  },
  parseRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' },
  parseBtn: {
    padding: '0.75rem 1.5rem',
    background: '#1a73e8',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  parsedCard: {
    background: '#111827',
    border: '1px solid #1a3a6e',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
  },
  parsedGrid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1rem' },
  parsedField: { color: '#6b7280', fontSize: '0.85rem', whiteSpace: 'nowrap' },
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
  errorMsg: { color: '#ef5350', fontSize: '0.85rem', marginTop: '0.75rem' },

  // report cards
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
  return (
    <div style={s.meta}>
      {parts.join('  ·  ')} · {report.category} · {new Date(report.created_at).toLocaleDateString('en-ZA')}
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // FB parser state
  const [fbText, setFbText] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // clean up object URL on unmount or image change
  useEffect(() => {
    return () => { if (imgPreview) URL.revokeObjectURL(imgPreview); };
  }, [imgPreview]);

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

  const applyFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setParsed(null);
    setParseError('');
  };

  const clearImage = () => {
    if (imgPreview) URL.revokeObjectURL(imgPreview);
    setImgFile(null);
    setImgPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    applyFile(file);
  };

  const parseFacebook = async () => {
    if (!fbText.trim() && !imgFile) return;
    setParsing(true);
    setParseError('');
    setParsed(null);
    try {
      const formData = new FormData();
      if (fbText.trim()) formData.append('text', fbText.trim());
      if (imgFile) formData.append('file', imgFile);
      const { data } = await api.post('/admin/parse-facebook-post', formData);
      setParsed(data.extracted);
    } catch (err) {
      setParseError(err.response?.data?.detail || 'Parsing failed. Check your API key and try again.');
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
      clearImage();
      alert('Report submitted for review.');
    } catch (err) {
      alert(err.response?.data?.detail || 'Submission failed.');
    }
  };

  const canParse = (fbText.trim().length > 0 || imgFile) && !parsing;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <h1 style={s.title}>Admin Panel</h1>
        </div>

        {/* Facebook Parser */}
        <div style={s.fbSection}>
          <div style={s.fbTitle}>Facebook Post Parser — paste text, upload a screenshot, or both</div>

          <div style={s.inputGrid}>
            {/* Text input */}
            <textarea
              style={s.textarea}
              value={fbText}
              onChange={(e) => { setFbText(e.target.value); setParsed(null); setParseError(''); }}
              placeholder="Paste raw Facebook post text here (optional)..."
            />

            {/* OR divider */}
            <div style={s.orDivider}>
              <div style={s.orLine} />
              <span>OR</span>
              <div style={s.orLine} />
            </div>

            {/* Image drop zone */}
            <div
              style={s.dropZone(dragging, !!imgFile)}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {imgPreview ? (
                <>
                  <img src={imgPreview} alt="preview" style={s.imgPreview} />
                  <button
                    style={s.clearImg}
                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <span style={s.dropIcon}>📷</span>
                  <span style={s.dropLabel}>Upload screenshot</span>
                  <span style={s.dropHint}>Click or drag & drop · JPEG, PNG, WebP</span>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => applyFile(e.target.files[0])}
          />

          <div style={s.parseRow}>
            <button style={s.parseBtn} onClick={parseFacebook} disabled={!canParse}>
              {parsing ? 'Parsing with AI...' : 'Parse with AI'}
            </button>
          </div>

          {parseError && <div style={s.errorMsg}>{parseError}</div>}

          {parsed && (
            <div style={s.parsedCard}>
              <div style={s.parsedGrid}>
                {Object.entries(parsed)
                  .filter(([k, v]) => k !== 'source' && v !== null && v !== undefined)
                  .map(([k, v]) => (
                    <React.Fragment key={k}>
                      <div style={s.parsedField}>{k.replace(/_/g, ' ')}</div>
                      <div style={s.parsedVal}>{String(v)}</div>
                    </React.Fragment>
                  ))}
              </div>
              <button style={s.approveBtn} onClick={submitParsed}>
                Submit as Pending Report
              </button>
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
        {!loading && reports.length === 0 && <div style={s.empty}>No {tab} reports.</div>}

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
                <button style={s.actionBtn('verify')} onClick={() => updateStatus(report.id, 'verified')}>Verify</button>
              )}
              {report.status !== 'rejected' && (
                <button style={s.actionBtn('reject')} onClick={() => updateStatus(report.id, 'rejected')}>Reject</button>
              )}
              <button style={s.actionBtn('delete')} onClick={() => deleteReport(report.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
