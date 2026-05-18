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

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 1.5rem', height: '60px', background: '#0d1117',
    borderBottom: '1px solid #1e2a3a', position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { fontWeight: 700, fontSize: '1.2rem', color: '#1a73e8', textDecoration: 'none', letterSpacing: '-0.5px', whiteSpace: 'nowrap' },
  navLinks: { display: 'flex', gap: '1.5rem', listStyle: 'none', alignItems: 'center' },
  navLink: { color: '#9aa3ae', textDecoration: 'none', fontSize: '0.9rem' },
  logoutBtn: { color: '#9aa3ae', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 },
  hamburger: { background: 'none', border: 'none', color: '#9aa3ae', cursor: 'pointer', fontSize: '1.4rem', padding: '0.25rem', lineHeight: 1 },
  mobileMenu: {
    position: 'absolute', top: '60px', left: 0, right: 0, background: '#0d1117',
    borderBottom: '1px solid #1e2a3a', padding: '1rem 1.5rem', display: 'flex',
    flexDirection: 'column', gap: '1rem', zIndex: 99,
  },
  mobileLink: { color: '#9aa3ae', textDecoration: 'none', fontSize: '1rem' },
};

function Navbar() {
  useLocation();
  const isMobile = useWindowWidth() < 640;
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
    <nav style={{ ...styles.nav, position: 'sticky' }}>
      <Link to="/" style={styles.logo} onClick={close}>
        ScamCheck<span style={{ color: '#e8a01a' }}>SA</span>
      </Link>

      {isMobile ? (
        <>
          <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            {menuOpen ? '✕' : '☰'}
          </button>
          {menuOpen && (
            <div style={styles.mobileMenu}>
              <Link to="/" style={styles.mobileLink} onClick={close}>Search</Link>
              <Link to="/report" style={styles.mobileLink} onClick={close}>Report Scam</Link>
              {token ? (
                <>
                  <Link to="/admin" style={styles.mobileLink} onClick={close}>Admin</Link>
                  <button style={{ ...styles.mobileLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }} onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" style={styles.mobileLink} onClick={close}>Login</Link>
                  <Link to="/register" style={styles.mobileLink} onClick={close}>Register</Link>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <ul style={styles.navLinks}>
          <li><Link to="/" style={styles.navLink}>Search</Link></li>
          <li><Link to="/report" style={styles.navLink}>Report Scam</Link></li>
          {token ? (
            <>
              <li><Link to="/admin" style={styles.navLink}>Admin</Link></li>
              <li><button style={styles.logoutBtn} onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" style={styles.navLink}>Login</Link></li>
              <li><Link to="/register" style={styles.navLink}>Register</Link></li>
            </>
          )}
        </ul>
      )}
    </nav>
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
