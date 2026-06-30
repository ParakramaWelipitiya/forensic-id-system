// frontend/src/pages/UploadForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function UploadForm() {
  // --- YOUR EXACT ORIGINAL LOGIC & STATE UNTOUCHED ---
  const [caseNumber, setCaseNumber] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('A postmortem or scene image is strictly required for AI analysis.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('caseNumber', caseNumber);
    formData.append('location', location);
    formData.append('notes', notes);
    formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/cases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Case logged successfully. AI Analysis is complete.');
      setCaseNumber('');
      setLocation('');
      setNotes('');
      setImage(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process case data via the server.');
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------------------

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Shared Design System CSS Components */}
      <style>
        {`
          .form-input, .form-textarea {
            width: 100%; padding: 12px 16px; margin-top: 6px;
            background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;
            color: #1e293b; font-size: 0.95rem; outline: none; box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .form-input:focus, .form-textarea:focus {
            border-color: #0284c7; background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }
          .submit-btn {
            padding: 14px 28px; background-color: #0284c7; color: white; border: none; border-radius: 6px; 
            font-size: 0.95rem; cursor: pointer; font-weight: 700; transition: all 0.2s ease; 
            letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2); width: 100%;
          }
          .submit-btn:hover:not(:disabled) {
            background-color: #0369a1; transform: translateY(-1px);
          }
          .submit-btn:disabled {
            background-color: #94a3b8; cursor: not-allowed; box-shadow: none;
          }
          .section-block {
            background-color: #fcfdfe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;
            margin-bottom: 24px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}
      </style>

      {/* Header Panel */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
          Initialize Unidentified Case
        </h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
          Upload scene imagery and preliminary parameters to trigger the computer vision extraction pipeline.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        {/* Dynamic System Notifications */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600' }}>
            ✓ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* BLOCK 1: INDEX SCENARIO METRICS */}
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>I. REGISTRY PARAMETERS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.5px' }}>CASE REGISTRY NUMBER *</label>
                <input type="text" value={caseNumber} required onChange={(e) => setCaseNumber(e.target.value)} className="form-input" placeholder="e.g., UID-2026-X1" />
              </div>
              <div>
                <label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.5px' }}>RECOVERY COORDINATE AREA *</label>
                <input type="text" value={location} required onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="e.g., Gampaha District" />
              </div>
            </div>
          </div>

          {/* BLOCK 2: CONTEXT FIELD NOTES */}
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>II. OPERATIONAL SCENE CONTEXT</h3>
            <div>
              <label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.5px' }}>INVESTIGATOR MATRIX NOTES</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-textarea" rows="4" placeholder="Describe environmental factors, physical retrieval states, or matching assumptions..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* BLOCK 3: FILE IMAGE INGESTION CONTAINER */}
          <div className="section-block" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>III. COMPUTER VISION INPUT DATA</h3>
            <div>
              <label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>EVIDENCE IMAGERY MATRIX *</label>
              <input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files[0])} className="form-input" style={{ backgroundColor: 'white', padding: '10px' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '8px 0 0 0' }}>Attach clean, high-resolution postmortem or physical artifact photographs for extraction.</p>
            </div>
          </div>

          {/* Form Action Submitter */}
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '32px', paddingTop: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                <div style={{ width: '14px', height: '14px', border: '2px solid #cbd5e1', borderTopColor: '#475569', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Transmitting to Computer Vision Node...
              </div>
            )}
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'EXECUTING PIPELINE PARSE...' : 'INITIALIZE AI INGESTION'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}