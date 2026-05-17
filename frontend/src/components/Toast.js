import React, { useState, useEffect } from 'react';

let _push = null;

export function toast(message, type = 'success') {
  if (_push) _push(message, type);
}

const TYPE = {
  success: { bg: '#1a2a1a', border: '#2d5a2d', color: '#4caf50' },
  error:   { bg: '#2a1a1a', border: '#5a2d2d', color: '#ef5350' },
  info:    { bg: '#1a2035', border: '#1e3a6e', color: '#5b9cf6' },
};

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _push = (message, type) => {
      const id = Date.now() + Math.random();
      setToasts(p => [...p, { id, message, type }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };
    return () => { _push = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <>
      <style>{`@keyframes scToastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '360px' }}>
        {toasts.map(t => {
          const c = TYPE[t.type] || TYPE.info;
          return (
            <div key={t.id} style={{
              padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500,
              background: c.bg, border: `1px solid ${c.border}`, color: c.color,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)', animation: 'scToastIn 0.2s ease',
            }}>
              {t.message}
            </div>
          );
        })}
      </div>
    </>
  );
}
