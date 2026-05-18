import React from 'react';

const s = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: '#0A0E14', padding: '2rem', textAlign: 'center',
  },
  icon: { fontSize: '3rem', marginBottom: '1rem' },
  title: { color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
  sub: { color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '400px' },
  btn: {
    padding: '0.75rem 1.5rem', background: '#1a3c6e', border: 'none',
    borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
  },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.page}>
          <div style={s.icon}>⚠️</div>
          <h1 style={s.title}>Something went wrong</h1>
          <p style={s.sub}>An unexpected error occurred. Please refresh the page or go back to the homepage.</p>
          <button style={s.btn} onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}>
            Go to homepage
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
