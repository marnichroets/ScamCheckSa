import React from 'react';

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem' }}
      onClick={onCancel}
    >
      <div
        style={{ background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.6rem' }}>{title}</div>
        <p style={{ color: '#9aa3ae', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{ padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid #1e2a3a', borderRadius: '6px', color: '#9aa3ae', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: '0.6rem 1.25rem', background: '#ef5350', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
