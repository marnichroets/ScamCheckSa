import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: '#0A0E14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
      <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Page not found</h1>
      <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.6 }}>
        The page you're looking for doesn't exist. It may have been moved or the URL might be incorrect.
      </p>
      <Link to="/" style={{ padding: '0.85rem 2rem', background: '#1a3c6e', borderRadius: '8px', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
        Back to search
      </Link>
    </div>
  );
}
