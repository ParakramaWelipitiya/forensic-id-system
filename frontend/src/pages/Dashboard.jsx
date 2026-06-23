// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases');
        setCases(response.data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const handleViewMatches = async (caseId) => {
    if (selectedCaseId === caseId) {
      setSelectedCaseId(null);
      setPotentialMatches([]);
      return;
    }
    setSelectedCaseId(caseId);
    setLoadingMatches(true);
    setPotentialMatches([]);
    try {
      const response = await api.get(`/cases/${caseId}/matches`);
      setPotentialMatches(response.data.matches);
    } catch (error) {
      console.error("Error cross-referencing:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#64748b', fontSize: '1rem', fontFamily: 'sans-serif' }}>Accessing secure repository data...</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Active Forensic Index</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Review core biometric logs and trigger algorithmic matching pipelines.</p>
      </div>

      {cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No active logs initialized in the system database.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {cases.map((c) => {
            const isExpanded = selectedCaseId === c.id;
            return (
              <div key={c.id} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                
                {/* Case Header Banner */}
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isExpanded ? '#f8fafc' : 'white', transition: 'background-color 0.2s' }}>
                  <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>CASE IDENTITY</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>{c.recovery_case_number}</div>
                    </div>
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>RECOVERY LOCATION</div>
                      <div style={{ fontSize: '0.95rem', color: '#334155', marginTop: '4px' }}>{c.recovery_location}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>BIOLOGICAL ESTIMATE</div>
                      <div style={{ marginTop: '4px' }}>
                        {c.predicted_sex ? (
                          <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                            {c.predicted_sex} (Age: {c.predicted_age_min}-{c.predicted_age_max})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            Awaiting AI Parsing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button 
                      onClick={() => handleViewMatches(c.id)}
                      disabled={!c.predicted_sex}
                      style={{ 
                        padding: '10px 20px', 
                        backgroundColor: !c.predicted_sex ? '#e2e8f0' : isExpanded ? '#475569' : '#0284c7', 
                        color: !c.predicted_sex ? '#94a3b8' : 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: !c.predicted_sex ? 'not-allowed' : 'pointer', 
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'background-color 0.2s'
                      }}>
                      {isExpanded ? 'Collapse Intel' : 'Run Cross-Reference'}
                    </button>
                  </div>
                </div>

                {/* Algorithmic Expansion Slot */}
                {isExpanded && (
                  <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fcfdfe' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
                      PROBABILITY MATRIX ENGINE RESULTS ({potentialMatches.length} ALIGNED LEADS)
                    </h3>

                    {loadingMatches ? (
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Analyzing database metrics...</p>
                    ) : potentialMatches.length === 0 ? (
                      <p style={{ color: '#b45309', fontSize: '0.9rem', margin: 0 }}>No dynamic structural intersections found for this biometric segment.</p>
                    ) : (
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {potentialMatches.map((match) => (
                          <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                            <div>
                              <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.95rem' }}>
                                {match.first_name} {match.last_name} 
                                <span style={{ color: '#64748b', fontWeight: '400', marginLeft: '8px', fontSize: '0.85rem' }}>({match.case_number})</span>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                Biological Sex: {match.biological_sex} | Native Bounds: {match.age_min}-{match.age_max} yrs | Last Seen: {match.last_known_location}
                              </div>
                              {match.matched_evidence && match.matched_evidence.length > 0 && (
                                <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                                  {match.matched_evidence.map((item, idx) => (
                                    <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                      Linked Item: {item}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>CONFIDENCE MATCH</div>
                              <div style={{ 
                                fontSize: '1.25rem', 
                                fontWeight: '700', 
                                color: match.match_probability > 70 ? '#16a34a' : '#475569',
                                marginTop: '2px'
                              }}>
                                {match.match_probability}%
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}