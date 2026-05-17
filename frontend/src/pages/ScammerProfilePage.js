import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

function getRiskScore(report) {
  let score = 0;
  if (report.phone) score += 20;
  if (report.bank_account) score += 25;
  if (report.id_number) score += 30;
  if (report.name) score += 10;
  if (report.amount_lost > 0) score += 10;
  if (report.source === 'facebook') score += 5;
  return Math.min(score, 100);
}

function getRiskLevel(score) {
  if (score <= 30) return { label: 'Low Risk',    color: '#4caf50', bg: '#1a2a1a', border: '#2d5a2d' };
  if (score <= 65) return { label: 'Medium Risk', color: '#ff7043', bg: '#2a1a12', border: '#7a3a20' };
  return              { label: 'High Risk',   color: '#ef5350', bg: '#2a1a1a', border: '#5a2d2d' };
}

const s = {
  page: { minHeight: 'calc(100vh - 60px)', background: '#0A0E14', padding: '2rem 1rem' },
  container: { maxWidth: '720px', margin: '0 auto' },
  back: { color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.5rem' },
  hero: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '1.75rem', marginBottom: '1rem' },
  heroTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' },
  name: { color: '#fff', fontSize: '1.5rem', fontWeight: 800 },
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#1a2a1a', border: '1px solid #2d5a2d', color: '#4caf50', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 },
  catBadge: { background: '#1a2535', border: '1px solid #1a3a6e', color: '#5b9cf6', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 },
  heroMeta: { color: '#6b7280', fontSize: '0.85rem' },
  riskBar: { marginTop: '1.25rem' },
  riskLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' },
  riskText: { fontSize: '0.8rem', color: '#6b7280' },
  barTrack: { height: '6px', background: '#1e2a3a', borderRadius: '3px', overflow: 'hidden' },
  section: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
  sectionTitle: { color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.6rem 1.5rem' },
  fieldLabel: { color: '#6b7280', fontSize: '0.875rem', whiteSpace: 'nowrap', paddingTop: '2px' },
  fieldVal: { color: '#e0e0e0', fontSize: '0.875rem', fontFamily: 'monospace' },
  desc: { color: '#c0c8d4', lineHeight: 1.7, fontSize: '0.9rem' },
  amount: { color: '#ef5350', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' },
  actions: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  btnPrimary: { padding: '0.8rem 1.5rem', background: '#1a73e8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' },
  btnSecondary: { padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid #1e2a3a', borderRadius: '8px', color: '#9aa3ae', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' },
  shareBtn: { padding: '0.8rem 1.5rem', background: '#1a2a1a', border: '1px solid #2d5a2d', borderRadius: '8px', color: '#4caf50', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  loading: { textAlign: 'center', color: '#6b7280', padding: '4rem' },
  notFound: { textAlign: 'center', padding: '4rem 2rem' },
  notFoundTitle: { color: '#fff', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' },
  notFoundSub: { color: '#6b7280', marginBottom: '1.5rem' },
};

function Field({ label, value, mono = true }) {
  if (!value && value !== 0) return null;
  return (
    <>
      <div style={s.fieldLabel}>{label}</div>
      <div style={mono ? s.fieldVal : { ...s.fieldVal, fontFamily: 'inherit' }}>{value}</div>
    </>
  );
}

export default function ScammerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(({ data }) => setReport(data))
      .catch(err => { if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <div style={s.page}><div style={s.loading}>Loading report...</div></div>;

  if (notFound) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <div style={s.notFound}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <div style={s.notFoundTitle}>Report not found</div>
            <p style={s.notFoundSub}>This report may not exist, may be under review, or may have been removed.</p>
            <Link to="/" style={s.btnPrimary}>Back to search</Link>
          </div>
        </div>
      </div>
    );
  }

  const score = getRiskScore(report);
  const risk = getRiskLevel(score);
  const hasIdentifiers = report.phone || report.bank_account || report.id_number;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={{ ...s.back, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => navigate(-1)}>← Back</button>

        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroTop}>
            <div>
              <h1 style={s.name}>{report.name || 'Unknown Scammer'}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span style={s.verifiedBadge}>✓ Verified</span>
                <span style={s.catBadge}>{report.category}</span>
              </div>
            </div>
            <div style={{ background: risk.bg, border: `1px solid ${risk.border}`, color: risk.color, borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {risk.label}
            </div>
          </div>
          <div style={s.heroMeta}>
            Reported {new Date(report.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
            {report.source !== 'manual' && ` · Source: ${report.source}`}
          </div>

          {/* Risk bar */}
          <div style={s.riskBar}>
            <div style={s.riskLabel}>
              <span style={s.riskText}>Risk score</span>
              <span style={{ ...s.riskText, color: risk.color, fontWeight: 600 }}>{score}/100</span>
            </div>
            <div style={s.barTrack}>
              <div style={{ height: '100%', width: `${score}%`, background: risk.color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>

        {/* Identifiers */}
        {hasIdentifiers && (
          <div style={s.section}>
            <div style={s.sectionTitle}>Identifiers</div>
            <div style={s.grid}>
              <Field label="Phone" value={report.phone} />
              <Field label="Bank account" value={report.bank_account ? `${report.bank_account}${report.bank_name ? ` (${report.bank_name})` : ''}` : null} />
              <Field label="ID number" value={report.id_number} />
            </div>
          </div>
        )}

        {/* Scam details */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Scam details</div>
          {report.amount_lost > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Amount lost</div>
              <div style={s.amount}>R{report.amount_lost.toLocaleString('en-ZA')}</div>
            </div>
          )}
          <p style={s.desc}>{report.description}</p>
        </div>

        {/* Actions */}
        <div style={s.section}>
          <div style={s.sectionTitle}>Actions</div>
          <div style={s.actions}>
            <Link to="/report" style={s.btnPrimary}>+ Report this scammer too</Link>
            <a href="https://trusttrade.co.za" target="_blank" rel="noopener noreferrer" style={s.btnSecondary}>
              Check on TrustTrade ↗
            </a>
            <button style={s.shareBtn} onClick={copyLink}>
              {copied ? '✓ Link copied!' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
