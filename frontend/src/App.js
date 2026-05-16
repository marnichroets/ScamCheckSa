import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '60px',
    background: '#0d1117',
    borderBottom: '1px solid #1e2a3a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: '#1a73e8',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  navLinks: { display: 'flex', gap: '1.5rem', listStyle: 'none' },
  navLink: { color: '#9aa3ae', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' },
};

function Navbar() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>ScamCheck<span style={{ color: '#e8a01a' }}>SA</span></Link>
      <ul style={styles.navLinks}>
        <li><Link to="/" style={styles.navLink}>Search</Link></li>
        <li><Link to="/report" style={styles.navLink}>Report Scam</Link></li>
        {token ? (
          <>
            <li><Link to="/admin" style={styles.navLink}>Admin</Link></li>
            <li>
              <button
                onClick={handleLogout}
                style={{ ...styles.navLink, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login" style={styles.navLink}>Login</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
