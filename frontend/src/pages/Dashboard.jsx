import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('cases'); 
  
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [editCaseForm, setEditCaseForm] = useState({ caseNumber: '', location: '', notes: '', image: null });
  const [isUpdatingCase, setIsUpdatingCase] = useState(false);

  const [missingPersons, setMissingPersons] = useState([]);
  const [loadingMissing, setLoadingMissing] = useState(true);
  const [editingMissingId, setEditingMissingId] = useState(null);
  const [editMissingForm, setEditMissingForm] = useState({});

  const [openMenuId, setOpenMenuId] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, id: null, title: '', message: '' });
  const [isProcessingModal, setIsProcessingModal] = useState(false);

  useEffect(() => {
    fetchCases();
    fetchMissingPersons();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoadingCases(false); }
  };

  const fetchMissingPersons = async () => {
    try {
      const response = await api.get('/missing');
      setMissingPersons(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoadingMissing(false); }
  };

  const handleViewMatches = async (caseId) => {
    if (editingCaseId) return;
    if (selectedCaseId === caseId) { setSelectedCaseId(null); setPotentialMatches([]); return; }
    setSelectedCaseId(caseId);
    setLoadingMatches(true);
    setPotentialMatches([]);
    try {
      const response = await api.get(`/cases/${caseId}/matches`);
      setPotentialMatches(response.data.matches);
    } catch (error) { console.error(error); } 
    finally { setLoadingMatches(false); }
  };

  const startEditingCase = (caseObj) => {
    setEditingCaseId(caseObj.id);
    let currentNotes = "";
    try {
      const artifacts = typeof caseObj.found_artifacts === 'string' ? JSON.parse(caseObj.found_artifacts) : caseObj.found_artifacts;
      currentNotes = artifacts?.investigator_notes || "";
    } catch (e) { currentNotes = ""; }
    setEditCaseForm({ caseNumber: caseObj.recovery_case_number, location: caseObj.recovery_location, notes: currentNotes, image: null });
  };

  const saveEditCase = async (caseId) => {
    setIsUpdatingCase(true);
    try {
      const formData = new FormData();
      formData.append('caseNumber', editCaseForm.caseNumber);
      formData.append('location', editCaseForm.location);
      formData.append('notes', editCaseForm.notes);
      if (editCaseForm.image) formData.append('image', editCaseForm.image);

      const response = await api.put(`/cases/${caseId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCases(cases.map(c => c.id === caseId ? response.data.case : c));
      setEditingCaseId(null);
    } catch (error) { alert("Failed to save case edits."); } 
    finally { setIsUpdatingCase(false); }
  };

  const startEditingMissing = (person) => {
    setEditingMissingId(person.id);
    let desc = "";
    try {
      const art = typeof person.artifacts === 'string' ? JSON.parse(person.artifacts) : person.artifacts;
      desc = art?.description || "";
    } catch (e) { desc = ""; }

    setEditMissingForm({
      caseNumber: person.case_number, firstName: person.first_name, lastName: person.last_name,
      biologicalSex: person.biological_sex, ageMin: person.age_min, ageMax: person.age_max,
      heightMin: person.height_cm_min, heightMax: person.height_cm_max, location: person.last_known_location,
      artifacts: desc
    });
  };

  const saveEditMissing = async (id) => {
    try {
      const response = await api.put(`/missing/${id}`, editMissingForm);
      setMissingPersons(missingPersons.map(m => m.id === id ? response.data.person : m));
      setEditingMissingId(null);
    } catch (error) { alert("Failed to save missing person edits."); }
  };

  const triggerRecycleCase = (id) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'case', id, title: 'Archive Case Record', message: 'Are you sure you want to move this file to the Recycle Bin? It will be removed from active cross-referencing algorithms.' });
  };

  const triggerRecycleMissing = (id) => {
    setOpenMenuId(null);
    setConfirmDialog({ isOpen: true, type: 'missing', id, title: 'Archive Missing Person', message: 'Are you sure you want to move this missing person to the Recycle Bin? They will no longer appear in match results.' });
  };

  const executeModalConfirm = async () => {
    setIsProcessingModal(true);
    try {
      if (confirmDialog.type === 'case') {
        await api.patch(`/cases/${confirmDialog.id}/archive`);
        setCases(cases.filter(c => c.id !== confirmDialog.id));
        if (selectedCaseId === confirmDialog.id) setSelectedCaseId(null);
      } else if (confirmDialog.type === 'missing') {
        await api.patch(`/missing/${confirmDialog.id}/archive`);
        setMissingPersons(missingPersons.filter(m => m.id !== confirmDialog.id));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to archive record.");
    } finally {
      setIsProcessingModal(false);
      setConfirmDialog({ isOpen: false, type: null, id: null, title: '', message: '' });
    }
  };

  if (loadingCases || loadingMissing) {
    return (
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px', color: '#64748b' }}>
        <div style={{ width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>Synchronizing distributed ledger entries...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const processedCases = cases.filter(c => c.predicted_sex).length;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .edit-input { width: 100%; padding: 8px 12px; border: 1px solid #94a3b8; border-radius: 4px; font-family: inherit; font-size: 0.9rem; background-color: #f8fafc; }
        .edit-input:focus { outline: none; border-color: #0284c7; box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15); background-color: white;}
        .action-btn { padding: 8px 16px; border-radius: 4px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s ease; }
        .tab-btn { padding: 12px 24px; font-weight: 700; font-size: 0.95rem; cursor: pointer; border: none; border-bottom: 3px solid transparent; background: transparent; transition: all 0.2s; color: #64748b; }
        .tab-btn.active { color: #0284c7; border-bottom: 3px solid #0284c7; }
        
        .dots-btn { background: transparent; border: none; font-size: 1.25rem; font-weight: bold; color: #94a3b8; cursor: pointer; padding: 4px 10px; border-radius: 4px; transition: all 0.2s;}
        .dots-btn:hover { background-color: #e2e8f0; color: #0f172a; }
        .dropdown-menu { position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 50; width: 190px; overflow: hidden;}
        .dropdown-item { width: 100%; text-align: left; padding: 12px 16px; background: none; border: none; font-size: 0.85rem; font-weight: 600; color: #ef4444; cursor: pointer; transition: background 0.1s;}
        .dropdown-item:hover { background-color: #fef2f2; }
      `}</style>

      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }} onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}>
          <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', border: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>{confirmDialog.title}</h3>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 24px 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} style={{ padding: '10px 16px', backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button onClick={executeModalConfirm} disabled={isProcessingModal} style={{ padding: '10px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  {isProcessingModal ? 'Archiving...' : 'Move to Recycle Bin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Active Forensic Index</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Review core biometric logs and manage missing persons parameters.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px 24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px' }}>TOTAL LOGGED CASES</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '6px', lineHeight: 1 }}>{cases.length}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px 24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px' }}>AI PARSED RECORDS</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16a34a', marginTop: '6px', lineHeight: 1 }}>{processedCases}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px 24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px' }}>ACTIVE MISSING PERSONS</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0284c7', marginTop: '6px', lineHeight: 1 }}>{missingPersons.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>UNIDENTIFIED REMAINS</button>
        <button className={`tab-btn ${activeTab === 'missing' ? 'active' : ''}`} onClick={() => setActiveTab('missing')}>MISSING PERSONS REGISTRY</button>
      </div>

      {activeTab === 'cases' && (
        cases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>No active cases initialized in the system.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cases.map((c) => {
              const isExpanded = selectedCaseId === c.id;
              const isEditing = editingCaseId === c.id;

              return (
                <div key={c.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: isExpanded || isEditing ? '1px solid #0284c7' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.01)', overflow: 'hidden' }}>
                  <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: isExpanded || isEditing ? '#f8fafc' : 'white' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 220px 1fr', gap: '30px', flex: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>CASE IDENTITY</div>
                        {isEditing ? <input type="text" value={editCaseForm.caseNumber} onChange={(e) => setEditCaseForm({...editCaseForm, caseNumber: e.target.value})} className="edit-input" style={{marginTop: '6px'}} /> : <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{c.recovery_case_number}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>RECOVERY LOCATION</div>
                        {isEditing ? <input type="text" value={editCaseForm.location} onChange={(e) => setEditCaseForm({...editCaseForm, location: e.target.value})} className="edit-input" style={{marginTop: '6px'}}/> : <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '500', marginTop: '6px' }}>{c.recovery_location}</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>BIOLOGICAL ESTIMATE</div>
                        <div style={{ marginTop: '6px' }}>
                          {isEditing ? <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '6px 0' }}>Metrics recalculate on new image.</div> : c.predicted_sex ? <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a' }} /><span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '600' }}>{c.predicted_sex} <span style={{ color: '#64748b', fontWeight: '400' }}>(Age: {c.predicted_age_min}-{c.predicted_age_max})</span></span></div> : <span style={{ fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '20px', fontWeight: '700' }}>Awaiting AI Parsing</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button onClick={() => handleViewMatches(c.id)} disabled={!c.predicted_sex || isEditing} style={{ padding: '12px 24px', backgroundColor: !c.predicted_sex || isEditing ? '#f1f5f9' : isExpanded ? '#475569' : '#0284c7', color: !c.predicted_sex || isEditing ? '#94a3b8' : 'white', border: 'none', borderRadius: '6px', cursor: !c.predicted_sex || isEditing ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '0.85rem' }}>
                        {isExpanded ? 'Collapse Intel' : 'Run Cross-Reference'}
                      </button>
                    </div>
                  </div>

                  {(isExpanded || isEditing) && (
                    <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#fcfdfe' }}>
                      <div style={{ padding: '16px 32px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>ADMINISTRATIVE CONTROLS</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {isEditing ? (
                            <>
                              <button className="action-btn" disabled={isUpdatingCase} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#64748b' }} onClick={() => setEditingCaseId(null)}>Cancel</button>
                              <button className="action-btn" disabled={isUpdatingCase} style={{ backgroundColor: '#10b981', color: 'white' }} onClick={() => saveEditCase(c.id)}>{isUpdatingCase ? 'Recalculating...' : 'Save & Process Parameters'}</button>
                            </>
                          ) : (
                            <>
                              <button className="action-btn" style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#334155' }} onClick={() => startEditingCase(c)}>Edit Context</button>
                              
                              <div style={{ position: 'relative' }}>
                                <button className="dots-btn" onClick={() => setOpenMenuId(openMenuId === `case-${c.id}` ? null : `case-${c.id}`)}>⋮</button>
                                {openMenuId === `case-${c.id}` && (
                                  <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)}></div>
                                    <div className="dropdown-menu">
                                      {/* Trigger Custom Modal */}
                                      <button className="dropdown-item" onClick={() => triggerRecycleCase(c.id)}>🗑 Move to Recycle Bin</button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: '32px' }}>
                        {isEditing ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>UPDATE INVESTIGATOR NOTES</label><textarea className="edit-input" rows="4" value={editCaseForm.notes} onChange={(e) => setEditCaseForm({...editCaseForm, notes: e.target.value})} style={{ resize: 'vertical' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>REPLACE IMAGE MATRIX (TRIGGERS AI RE-RUN)</label><input type="file" accept="image/*" onChange={(e) => setEditCaseForm({...editCaseForm, image: e.target.files[0]})} className="edit-input" style={{ backgroundColor: 'white' }} /><p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '8px 0 0 0' }}>Leave blank to keep existing evidence.</p></div>
                          </div>
                        ) : (
                          <>
                            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', margin: '0 0 20px 0' }}>PROBABILITY MATRIX ENGINE RESULTS ({potentialMatches.length} ALIGNED LEADS)</h3>
                            {loadingMatches ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Analyzing database metrics...</p> : potentialMatches.length === 0 ? (
                              <div style={{ padding: '16px', backgroundColor: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)', borderRadius: '6px' }}><p style={{ color: '#b45309', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>No dynamic structural intersections found.</p></div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {potentialMatches.map((match) => (
                                  <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <div><div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{match.first_name} {match.last_name} <span style={{ color: '#94a3b8', fontWeight: '500', marginLeft: '8px', fontSize: '0.85rem' }}>({match.case_number})</span></div><div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>Biological Sex: <span style={{ color: '#334155' }}>{match.biological_sex}</span> | Native Bounds: <span style={{ color: '#334155' }}>{match.age_min}-{match.age_max} yrs</span> | Last Seen: <span style={{ color: '#334155' }}>{match.last_known_location}</span></div></div>
                                    <div style={{ textAlign: 'right', minWidth: '120px', borderLeft: '1px solid #f1f5f9', paddingLeft: '24px' }}><div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800' }}>CONFIDENCE MATCH</div><div style={{ fontSize: '1.4rem', fontWeight: '800', color: match.match_probability > 70 ? '#16a34a' : '#475569', marginTop: '4px', lineHeight: 1 }}>{match.match_probability}%</div></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === 'missing' && (
        missingPersons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}><p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>No active missing persons registered in the system.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {missingPersons.map((person) => {
              const isEditing = editingMissingId === person.id;

              return (
                <div key={person.id} style={{ backgroundColor: 'white', borderRadius: '12px', border: isEditing ? '1px solid #0284c7' : '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.01)', overflow: 'hidden' }}>
                  
                  <div style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: isEditing ? '#f8fafc' : 'white' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 220px 1fr', gap: '30px', flex: 1 }}>
                      <div><div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>RECORD ID</div>{isEditing ? <input type="text" value={editMissingForm.caseNumber} onChange={(e) => setEditMissingForm({...editMissingForm, caseNumber: e.target.value})} className="edit-input" style={{marginTop: '6px'}} /> : <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{person.case_number}</div>}</div>
                      <div><div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>FULL NAME</div>{isEditing ? <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}><input type="text" value={editMissingForm.firstName} onChange={(e) => setEditMissingForm({...editMissingForm, firstName: e.target.value})} className="edit-input" placeholder="First" /><input type="text" value={editMissingForm.lastName} onChange={(e) => setEditMissingForm({...editMissingForm, lastName: e.target.value})} className="edit-input" placeholder="Last" /></div> : <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '700', marginTop: '6px' }}>{person.first_name} {person.last_name}</div>}</div>
                      <div><div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>LAST KNOWN LOCATION</div>{isEditing ? <input type="text" value={editMissingForm.location} onChange={(e) => setEditMissingForm({...editMissingForm, location: e.target.value})} className="edit-input" style={{marginTop: '6px'}} /> : <div style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '500', marginTop: '6px' }}>{person.last_known_location}</div>}</div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#fcfdfe' }}>
                      <div style={{ padding: '16px 32px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>EDIT BIOMETRICS & ARTIFACTS</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="action-btn" style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#64748b' }} onClick={() => setEditingMissingId(null)}>Cancel</button>
                          <button className="action-btn" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={() => saveEditMissing(person.id)}>Save Parameters</button>
                        </div>
                      </div>
                      <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>BIOLOGICAL SEX</label>
                          <select className="edit-input" value={editMissingForm.biologicalSex} onChange={(e) => setEditMissingForm({...editMissingForm, biologicalSex: e.target.value})}>
                            <option value="Male">Male</option><option value="Female">Female</option><option value="Unknown">Unknown</option>
                          </select>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>AGE MIN</label><input type="number" className="edit-input" value={editMissingForm.ageMin} onChange={(e) => setEditMissingForm({...editMissingForm, ageMin: e.target.value})} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>AGE MAX</label><input type="number" className="edit-input" value={editMissingForm.ageMax} onChange={(e) => setEditMissingForm({...editMissingForm, ageMax: e.target.value})} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>HEIGHT MIN</label><input type="number" step="0.1" className="edit-input" value={editMissingForm.heightMin} onChange={(e) => setEditMissingForm({...editMissingForm, heightMin: e.target.value})} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8' }}>HEIGHT MAX</label><input type="number" step="0.1" className="edit-input" value={editMissingForm.heightMax} onChange={(e) => setEditMissingForm({...editMissingForm, heightMax: e.target.value})} /></div>
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>KNOWN ARTIFACTS / BELONGINGS</label>
                          <textarea className="edit-input" rows="7" value={editMissingForm.artifacts} onChange={(e) => setEditMissingForm({...editMissingForm, artifacts: e.target.value})} style={{ resize: 'vertical' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '16px 32px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Sex:</strong> {person.biological_sex}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Age:</strong> {person.age_min}-{person.age_max}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}><strong>Height:</strong> {person.height_cm_min}-{person.height_cm_max} cm</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button className="action-btn" style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#334155' }} onClick={() => startEditingMissing(person)}>Edit</button>
                        
                        <div style={{ position: 'relative' }}>
                          <button className="dots-btn" onClick={() => setOpenMenuId(openMenuId === `missing-${person.id}` ? null : `missing-${person.id}`)}>⋮</button>
                          {openMenuId === `missing-${person.id}` && (
                            <>
                              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)}></div>
                              <div className="dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: '4px' }}>
                                <button className="dropdown-item" onClick={() => triggerRecycleMissing(person.id)}>🗑 Move to Recycle Bin</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

    </div>
  );
}