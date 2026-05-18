import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STEPS = [
  { num: 1, label: 'Scammer Details', short: 'Details', icon: '👤' },
  { num: 2, label: 'Scam Info',       short: 'Info',    icon: '📝' },
  { num: 3, label: 'Evidence',        short: 'Evidence',icon: '📎' },
  { num: 4, label: 'Confirm',         short: 'Confirm', icon: '✅' },
];

const CAT_OPTIONS = [
  { value: 'romance',    label: 'Romance',    icon: '💔', color: '#E53935' },
  { value: 'investment', label: 'Investment', icon: '📈', color: '#E8A01A' },
  { value: 'phishing',   label: 'Phishing',   icon: '🎣', color: '#1a73e8' },
  { value: 'shopping',   label: 'Shopping',   icon: '🛒', color: '#22C55E' },
  { value: 'job',        label: 'Job',        icon: '💼', color: '#A855F7' },
  { value: 'other',      label: 'Other',      icon: '⚠️', color: '#64748B' },
];

const BANKS = ['FNB', 'Capitec', 'ABSA', 'Standard Bank', 'Nedbank', 'Discovery Bank', 'TymeBank', 'African Bank', 'Other'];

const INPUT = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: '#12161F',
  border: '1px solid #1C2636',
  borderRadius: '10px',
  color: '#E2E8F0',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const LABEL = { display: 'block', color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' };

function Field({ label, optional, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={LABEL}>
        {label}
        {optional && <span style={{ color: '#475569', fontWeight: 400, marginLeft: '0.4rem', textTransform: 'none', letterSpacing: 0 }}>optional</span>}
      </label>
      {children}
    </div>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step,        setStep]        = useState(1);
  const [stepError,   setStepError]   = useState('');
  const [dragging,    setDragging]    = useState(false);
  const [files,       setFiles]       = useState([]);
  const [popiChecked, setPopiChecked] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', bank_account: '', bank_name: '',
    id_number: '', category: 'other', amount_lost: '',
    description: '', evidence_notes: '',
  });

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (stepError) setStepError('');
  };

  const validateStep = (s) => {
    if (s === 1 && !form.name && !form.phone && !form.bank_account && !form.id_number) {
      setStepError('Please provide at least one identifier: name, phone number, bank account or ID number.');
      return false;
    }
    if (s === 2 && !form.description.trim()) {
      setStepError('Please describe the scam. This helps our team verify the report.');
      return false;
    }
    setStepError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => {
    setStepError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const addFiles = (newFiles) => {
    const imgs = Array.from(newFiles)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
    setFiles(prev => [...prev, ...imgs]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (i) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[i].url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async () => {
    if (!popiChecked) return;
    setLoading(true);
    setSubmitError('');
    try {
      const payload = { ...form };
      if (form.evidence_notes.trim()) {
        payload.description = `${form.description}\n\nEvidence: ${form.evidence_notes}`;
      }
      if (payload.amount_lost) payload.amount_lost = parseFloat(payload.amount_lost);
      else delete payload.amount_lost;
      delete payload.evidence_notes;

      await api.post('/reports/', payload);
      setSubmitted(true);
    } catch (err) {
      const d = err.response?.data?.detail;
      setSubmitError(typeof d === 'string' ? d : 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', bank_account: '', bank_name: '', id_number: '', category: 'other', amount_lost: '', description: '', evidence_notes: '' });
    setFiles([]);
    setPopiChecked(false);
    setStep(1);
    setSubmitted(false);
    setSubmitError('');
  };

  const progress = (step / 4) * 100;
  const isMini = typeof window !== 'undefined' && window.innerWidth < 480;

  // ── SUCCESS STATE ──
  if (submitted) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', background: '#080B10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#0D1117', border: '1px solid #1C2636', borderRadius: '16px', padding: '3rem 2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem' }}>✅</div>
          <h2 style={{ color: '#E2E8F0', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Report Submitted!</h2>
          <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: '2rem' }}>
            Thank you for helping protect South Africans. Our team will review your report and publish it once verified.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={resetForm} style={{ padding: '0.8rem 1.5rem', background: '#1C2636', border: 'none', borderRadius: '10px', color: '#E2E8F0', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
              Submit Another
            </button>
            <button onClick={() => navigate('/')} style={{ padding: '0.8rem 1.5rem', background: '#E53935', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#080B10', padding: '2.5rem 1rem 4rem' }}>
      <style>{`
        .wiz-input:focus { border-color: #1a73e8 !important; }
        .cat-opt:hover { border-color: #1C2636; background: #12161F !important; }
      `}</style>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#E2E8F0', letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>Report a Scammer</h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Help protect other South Africans. All reports are reviewed before being published.</p>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: 1 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: step > s.num ? '#22C55E' : step === s.num ? '#E53935' : '#12161F',
                  border: `2px solid ${step > s.num ? '#22C55E' : step === s.num ? '#E53935' : '#1C2636'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: step > s.num ? '0.9rem' : '0.8rem',
                  fontWeight: 700, color: step >= s.num ? '#fff' : '#475569',
                  transition: 'background 0.3s, border-color 0.3s',
                }}>
                  {step > s.num ? '✓' : s.num}
                </div>
                {!isMini && (
                  <div style={{ fontSize: '0.68rem', color: step === s.num ? '#E2E8F0' : '#475569', fontWeight: step === s.num ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {s.short}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ height: '4px', background: '#1C2636', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #E53935, #FF7043)', borderRadius: '2px', transition: 'width 0.35s ease' }} />
          </div>
        </div>

        {/* ── CARD ── */}
        <div style={{ background: '#0D1117', border: '1px solid #1C2636', borderRadius: '16px', padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#12161F', border: '1px solid #1C2636', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              {STEPS[step - 1].icon}
            </div>
            <div>
              <div style={{ color: '#E53935', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Step {step} of 4</div>
              <div style={{ color: '#E2E8F0', fontSize: '1.1rem', fontWeight: 700 }}>{STEPS[step - 1].label}</div>
            </div>
          </div>

          {/* ── STEP 1: Scammer Details ── */}
          {step === 1 && (
            <div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Provide as many identifiers as possible. At least one is required.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1rem' }}>
                <Field label="Full name" optional>
                  <input className="wiz-input" style={INPUT} value={form.name} onChange={set('name')} placeholder="e.g. John Doe" />
                </Field>
                <Field label="Phone number" optional>
                  <input className="wiz-input" style={INPUT} value={form.phone} onChange={set('phone')} placeholder="e.g. 0821234567" />
                </Field>
                <Field label="Bank account" optional>
                  <input className="wiz-input" style={INPUT} value={form.bank_account} onChange={set('bank_account')} placeholder="Account number" />
                </Field>
                <Field label="Bank name" optional>
                  <select className="wiz-input" style={{ ...INPUT, cursor: 'pointer' }} value={form.bank_name} onChange={set('bank_name')}>
                    <option value="">Select bank...</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="SA ID number" optional>
                <input className="wiz-input" style={INPUT} value={form.id_number} onChange={set('id_number')} placeholder="13-digit ID number" maxLength={13} />
              </Field>
            </div>
          )}

          {/* ── STEP 2: Scam Info ── */}
          {step === 2 && (
            <div>
              <Field label="Scam category">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                  {CAT_OPTIONS.map(cat => (
                    <div
                      key={cat.value}
                      className="cat-opt"
                      onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      style={{
                        padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                        background: form.category === cat.value ? `${cat.color}15` : '#12161F',
                        border: `2px solid ${form.category === cat.value ? cat.color : '#1C2636'}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{cat.icon}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: form.category === cat.value ? cat.color : '#94A3B8' }}>{cat.label}</div>
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="Amount lost (ZAR)" optional>
                <input className="wiz-input" style={INPUT} type="number" min="0" value={form.amount_lost} onChange={set('amount_lost')} placeholder="e.g. 5000" />
              </Field>
              <Field label="Describe the scam">
                <textarea
                  className="wiz-input"
                  style={{ ...INPUT, resize: 'vertical', minHeight: '140px', fontFamily: 'inherit', lineHeight: 1.6 }}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="How were you contacted? What did they promise? How did the scam unfold? The more detail, the better."
                  required
                />
              </Field>
            </div>
          )}

          {/* ── STEP 3: Evidence ── */}
          {step === 3 && (
            <div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Upload screenshots or describe any supporting evidence you have. This helps our team verify the report faster.
              </p>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#E53935' : '#1C2636'}`,
                  borderRadius: '12px',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(229,57,53,0.04)' : '#12161F',
                  transition: 'all 0.2s',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.9rem' }}>
                  {dragging ? 'Drop screenshots here' : 'Drag & drop screenshots here'}
                </div>
                <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '0.4rem' }}>or click to browse files</div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              </div>

              {/* File previews */}
              {files.length > 0 && (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={f.url} alt={f.name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '8px', border: '1px solid #1C2636' }} />
                      <button
                        onClick={() => removeFile(i)}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#E53935', border: 'none', color: '#fff', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: 'rgba(26,115,232,0.06)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '10px', padding: '0.9rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
                <p style={{ color: '#64748B', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                  Screenshot notes and uploads are attached to your report for admin review.
                  Admins can use AI to extract scammer details from Facebook screenshots.
                </p>
              </div>

              <Field label="Additional evidence notes" optional>
                <textarea
                  className="wiz-input"
                  style={{ ...INPUT, resize: 'vertical', minHeight: '100px', fontFamily: 'inherit', lineHeight: 1.6 }}
                  value={form.evidence_notes}
                  onChange={set('evidence_notes')}
                  placeholder="Any additional details, links, or context you want to provide..."
                />
              </Field>
            </div>
          )}

          {/* ── STEP 4: Confirm ── */}
          {step === 4 && (
            <div>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Review your report before submitting. Once submitted it will be reviewed by our team.
              </p>

              {/* Summary */}
              <div style={{ background: '#12161F', border: '1px solid #1C2636', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '1rem' }}>Report Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem' }}>
                  {[
                    { label: 'Name',         val: form.name },
                    { label: 'Phone',        val: form.phone },
                    { label: 'Bank account', val: form.bank_account ? `${form.bank_account}${form.bank_name ? ` (${form.bank_name})` : ''}` : null },
                    { label: 'ID number',    val: form.id_number },
                    { label: 'Category',     val: form.category },
                    { label: 'Amount lost',  val: form.amount_lost ? `R${parseFloat(form.amount_lost).toLocaleString('en-ZA')}` : null },
                    { label: 'Evidence',     val: files.length > 0 ? `${files.length} screenshot${files.length > 1 ? 's' : ''} attached` : null },
                  ].filter(r => r.val).map((row, i) => (
                    <React.Fragment key={i}>
                      <span style={{ color: '#475569', fontSize: '0.8rem', whiteSpace: 'nowrap', paddingTop: '2px' }}>{row.label}</span>
                      <span style={{ color: '#E2E8F0', fontSize: '0.8rem', fontFamily: row.label !== 'Category' && row.label !== 'Evidence' ? 'monospace' : 'inherit' }}>{row.val}</span>
                    </React.Fragment>
                  ))}
                </div>
                {form.description && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #1C2636' }}>
                    <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.5rem' }}>Description</div>
                    <p style={{ color: '#94A3B8', fontSize: '0.825rem', lineHeight: 1.65, margin: 0 }}>{form.description}</p>
                  </div>
                )}
              </div>

              {/* POPIA */}
              <div style={{ background: 'rgba(26,115,232,0.04)', border: '1px solid #1C2636', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={popiChecked}
                    onChange={e => setPopiChecked(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: '2px', accentColor: '#E53935', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.65 }}>
                    I confirm this is a genuine scam incident and the information provided is accurate to the best of my knowledge.
                    I understand that false reports may result in legal action under the{' '}
                    <strong style={{ color: '#E2E8F0' }}>Protection of Personal Information Act (POPIA)</strong>.
                  </span>
                </label>
              </div>

              {submitError && (
                <div style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#EF5350', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !popiChecked}
                style={{
                  width: '100%', padding: '1rem', background: popiChecked ? '#E53935' : '#1C2636',
                  border: 'none', borderRadius: '10px', color: popiChecked ? '#fff' : '#475569',
                  fontWeight: 800, fontSize: '1rem', cursor: popiChecked ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {loading ? 'Submitting...' : '🛡️ Submit Report'}
              </button>
            </div>
          )}

          {/* ── NAVIGATION ── */}
          {step < 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1C2636' }}>
              <button
                onClick={prevStep}
                disabled={step === 1}
                style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #1C2636', borderRadius: '10px', color: step === 1 ? '#1C2636' : '#94A3B8', fontWeight: 600, cursor: step === 1 ? 'default' : 'pointer', fontSize: '0.875rem' }}
              >
                ← Back
              </button>
              {stepError && (
                <div style={{ color: '#E53935', fontSize: '0.8rem', textAlign: 'center', flex: 1, margin: '0 1rem' }}>{stepError}</div>
              )}
              <button
                onClick={nextStep}
                style={{ padding: '0.75rem 1.75rem', background: '#E53935', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Next →
              </button>
            </div>
          )}
          {step === 4 && (
            <div style={{ marginTop: '1.25rem' }}>
              <button onClick={prevStep} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                ← Edit report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
