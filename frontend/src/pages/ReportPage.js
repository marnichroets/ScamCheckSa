import React, { useState } from 'react';
import api from '../api';
import useWindowWidth from '../hooks/useWindowWidth';

const CATEGORIES = ['romance', 'investment', 'phishing', 'job', 'shopping', 'other'];

export default function ReportPage() {
  const isMobile = useWindowWidth() < 640;
  const [form, setForm] = useState({
    name: '', phone: '', bank_account: '', bank_name: '',
    id_number: '', amount_lost: '', description: '', category: 'other',
  });
  const [popiChecked, setPopiChecked] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!popiChecked) return;
    setLoading(true);
    setSubmitStatus(null);
    try {
      const payload = { ...form };
      if (payload.amount_lost) payload.amount_lost = parseFloat(payload.amount_lost);
      else delete payload.amount_lost;
      await api.post('/reports/', payload);
      setSubmitStatus({ type: 'success', msg: 'Report submitted! It will be reviewed by our team before being published.' });
      setForm({ name: '', phone: '', bank_account: '', bank_name: '', id_number: '', amount_lost: '', description: '', category: 'other' });
      setPopiChecked(false);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setSubmitStatus({ type: 'error', msg: typeof detail === 'string' ? detail : 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: 'calc(100vh - 60px)', background: '#0A0E14', padding: '3rem 1rem' },
    container: { maxWidth: '640px', margin: '0 auto' },
    title: { fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' },
    sub: { color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 },
    card: { background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '2rem' },
    row: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    field: { marginBottom: '1rem' },
    label: { display: 'block', color: '#9aa3ae', fontSize: '0.85rem', marginBottom: '0.4rem' },
    input: { width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '120px', fontFamily: 'inherit', boxSizing: 'border-box' },
    select: { width: '100%', padding: '0.75rem 1rem', background: '#111827', border: '1px solid #1e2a3a', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' },
    sectionTitle: { color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', marginTop: '1.25rem', borderBottom: '1px solid #1e2a3a', paddingBottom: '0.5rem' },
    popia: { background: '#0a1520', border: '1px solid #1a3a5a', borderRadius: '8px', padding: '1rem', marginTop: '1rem', marginBottom: '1rem' },
    popiaRow: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
    popiaText: { color: '#9aa3ae', fontSize: '0.82rem', lineHeight: 1.6 },
    checkbox: { marginTop: '2px', accentColor: '#1a73e8', flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' },
    btn: { width: '100%', padding: '0.9rem', background: '#1a73e8', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem', opacity: popiChecked ? 1 : 0.5 },
    success: { background: '#1a2a1a', border: '1px solid #2d5a2d', color: '#4caf50', borderRadius: '8px', padding: '1rem', marginTop: '1rem', textAlign: 'center' },
    error: { background: '#2a1a1a', border: '1px solid #5a2d2d', color: '#ef5350', borderRadius: '8px', padding: '1rem', marginTop: '1rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>Report a Scammer</h1>
        <p style={s.sub}>
          Help protect other South Africans. All reports are reviewed before being published.
          Provide as much detail as possible.
        </p>
        <div style={s.card}>
          <form onSubmit={handleSubmit}>
            <div style={s.sectionTitle}>Scammer Identity</div>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Full name</label>
                <input style={s.input} value={form.name} onChange={set('name')} placeholder="e.g. John Doe" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone number</label>
                <input style={s.input} value={form.phone} onChange={set('phone')} placeholder="e.g. 0821234567" />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Bank account</label>
                <input style={s.input} value={form.bank_account} onChange={set('bank_account')} placeholder="Account number" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Bank name</label>
                <input style={s.input} value={form.bank_name} onChange={set('bank_name')} placeholder="e.g. FNB, Capitec" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>SA ID number</label>
              <input style={s.input} value={form.id_number} onChange={set('id_number')} placeholder="13-digit ID number" maxLength={13} />
            </div>

            <div style={s.sectionTitle}>Scam Details</div>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Category</label>
                <select style={s.select} value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Amount lost (ZAR)</label>
                <input style={s.input} type="number" min="0" value={form.amount_lost} onChange={set('amount_lost')} placeholder="e.g. 5000" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>Description <span style={{ color: '#ef5350' }}>*</span></label>
              <textarea
                style={s.textarea}
                value={form.description}
                onChange={set('description')}
                required
                placeholder="Describe what happened — how they contacted you, what they promised, how the scam worked."
              />
            </div>

            {/* POPIA disclaimer */}
            <div style={s.popia}>
              <div style={s.popiaRow}>
                <input
                  type="checkbox"
                  id="popia"
                  style={s.checkbox}
                  checked={popiChecked}
                  onChange={e => setPopiChecked(e.target.checked)}
                />
                <label htmlFor="popia" style={{ ...s.popiaText, cursor: 'pointer' }}>
                  By submitting this report I confirm this is a genuine scam incident and the information
                  provided is accurate to the best of my knowledge. I understand that false reports may
                  result in legal action under the{' '}
                  <strong style={{ color: '#c0c8d4' }}>Protection of Personal Information Act (POPIA)</strong>.
                </label>
              </div>
            </div>

            <button type="submit" style={s.btn} disabled={loading || !popiChecked}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>

          {submitStatus && (
            <div style={submitStatus.type === 'success' ? s.success : s.error}>{submitStatus.msg}</div>
          )}
        </div>
      </div>
    </div>
  );
}
