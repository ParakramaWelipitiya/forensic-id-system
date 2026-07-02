import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeInput, setPurgeInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
    if (purgeInput !== 'PURGE') return; 
    setIsPurging(true);
    try {
      await api.delete('/system/purge-all');
      setPurgeInput('');
      setIsSettingsOpen(false);
      window.location.reload(); 
    } catch (err) {
      alert("Failed to execute global purge. Check database connections.");
      console.error(err);
    } finally {
      setIsPurging(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [casesRes, missingRes] = await Promise.all([api.get('/cases'), api.get('/missing')]);
      
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "SYSTEM DATA EXPORT\n\n";
      
      csvContent += "--- UNIDENTIFIED REMAINS ---\n";
      csvContent += "Registry Number,Location,AI Predicted Sex,Age Min,Age Max,Height Min,Height Max,Confidence Score\n";
      casesRes.data.forEach(c => {
        csvContent += `"${c.recovery_case_number}","${c.recovery_location}","${c.predicted_sex || 'Pending'}","${c.predicted_age_min || ''}","${c.predicted_age_max || ''}","${c.predicted_height_cm_min || ''}","${c.predicted_height_cm_max || ''}","${c.ai_confidence_score || ''}"\n`;
      });

      csvContent += "\n--- MISSING PERSONS REGISTRY ---\n";
      csvContent += "Registry Number,First Name,Last Name,Sex,Age Min,Age Max,Location\n";
      missingRes.data.forEach(m => {
        csvContent += `"${m.case_number}","${m.first_name}","${m.last_name}","${m.biological_sex}","${m.age_min}","${m.age_max}","${m.last_known_location}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Forensic_Intelligence_Data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to compile system data for export.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const closeSettings = () => {
    setIsSettingsOpen(false);
    setPurgeInput('');
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      <style>{`
        .profile-dots { background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; padding: 4px 12px; border-radius: 6px; transition: all 0.2s; line-height: 1;}
        .profile-dots:hover { background-color: #1e293b; color: #f8fafc; }
        
        .settings-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 40px; }
        .settings-container { background-color: #202124; width: 100%; max-width: 950px; height: 650px; border-radius: 12px; display: flex; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); border: 1px solid #3c4043; color: #e8eaed; font-family: system-ui, sans-serif;}
        
        .settings-sidebar { flex-shrink: 0; width: 260px; background-color: #202124; border-right: 1px solid #3c4043; padding: 24px 12px; display: flex; flex-direction: column; box-sizing: border-box; }
        
        .settings-nav-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; background: transparent; border: none; color: #bdc1c6; font-size: 0.95rem; font-weight: 500; text-align: left; cursor: pointer; border-radius: 8px; margin-bottom: 4px; transition: all 0.15s ease; box-sizing: border-box;}
        .settings-nav-btn:hover { background-color: #282a2d; color: #e8eaed; }
        .settings-nav-btn.active { background-color: #3c4043; color: #8ab4f8; font-weight: 600; }
        
        .settings-content { flex: 1; padding: 32px 48px; overflow-y: auto; background-color: #202124; box-sizing: border-box; }
        .settings-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;}
        .settings-title { margin: 0; font-size: 1.6rem; font-weight: 500; letter-spacing: -0.5px; }
        .close-btn { background: transparent; border: none; color: #9aa0a6; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 1.2rem; transition: background 0.2s; }
        .close-btn:hover { background: #3c4043; color: white;}

        .settings-group { background-color: #282a2d; border-radius: 8px; border: 1px solid #3c4043; margin-bottom: 24px; overflow: hidden; }
        .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #3c4043; }
        .settings-row:last-child { border-bottom: none; }
        
        .row-info-title { font-size: 0.95rem; color: #e8eaed; font-weight: 500; }
        .row-info-desc { font-size: 0.85rem; color: #9aa0a6; margin-top: 4px; line-height: 1.4; }

        .btn-action { padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: none; transition: all 0.2s; min-width: 120px; text-align: center;}
        .btn-logout { background-color: #3c4043; color: #e8eaed; border: 1px solid #5f6368; }
        .btn-logout:hover { background-color: #4a4d51; }
        .btn-export { background-color: #8ab4f8; color: #202124; }
        .btn-export:hover { background-color: #aecbfa; }
        .btn-danger-outline { background-color: transparent; border: 1px solid #f87171; color: #f87171; }
        .btn-danger-outline:hover { background-color: rgba(248, 113, 113, 0.1); }
        
        .security-input-dark { width: 100%; padding: 12px; background-color: #171717; border: 1px solid #5f6368; border-radius: 6px; font-size: 1.1rem; outline: none; text-align: center; font-weight: 800; color: #f87171; letter-spacing: 2px; transition: all 0.2s; box-sizing: border-box; }
        .security-input-dark:focus { border-color: #f87171; box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2); }
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

        <div style={{ padding: '20px 24px', borderTop: '1px solid #1e293b', backgroundColor: '#0b0f19', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>OPERATOR NAME</div>
            <div style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: '600', marginTop: '2px' }}>{localStorage.getItem('username') || 'Agent'}</div>
          </div>
          <button className="profile-dots" onClick={() => setIsSettingsOpen(true)}>⋮</button>
        </div>
      </aside>

      {isSettingsOpen && (
        <div className="settings-overlay" onClick={(e) => e.target.className === 'settings-overlay' && closeSettings()}>
          <div className="settings-container">
            
            <div className="settings-sidebar">
              <div style={{ padding: '4px 16px', marginBottom: '8px', fontSize: '0.75rem', color: '#9aa0a6', fontWeight: '700', letterSpacing: '0.5px' }}>
                SYSTEM CONTROLS
              </div>
              
              <button className={`settings-nav-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}> </span> General
              </button>
              <button className={`settings-nav-btn ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
                <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}> </span> Professional Guide
              </button>
              <button className={`settings-nav-btn ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>
                <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}> </span> Data Controls
              </button>
              
              <div style={{ flex: 1 }}></div>
              
              <div style={{ padding: '12px 16px', marginBottom: '4px', fontSize: '0.75rem', color: '#9aa0a6', fontWeight: '700', letterSpacing: '0.5px' }}>
                SECURITY
              </div>
              <button className={`settings-nav-btn ${activeTab === 'purge' ? 'active' : ''}`} onClick={() => setActiveTab('purge')} style={{ color: activeTab === 'purge' ? '#f87171' : '', backgroundColor: activeTab === 'purge' ? 'rgba(248, 113, 113, 0.1)' : '' }}>
                <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}> </span> Clean DB
              </button>
            </div>

            <div className="settings-content">
              
              {activeTab === 'general' && (
                <div>
                  <div className="settings-header">
                    <h2 className="settings-title">General Settings</h2>
                    <button className="close-btn" onClick={closeSettings}>✕</button>
                  </div>
                  
                  <div className="settings-group">
                    <div className="settings-row">
                      <div>
                        <div className="row-info-title">Active Operator Session</div>
                        <div className="row-info-desc">Logged in securely as {localStorage.getItem('username')}</div>
                      </div>
                      <button className="btn-action btn-danger-outline" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
                    </div>
                    <div className="settings-row">
                      <div>
                        <div className="row-info-title">Archival Access</div>
                        <div className="row-info-desc">Review and restore softly deleted system records</div>
                      </div>
                      <button className="btn-action btn-logout" onClick={() => { closeSettings(); navigate('/recycle-bin'); }}>Open Vault</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'guide' && (
                <div>
                  <div className="settings-header">
                    <h2 className="settings-title">Professional Guide</h2>
                    <button className="close-btn" onClick={closeSettings}>✕</button>
                  </div>
                  
                  <div className="settings-group" style={{ padding: '24px', backgroundColor: '#282a2d' }}>
                    <h3 style={{ color: '#e8eaed', fontSize: '1.1rem', marginTop: 0 }}>System Workflow Protocol</h3>
                    <p style={{ color: '#9aa0a6', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
                      This platform serves as a centralized intelligence node for correlating unidentified forensic remains with missing persons registries using advanced Computer Vision models.
                    </p>
                    
                    <h4 style={{ color: '#8ab4f8', marginTop: '20px', marginBottom: '8px', fontSize: '0.95rem' }}>1. Case Ingestion Pipeline</h4>
                    <ul style={{ paddingLeft: '20px', color: '#bdc1c6', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                      <li>Navigate to <strong>Upload Case Data</strong> to initialize a new physical recovery log.</li>
                      <li>Attach scene imagery. The Python AI node will automatically extract biological estimates and scan for distinctive physical artifacts.</li>
                    </ul>

                    <h4 style={{ color: '#8ab4f8', marginTop: '20px', marginBottom: '8px', fontSize: '0.95rem' }}>2. Registry Cross-Referencing</h4>
                    <ul style={{ paddingLeft: '20px', color: '#bdc1c6', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                      <li>Active cases populate on the <strong>Cases Dashboard</strong>. Click "Run Cross-Reference" to execute the probability matrix.</li>
                      <li>The algorithm calculates match probability based on biological bounds, geographical proximity, and artifact string matches.</li>
                    </ul>

                    <h4 style={{ color: '#8ab4f8', marginTop: '20px', marginBottom: '8px', fontSize: '0.95rem' }}>3. Data Lifecycle</h4>
                    <ul style={{ paddingLeft: '20px', color: '#bdc1c6', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <li>Never permanently delete active intelligence. Use the <strong>Archive</strong> function to move closed cases to the Recycle Bin.</li>
                      <li>Archived data is explicitly excluded from matching algorithms to prevent cross-contamination.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div>
                  <div className="settings-header">
                    <h2 className="settings-title">Data Controls</h2>
                    <button className="close-btn" onClick={closeSettings}>✕</button>
                  </div>
                  
                  <div className="settings-group">
                    <div className="settings-row" style={{ alignItems: 'flex-start' }}>
                      <div style={{ paddingRight: '20px' }}>
                        <div className="row-info-title">Extract Global Database</div>
                        <div className="row-info-desc">
                          Compile all active Unidentified Remains cases and Missing Persons profiles into a formatted spreadsheet (.csv). This data is sensitive and action is audited.
                        </div>
                      </div>
                      <button className="btn-action btn-export" onClick={handleExportData} disabled={isExporting}>
                        {isExporting ? 'Compiling...' : 'Download CSV'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'purge' && (
                <div>
                  <div className="settings-header">
                    <h2 className="settings-title" style={{ color: '#f87171' }}>Danger Zone</h2>
                    <button className="close-btn" onClick={closeSettings}>✕</button>
                  </div>
                  
                  <div className="settings-group" style={{ border: '1px solid #f87171', backgroundColor: 'rgba(248, 113, 113, 0.05)' }}>
                    <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
                      <h3 style={{ color: '#fca5a5', marginTop: 0, fontSize: '1.1rem' }}>Global System Purge</h3>
                      <p style={{ color: '#e8eaed', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
                        This action will permanently destroy <strong>all records</strong> from the PostgreSQL database, bypassing the Recycle Bin entirely.
                      </p>
                      
                      <div style={{ width: '100%', marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#f87171', letterSpacing: '0.5px', marginBottom: '8px' }}>
                          TYPE "PURGE" TO AUTHORIZE
                        </label>
                        <input 
                          type="text" 
                          value={purgeInput} 
                          onChange={(e) => setPurgeInput(e.target.value)} 
                          className="security-input-dark"
                          placeholder="PURGE"
                          autoComplete="off"
                        />
                      </div>

                      <button 
                        style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: purgeInput === 'PURGE' ? 'pointer' : 'not-allowed', opacity: purgeInput === 'PURGE' ? 1 : 0.5, transition: 'all 0.2s' }}
                        onClick={handleGlobalPurge} 
                        disabled={isPurging || purgeInput !== 'PURGE'}
                      >
                        {isPurging ? 'EXECUTING DATA WIPEOUT...' : 'CONFIRM PURGE ALL DATA'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}