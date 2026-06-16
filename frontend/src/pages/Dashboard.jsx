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
                <th style={{ padding: '15px 20px' }}>AI Status</th>
                <th style={{ padding: '15px 20px' }}>Date Logged</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '15px 20px', fontWeight: '500', color: '#0f172a' }}>{c.recovery_case_number}</td>
                  <td style={{ padding: '15px 20px', color: '#475569' }}>{c.recovery_location}</td>
                  <td style={{ padding: '15px 20px' }}>
                    {/* Since AI hasn't processed this yet, we show a Pending badge */}
                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Pending Analysis
                    </span>
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