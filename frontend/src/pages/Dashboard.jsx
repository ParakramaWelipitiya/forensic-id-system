// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend when the dashboard loads
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
                <th style={{ padding: '15px 20px' }}>AI Confidence</th>
                <th style={{ padding: '15px 20px' }}>Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', color: '#0f172a' }}>{c.recovery_case_number}</td>
                  <td style={{ padding: '15px 20px', color: '#475569' }}>{c.recovery_location}</td>
                  
                  {/* Dynamic AI Status Column */}
                  <td style={{ padding: '15px 20px' }}>
                    {c.predicted_sex ? (
                      <div>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Analysis Complete
                        </span>
                        <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#475569' }}>
                          <strong>Sex:</strong> {c.predicted_sex} <br/>
                          <strong>Est. Age:</strong> {c.predicted_age_min} - {c.predicted_age_max} yrs <br/>
                          <strong>Est. Height:</strong> {c.predicted_height_cm_min} - {c.predicted_height_cm_max} cm
                        </div>
                      </div>
                    ) : (
                      <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Pending Analysis
                      </span>
                    )}
                  </td>

                  {/* Confidence Score Column */}
                  <td style={{ padding: '15px 20px', color: '#475569', fontWeight: '500' }}>
                    {c.ai_confidence_score ? `${(c.ai_confidence_score * 100).toFixed(0)}%` : 'N/A'}
                  </td>

                  <td style={{ padding: '15px 20px', color: '#475569' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}