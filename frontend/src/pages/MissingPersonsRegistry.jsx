// frontend/src/pages/MissingPersonsRegistry.jsx
import { useState } from 'react';
import api from '../api';

export default function MissingPersonsRegistry() {
  // --- YOUR EXACT ORIGINAL LOGIC & STATE UNTOUCHED ---
  const [formData, setFormData] = useState({
    caseNumber: '',
    firstName: '',
    lastName: '',
    ageMin: '',
    ageMax: '',
    biologicalSex: 'Unknown',
    heightMin: '',
    heightMax: '',
    location: '',
    artifacts: ''
  });

  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Registering profile...');

    try {
      await api.post('/missing', formData);
      setStatusMessage('Success! Missing person record added to system database.');
      setFormData({
        caseNumber: '', firstName: '', lastName: '',
        ageMin: '', ageMax: '', biologicalSex: 'Unknown',
        heightMin: '', heightMax: '', location: '', artifacts: ''
      });
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Server transmission failed.');
    }
  };
  // ----------------------------------------------------

  const isSuccess = statusMessage.includes('Success');
  const isLoading = statusMessage.includes('Registering');

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Shared Design System CSS Components */}
      <style>
        {`
          .reg-input, .reg-select, .reg-textarea {
            width: 100%; padding: 12px 16px; margin-top: 6px;
            background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;
            color: #1e293b; font-size: 0.95rem; outline: none; box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .reg-input:focus, .reg-select:focus, .reg-textarea:focus {
            border-color: #0284c7; background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          }
          .reg-select {
            appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat; background-position: right 12px center; background-size: 16px;
          }
          .reg-label {
            font-weight: 700; font-size: 0.75rem; letter-spacing: 0.5px;
            display: block; text-transform: uppercase; color: #64748b;
          }
          .section-block {
            background-color: #fcfdfe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;
            margin-bottom: 24px;
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
          @keyframes spin { to { transform: rotate(360deg); } }
        `}
      </style>

      {/* Header Panel */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
          Missing Persons Registry
        </h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>
          Input confirmed biometric and operational parameters to prime the database for cross-referencing.
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        {/* Dynamic Status Bar */}
        {statusMessage && (
          <div style={{ 
            padding: '16px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '600',
            backgroundColor: isLoading ? '#f8fafc' : isSuccess ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${isLoading ? '#cbd5e1' : isSuccess ? '#bbf7d0' : '#fecaca'}`,
            color: isLoading ? '#475569' : isSuccess ? '#16a34a' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {isLoading && <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #cbd5e1', borderTopColor: '#475569', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: IDENTITY INDIFIERS */}
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>I. INDIVIDUAL IDENTIFIERS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="reg-label">Case Number *</label>
                <input type="text" name="caseNumber" value={formData.caseNumber} required onChange={handleChange} className="reg-input" placeholder="e.g., MP-2026-X8" />
              </div>
              <div>
                <label className="reg-label">Biological Sex</label>
                <select name="biologicalSex" value={formData.biologicalSex} onChange={handleChange} className="reg-select">
                  <option value="Unknown">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div>
                <label className="reg-label">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} required onChange={handleChange} className="reg-input" placeholder="Jane" />
              </div>
              <div>
                <label className="reg-label">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} required onChange={handleChange} className="reg-input" placeholder="Doe" />
              </div>
            </div>
          </div>

          {/* SECTION 2: BIOMETRIC CRITERIA METRICS */}
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>II. BIOMETRIC SCALE MAPS</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <label className="reg-label">Estimated Age Profile Horizon (Years)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                  <input type="number" name="ageMin" value={formData.ageMin} required onChange={handleChange} className="reg-input" placeholder="Min Age" />
                  <input type="number" name="ageMax" value={formData.ageMax} required onChange={handleChange} className="reg-input" placeholder="Max Age" />
                </div>
              </div>

              <div style={{ paddingLeft: '32px', borderLeft: '1px dashed #cbd5e1' }}>
                <label className="reg-label">Skeletal Height Horizons (Centimeters)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                  <input type="number" step="0.1" name="heightMin" value={formData.heightMin} required onChange={handleChange} className="reg-input" placeholder="Min cm" />
                  <input type="number" step="0.1" name="heightMax" value={formData.heightMax} required onChange={handleChange} className="reg-input" placeholder="Max cm" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: EVIDENTIAL & COORDINATE PROFILE */}
          <div className="section-block" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px' }}>III. PHYSICAL & SPATIAL EVIDENCE</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="reg-label">Last Known Location (City / District) *</label>
              <input type="text" name="location" value={formData.location} required onChange={handleChange} className="reg-input" placeholder="e.g., Gampaha District" />
            </div>

            <div>
              <label className="reg-label">Known Belongings / Distinctive Artifacts</label>
              <textarea name="artifacts" rows="3" value={formData.artifacts} onChange={handleChange} className="reg-textarea" placeholder="e.g., wearing a metallic watch, carrying a leather backpack..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          {/* Form Action Submitter */}
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '32px', paddingTop: '24px' }}>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'COMMITTING DATA MAPS...' : 'REGISTER MISSING PERSON'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}