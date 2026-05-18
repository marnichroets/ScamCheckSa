import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ScammerProfilePage from './pages/ScammerProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/Toast';
import useWindowWidth from './hooks/useWindowWidth';

function Navbar() {
  useLocation();
  const isMobile = useWindowWidth() < 720;
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMenuOpen(false);
    navigate('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #E2E8F0 !important; }
        .report-btn:hover { background: #c62828 !important; }
        .report-btn { transition: background 0.15s; }
        .logo-span { color: #E53935; }
      `}</style>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: '64px',
        background: 'rgba(8,11,16,0.95)',
        borderBottom: '1px solid #1C2636',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <Link to="/" onClick={close} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#E2E8F0', letterSpacing: '-0.5px' }}>
            ScamCheck<span className="logo-span">SA</span>
          </span>
        </Link>

        {isMobile ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/report" onClick={close} className="report-btn" style={{
                background: '#E53935', color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                padding: '0.4rem 0.9rem', borderRadius: '8px', textDecoration: 'none',
              }}>
                Report
              </Link>
              <button
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.3rem', padding: '0.25rem', lineHeight: 1 }}
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: '64px', left: 0, right: 0,
                background: '#0D1117', borderBottom: '1px solid #1C2636',
                padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 99,
              }}>
                {[
                  { to: '/', label: 'Search' },
                  { to: '/results?q=investment&field=category', label: 'Browse Scammers' },
                  { to: '/report', label: 'Report a Scammer' },
                ].map(item => (
                  <Link key={item.to} to={item.to} onClick={close} style={{
                    color: '#94A3B8', textDecoration: 'none', fontSize: '0.95rem',
                    padding: '0.65rem 0.5rem', borderBottom: '1px solid #1C2636',
                  }}>
                    {item.label}
                  </Link>
                ))}
                {token ? (
                  <>
                    <Link to="/admin" onClick={close} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.95rem', padding: '0.65rem 0.5rem', borderBottom: '1px solid #1C2636' }}>Admin Panel</Link>
                    <button onClick={handleLogout} style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', padding: '0.65rem 0.5rem', textAlign: 'left' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={close} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.95rem', padding: '0.65rem 0.5rem', borderBottom: '1px solid #1C2636' }}>Login</Link>
                    <Link to="/register" onClick={close} style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.95rem', padding: '0.65rem 0.5rem' }}>Register</Link>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {[
              { to: '/', label: 'Search' },
              { to: '/results?q=investment&field=category', label: 'Browse' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="nav-link" style={{
                color: '#64748B', textDecoration: 'none', fontSize: '0.875rem',
                padding: '0.4rem 0.75rem', borderRadius: '6px',
              }}>
                {item.label}
              </Link>
            ))}
            <Link to="/report" className="report-btn" style={{
              background: '#E53935', color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              padding: '0.45rem 1rem', borderRadius: '8px', textDecoration: 'none',
              marginLeft: '0.25rem',
            }}>
              + Report Scam
            </Link>
            <div style={{ width: '1px', height: '20px', background: '#1C2636', margin: '0 0.5rem' }} />
            {token ? (
              <>
                <Link to="/admin" className="nav-link" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>Admin</Link>
                <button onClick={handleLogout} className="nav-link" style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}>Login</Link>
                <Link to="/register" className="nav-link" style={{
                  color: '#E2E8F0', textDecoration: 'none', fontSize: '0.875rem',
                  padding: '0.4rem 0.9rem', border: '1px solid #1C2636', borderRadius: '8px',
                }}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/scammer/:id" element={<ScammerProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
