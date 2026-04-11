import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Bookings from './pages/Bookings';
import Chats from './pages/Chats';
import Rooms from './pages/Rooms';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';

function DashboardLayout({ children, theme, toggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === 'dark';

  //checking out the new repo integration
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: isDark ? '#0a0a14' : '#f0f4f8',
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      transition: 'background 0.3s ease',
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

        * { box-sizing: border-box; }

        /* ── Sidebar: desktop = sticky, mobile = drawer ── */
        .sidebar-wrapper {
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 100;
        }

        /* ── Overlay: hidden on desktop ── */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 999;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        /* ── Mobile top bar: hidden on desktop ── */
        .mobile-header {
          display: none;
        }

        /* ── Main padding: generous on desktop ── */
        .dashboard-main {
          padding: 32px 36px;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .sidebar-wrapper {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(${mobileOpen ? '0' : '-100%'});
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            z-index: 1000;
          }
          .mobile-overlay {
            display: ${mobileOpen ? 'block' : 'none'} !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .dashboard-main {
            padding: 16px 14px !important;
          }
        }

        /* ── TABLET ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .dashboard-main {
            padding: 24px 24px !important;
          }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Overlay (mobile only) */}
      <div
        className="mobile-overlay"
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div className="sidebar-wrapper">
        <Sidebar
          theme={theme}
          toggleTheme={toggleTheme}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Right side: mobile header + page content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile header bar */}
        <div className="mobile-header" style={{
          padding: '0 16px',
          height: '56px',
          background: isDark ? '#0d0d1a' : '#ffffff',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 98,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#1a1a2e',
              cursor: 'pointer',
              padding: '7px 9px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <span style={{ display: 'block', width: '16px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '16px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
            <span style={{ display: 'block', width: '11px', height: '2px', background: 'currentColor', borderRadius: '2px', alignSelf: 'flex-start' }} />
          </button>

          {/* Logo center */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(232,184,109,0.3)' }}>
              <img
                src="/logo.jpeg"
                alt="Innhance"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#0f3460);display:flex;align-items:center;justify-content:center;font-size:13px">🏨</div>';
                }}
              />
            </div>
            <span style={{
              fontSize: '15px', fontWeight: '800',
              color: isDark ? '#fff' : '#1a1a2e',
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.3px'
            }}>Innhance</span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#1a1a2e',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '7px 9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {isDark ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Page content */}
        <main
          className="dashboard-main"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            color: isDark ? '#fff' : '#1a1a2e',
            transition: 'color 0.3s ease',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  const layout = (page) => (
    <PrivateRoute>
      <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
        {page}
      </DashboardLayout>
    </PrivateRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/"          element={layout(<Overview  theme={theme} />)} />
        <Route path="/bookings"  element={layout(<Bookings  theme={theme} />)} />
        <Route path="/chats"     element={layout(<Chats     theme={theme} />)} />
        <Route path="/rooms"     element={layout(<Rooms     theme={theme} />)} />
        <Route path="/analytics" element={layout(<Analytics theme={theme} />)} />
      </Routes>
    </BrowserRouter>
  );
}