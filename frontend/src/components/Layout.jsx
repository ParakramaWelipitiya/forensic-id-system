// frontend/src/components/Layout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>
          Forensic ID System
        </div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <Link 
            to="/" 
            style={{ display: 'block', padding: '15px 20px', color: location.pathname === '/' ? '#38bdf8' : '#cbd5e1', backgroundColor: location.pathname === '/' ? '#0f172a' : 'transparent' }}>
            Dashboard
          </Link>
          <Link 
            to="/upload" 
            style={{ display: 'block', padding: '15px 20px', color: location.pathname === '/upload' ? '#38bdf8' : '#cbd5e1', backgroundColor: location.pathname === '/upload' ? '#0f172a' : 'transparent' }}>
            Upload Case Data
          </Link>
          <Link 
            to="/registry" 
            style={{ display: 'block', padding: '15px 20px', color: location.pathname === '/registry' ? '#38bdf8' : '#cbd5e1', backgroundColor: location.pathname === '/registry' ? '#0f172a' : 'transparent' }}>
            Missing Persons Registry
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <header style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#475569' }}>Investigator Portal</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}></div>
            <span style={{ fontWeight: '500' }}>Admin Agent</span>
          </div>
        </header>

        {/* Dynamic Page Content goes here */}
        <main style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}