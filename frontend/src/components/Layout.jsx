// frontend/src/components/Layout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const sidebarStyles = {
    width: '260px',
    backgroundColor: '#0f172a', // Deep corporate slate/navy
    color: '#94a3b8',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1e293b',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
  };

  const navLinkStyle = (path) => ({
    display: 'block',
    padding: '14px 24px',
    color: location.pathname === path ? '#f8fafc' : '#94a3b8',
    backgroundColor: location.pathname === path ? '#1e293b' : 'transparent',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? '600' : '400',
    fontSize: '0.95rem',
    borderLeft: location.pathname === path ? '4px solid #38bdf8' : '4px solid transparent',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Structural Sidebar */}
      <aside style={sidebarStyles}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0, letterSpacing: '0.5px', fontWeight: '700' }}>
            FORENSIC AI
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600', letterSpacing: '1px' }}>
            INTELLIGENCE SYSTEM
          </span>
        </div>
        
        <nav style={{ flex: 1, marginTop: '16px' }}>
          <Link to="/" style={navLinkStyle('/')}>Cases Dashboard</Link>
          <Link to="/upload" style={navLinkStyle('/upload')}>Upload Case Data</Link>
          <Link to="/registry" style={navLinkStyle('/registry')}>Missing Persons Registry</Link>
        </nav>

        <div style={{ padding: '20px 24px', borderTop: '1px solid #1e293b', backgroundColor: '#0b0f19' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Operator Badge</div>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', marginTop: '2px' }}>
            {localStorage.getItem('username') || 'Agent'}
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '0.8rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Context Area */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}