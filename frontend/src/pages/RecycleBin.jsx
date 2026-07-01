import React, { useState, useEffect } from 'react';
import api from '../api';

export default function RecycleBin() {
  const [activeTab, setActiveTab] = useState('cases'); 
  
  const [archivedCases, setArchivedCases] = useState([]);
  const [archivedMissing, setArchivedMissing] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, id: null, title: '', message: '' });
  const [isProcessingModal, setIsProcessingModal] = useState(false);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const response = await api.get('/archive');
      setArchivedCases(response.data.cases);
      setArchivedMissing(response.data.missing_persons);
    } catch (error) {
      console.error("Error accessing recycle bin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCase = async (id) => {
    try {
      await api.patch(`/cases/${id}/restore`);
      setArchivedCases(archivedCases.filter(c => c.id !== id));
    } catch (error) { console.error("Failed to restore case:", error); }
  };

  const handleRestoreMissing = async (id) => {
    try {
      await api.patch(`/missing/${id}/restore`);
      setArchivedMissing(archivedMissing.filter(m => m.id !== id));
    } catch (error) { console.error("Failed to restore missing person:", error); }
  };

  const triggerPermanentDeleteCase = (id) => {
    setConfirmDialog({ isOpen: true, type: 'case', id, title: 'CRITICAL WARNING: Permanent Purge', message: 'This action is irreversible. The case file and all linked AI inferences will be permanently destroyed. Do you wish to proceed?' });
  };

  const triggerPermanentDeleteMissing = (id) => {
    setConfirmDialog({ isOpen: true, type: 'missing', id, title: 'CRITICAL WARNING: Permanent Purge', message: 'This action is irreversible. The missing person registry profile will be permanently destroyed. Do you wish to proceed?' });
  };

  const executeModalConfirm = async () => {
    setIsProcessingModal(true);
    try {
      if (confirmDialog.type === 'case') {
        await api.delete(`/cases/${confirmDialog.id}/permanent`);
        setArchivedCases(archivedCases.filter(c => c.id !== confirmDialog.id));
      } else if (confirmDialog.type === 'missing') {
        await api.delete(`/missing/${confirmDialog.id}/permanent`);
        setArchivedMissing(archivedMissing.filter(m => m.id !== confirmDialog.id));
      }
    } catch (error) {
      console.error(error);
      alert("Database failed to execute permanent purge.");
    } finally {
      setIsProcessingModal(false);
      setConfirmDialog({ isOpen: false, type: null, id: null, title: '', message: '' });
    }
  };


  if (loading) {
    return <p style={{ padding: '40px', color: '#64748b', fontFamily: 'system-ui' }}>Opening Recycle Bin...</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '1100px', margin: '0 auto' }}>
      
      <style>{`
        .tab-btn { padding: 12px 24px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; border-bottom: 3px solid transparent; background: transparent; transition: all 0.2s; color: #64748b; }
        .tab-btn.active { color: #0284c7; border-bottom: 3px solid #0284c7; }
        .btn-restore { padding: 10px 20px; background-color: white; color: #0284c7; border: 1px solid #bae6fd; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: all 0.2s; }
        .btn-purge { padding: 10px 20px; background-color: #fef2f2; color: #ef4444; border: 1px solid #fecaca; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.85rem; transition: all 0.2s; }
        .btn-purge:hover { background-color: #fee2e2; }
      `}</style>

      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }} onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', border: '2px solid #ef4444' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
              <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.1rem', fontWeight: '800' }}>{confirmDialog.title}</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} style={{ padding: '10px 16px', backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={executeModalConfirm} disabled={isProcessingModal} style={{ padding: '10px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  {isProcessingModal ? 'Purging...' : 'PERMANENTLY DELETE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
          System Recycle Bin
        </h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
          Deactivated files. Records here are excluded from active cross-reference algorithms.
        </p>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>
          RECYCLED REMAINS ({archivedCases.length})
        </button>
        <button className={`tab-btn ${activeTab === 'missing' ? 'active' : ''}`} onClick={() => setActiveTab('missing')}>
          RECYCLED PERSONS ({archivedMissing.length})
        </button>
      </div>

      {activeTab === 'cases' && (
        archivedCases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>No cases in recycle bin.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {archivedCases.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: 0.8 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>RECYCLED CASE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#475569', marginTop: '4px' }}>{c.recovery_case_number}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Recovered at: {c.recovery_location}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleRestoreCase(c.id)} className="btn-restore">RESTORE TO INDEX</button>
                  <button onClick={() => triggerPermanentDeleteCase(c.id)} className="btn-purge">PERMANENTLY DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'missing' && (
        archivedMissing.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>No missing persons in recycle bin.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {archivedMissing.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', opacity: 0.8 }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>RECYCLED PERSON</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#475569', marginTop: '4px' }}>{m.case_number} - {m.first_name} {m.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Last seen at: {m.last_known_location}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleRestoreMissing(m.id)} className="btn-restore">RESTORE TO INDEX</button>
                  <button onClick={() => triggerPermanentDeleteMissing(m.id)} className="btn-purge">PERMANENTLY DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}