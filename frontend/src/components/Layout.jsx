// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for the global profile/settings modal
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'terms', 'purge', null
  const [isPurging, setIsPurging] = useState(false);
  
  // NEW: State for the custom PURGE confirmation input
  const [purgeInput, setPurgeInput] = useState('');

  const sidebarStyles = {
    width: '260px', backgroundColor: '#0f172a', color: '#94a3b8', height: '100vh',
    position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column',
    borderRight: '1px solid #1e293b', boxShadow: '4px 0 24px rgba(0,0,0,0.15)', zIndex: 10
  };

  const navLinkStyle = (path) => ({
    display: 'block', padding: '14px 24px',
    color: location.pathname === path ? '#f8fafc' : '#94a3b8',
    backgroundColor: location.pathname === path ? '#1e293b' : 'transparent',
    textDecoration: 'none', fontWeight: location.pathname === path ? '600' : '400',
    fontSize: '0.95rem',
    borderLeft: location.pathname === path ? '4px solid #38bdf8' : '4px solid transparent',
    transition: 'all 0.2s ease'
  });

  const handleGlobalPurge = async () => {
    // Safety check ensuring button bypass isn't exploited
    if (purgeInput !== 'PURGE') return; 
    
    setIsPurging(true);
    try {
      await api.delete('/system/purge-all');
      setPurgeInput('');
      setActiveModal(null);
      // Optional: replace window.alert with a smoother transition if desired, 
      // but reloading the window cleanly resets the UI state for all cached components.
      window.location.reload(); 
    } catch (err) {
      alert("Failed to execute global purge. Check database connections.");
      console.error(err);
    } finally {
      setIsPurging(false);
    }
  };

  const closeModals = () => {
    setActiveModal(null);
    setPurgeInput(''); // Reset input on close
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <style>{`
        .profile-dots { background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; padding: 4px 12px; border-radius: 6px; transition: all 0.2s; line-height: 1;}
        .profile-dots:hover { background-color: #1e293b; color: #f8fafc; }
        
        /* Modal Overlay Styles */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 50; }
        .modal-card { background: white; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; border: 1px solid #e2e8f0; }
        .modal-header { padding: 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; }
        .modal-body { padding: 32px 24px; }
        .modal-btn { width: 100%; padding: 14px; border: none; border-radius: 8px; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; transition: all 0.2s;}
        
        .btn-primary { background-color: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
        .btn-primary:hover { background-color: #e2e8f0; border-color: #94a3b8; }
        .btn-danger { background-color: #fef2f2; color: #ef4444; border: 1px solid #fecaca; }
        .btn-danger:hover:not(:disabled) { background-color: #fee2e2; }
        .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Security Input Box */
        .security-input { width: 100%; padding: 12px; border: 2px solid #fecaca; border-radius: 6px; font-size: 1.1rem; outline: none; text-align: center; font-weight: 800; color: #dc2626; letter-spacing: 2px; transition: all 0.2s; box-sizing: border-box; }
        .security-input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }
        .security-input::placeholder { color: #fca5a5; font-weight: 600; letter-spacing: 1px; }
      `}</style>

      <aside style={sidebarStyles}>
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.2rem', margin: 0, letterSpacing: '0.5px', fontWeight: '700' }}>FORENSIC AI</h2>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600', letterSpacing: '1px' }}>INTELLIGENCE SYSTEM</span>
        </div>
        
        <nav style={{ flex: 1, marginTop: '16px' }}>
          <Link to="/" style={navLinkStyle('/')}>Cases Dashboard</Link>
          <Link to="/upload" style={navLinkStyle('/upload')}>Upload Case Data</Link>
          <Link to="/registry" style={navLinkStyle('/registry')}>Missing Persons Registry</Link>
        </nav>

        {/* Profile Anchor Block */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #1e293b', backgroundColor: '#0b0f19', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>OPERATOR BADGE</div>
            <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: '600', marginTop: '2px' }}>{localStorage.getItem('username') || 'Agent'}</div>
          </div>
          <button className="profile-dots" onClick={() => setActiveModal('profile')}>⋮</button>
        </div>
      </aside>

      {/* --- CUSTOM WEB MODALS --- */}
      {activeModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeModals()}>
          
          {/* PROFILE MAIN MENU */}
          {activeModal === 'profile' && (
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Operator Profile</h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Active Session: {localStorage.getItem('username')}</p>
                </div>
                <button onClick={closeModals} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
              </div>
              <div className="modal-body">
                <button className="modal-btn btn-primary" onClick={() => { closeModals(); navigate('/recycle-bin'); }}>
                  <span>Recycle Bin</span> <span>🗑️</span>
                </button>
                <button className="modal-btn btn-primary" onClick={() => setActiveModal('terms')}>
                  <span>System Terms & Regulations</span> <span>📜</span>
                </button>
                <button className="modal-btn btn-danger" onClick={() => setActiveModal('purge')}>
                  <span>Delete All System Data</span> <span>⚠️</span>
                </button>
                
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '24px 0', paddingTop: '24px' }}>
                  <button className="modal-btn" style={{ backgroundColor: '#0f172a', color: 'white' }} onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
                    Terminate Secure Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TERMS & REGULATIONS */}
          {activeModal === 'terms' && (
            <div className="modal-card">
              <div className="modal-header">
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>Terms & Regulations</h3>
                <button onClick={() => setActiveModal('profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', fontWeight: '700' }}>Back</button>
              </div>
              <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                <p><strong>1. Data Compliance:</strong> All biometric and artifact data entered into the Forensic AI Intelligence System must comply with jurisdictional law enforcement data protection acts.</p>
                <p><strong>2. Auditing:</strong> Operator actions, including modifications, soft-deletions, and permanent purges, are tracked in system logs.</p>
                <p><strong>3. Algorithmic Bounds:</strong> AI predictions (Sex, Age, Height) are probabilistic metrics meant to assist, not replace, human forensic pathological review.</p>
              </div>
            </div>
          )}

          {/* CUSTOM PURGE DATA CONFIRMATION UI */}
          {activeModal === 'purge' && (
            <div className="modal-card" style={{ border: '2px solid #ef4444' }}>
              <div className="modal-header" style={{ backgroundColor: '#fef2f2' }}>
                <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.1rem', fontWeight: '800' }}>DANGER: Global System Purge</h3>
                <button onClick={() => { setActiveModal('profile'); setPurgeInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', fontWeight: '700' }}>Cancel</button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
                  This action will permanently destroy <strong>all Unidentified Remains and Missing Persons records</strong> from the PostgreSQL database. This bypasses the Recycle Bin entirely.
                </p>
                
                {/* Security Validation Input Box */}
                <div style={{ marginBottom: '24px', backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px dashed #fca5a5' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#991b1b', letterSpacing: '0.5px', marginBottom: '8px', textAlign: 'center' }}>
                    TYPE "PURGE" TO AUTHORIZE
                  </label>
                  <input 
                    type="text" 
                    value={purgeInput} 
                    onChange={(e) => setPurgeInput(e.target.value)} 
                    className="security-input"
                    placeholder="PURGE"
                    autoComplete="off"
                  />
                </div>

                <button 
                  className="modal-btn btn-danger" 
                  onClick={handleGlobalPurge} 
                  disabled={isPurging || purgeInput !== 'PURGE'}
                  style={{ justifyContent: 'center' }}
                >
                  {isPurging ? 'EXECUTING DATA WIPEOUT...' : 'CONFIRM PURGE ALL DATA'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}