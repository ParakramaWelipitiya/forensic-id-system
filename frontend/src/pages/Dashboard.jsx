// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track which case is currently expanded to show matches
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch all cases on page load
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

  // Function to trigger the matching engine for a specific case
  const handleViewMatches = async (caseId) => {
    // If the user clicks the same case again, collapse it
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
      console.error("Error cross-referencing matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Active Cases Overview</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '20px', color: '#64748b' }}>Loading active cases...</p>
        ) : cases.length === 0 ? (
          <p style={{ padding: '20px', color: '#64748b' }}>No active cases found. Click 'Upload Case Data' to begin.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '15px 20px' }}>Case Number</th>
                <th style={{ padding: '15px 20px' }}>Location</th>
                <th style={{ padding: '15px 20px' }}>AI Anthropological Profile</th>
                <th style={{ padding: '15px 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <React.Fragment key={c.id}>
                  {/* Main Case Row */}
                  <tr style={{ borderBottom: selectedCaseId === c.id ? 'none' : '1px solid #e2e8f0', backgroundColor: selectedCaseId === c.id ? '#f8fafc' : 'white' }}>
                    <td style={{ padding: '15px 20px', fontWeight: '500', color: '#0f172a' }}>{c.recovery_case_number}</td>
                    <td style={{ padding: '15px 20px', color: '#475569' }}>{c.recovery_location}</td>
                    
                    <td style={{ padding: '15px 20px' }}>
                      {c.predicted_sex ? (
                        <div>
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            Analysis Complete
                          </span>
                          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#475569' }}>
                            <strong>Sex:</strong> {c.predicted_sex} | <strong>Age:</strong> {c.predicted_age_min}-{c.predicted_age_max} yrs
                          </div>
                        </div>
                      ) : (
                        <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Pending Analysis
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '15px 20px' }}>
                      {c.predicted_sex ? (
                        <button 
                          onClick={() => handleViewMatches(c.id)}
                          style={{ padding: '6px 12px', backgroundColor: selectedCaseId === c.id ? '#475569' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                          {selectedCaseId === c.id ? 'Hide Matches' : 'View Matches'}
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Awaiting AI</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded Matching Panel Row */}
                  {selectedCaseId === c.id && (
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td colSpan="4" style={{ padding: '0 20px 20px 20px' }}>
                        <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '20px' }}>
                          <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '1rem' }}>
                            Cross-Reference Engine Results ({potentialMatches.length} Potential Leads Found)
                          </h3>
                          
                          {loadingMatches ? (
                            <p style={{ color: '#64748b' }}>Scanning missing persons database...</p>
                          ) : potentialMatches.length === 0 ? (
                            <p style={{ color: '#b45309' }}>No overlapping cases found matching this biological profile in the system.</p>
                          ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                              {potentialMatches.map((match) => (
                                <div key={match.id} style={{ borderLeft: '4px solid #0ea5e9', paddingLeft: '15px', backgroundColor: '#fdfdfd', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '15px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '1.05rem' }}>
                                      {match.first_name} {match.last_name} ({match.case_number})
                                    </span>
                                    {/* Calculated Match Score Badge */}
                                    <span style={{ backgroundColor: match.match_probability > 70 ? '#dcfce7' : '#f1f5f9', color: match.match_probability > 70 ? '#15803d' : '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                      Match Confidence: {match.match_probability}%
                                    </span>
                                  </div>
                                  
                                  <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '6px' }}>
                                    <strong>Biological Profile:</strong> {match.biological_sex} | {match.age_min} - {match.age_max} yrs
                                  </div>
                                  <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                                    <strong>Last Known Location:</strong> {match.last_known_location}
                                  </div>

                                  {/* Dynamic Link Pill for AI Detected Artifact Hits */}
                                  {match.matched_evidence && match.matched_evidence.length > 0 && (
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '6px 10px', borderRadius: '4px', display: 'inline-block', fontWeight: '500' }}>
                                      🔗 Linked Evidence: {match.matched_evidence.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}