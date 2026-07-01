import React, { useState } from 'react';
import axios from 'axios';

export default function UploadForm() {
  const [caseNumber, setCaseNumber] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError('A postmortem or scene image is strictly required.'); return; }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('caseNumber', caseNumber);
    formData.append('location', location);
    formData.append('notes', notes);
    formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      setCaseNumber('');
      setLocation('');
      setNotes('');
      setImage(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to process case data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
      
      <style>{`
        .form-input, .form-textarea { width: 100%; padding: 12px 16px; margin-top: 6px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #1e293b; font-size: 0.95rem; outline: none; box-sizing: border-box; transition: all 0.2s ease; }
        .form-input:focus, .form-textarea:focus { border-color: #0284c7; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
        .submit-btn { padding: 14px 28px; background-color: #0284c7; color: white; border: none; border-radius: 6px; font-size: 0.95rem; cursor: pointer; font-weight: 700; transition: all 0.2s ease; width: 100%; }
        .submit-btn:hover:not(:disabled) { background-color: #0369a1; transform: translateY(-1px); }
        .submit-btn:disabled { background-color: #94a3b8; cursor: not-allowed; }
        .section-block { background-color: #fcfdfe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {showToast && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <div style={{ fontWeight: '600', letterSpacing: '0.5px' }}>Case logged successfully. AI Analysis is complete.</div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Initialize Unidentified Case</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Upload scene imagery and parameters to trigger the AI pipeline.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        {error && <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>I. REGISTRY PARAMETERS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem' }}>CASE REGISTRY NUMBER *</label><input type="text" value={caseNumber} required onChange={(e) => setCaseNumber(e.target.value)} className="form-input" placeholder="e.g., UID-2026-X1" /></div>
              <div><label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem' }}>RECOVERY COORDINATE AREA *</label><input type="text" value={location} required onChange={(e) => setLocation(e.target.value)} className="form-input" placeholder="e.g., Gampaha District" /></div>
            </div>
          </div>

          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>II. OPERATIONAL SCENE CONTEXT</h3>
            <div><label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem' }}>INVESTIGATOR MATRIX NOTES</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="form-textarea" rows="4" style={{ resize: 'vertical' }} /></div>
          </div>

          <div className="section-block" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>III. COMPUTER VISION INPUT DATA</h3>
            <div><label style={{ fontWeight: '700', color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>EVIDENCE IMAGERY MATRIX *</label><input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files[0])} className="form-input" style={{ backgroundColor: 'white', padding: '10px' }} /></div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '32px', paddingTop: '24px' }}>
            <button type="submit" disabled={loading} className="submit-btn">{loading ? 'EXECUTING PIPELINE PARSE...' : 'INITIALIZE AI INGESTION'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}