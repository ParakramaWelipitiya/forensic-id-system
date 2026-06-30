// frontend/src/pages/MissingPersonsRegistry.jsx
import { useState } from 'react';
import api from '../api';

export default function MissingPersonsRegistry() {
  const [formData, setFormData] = useState({ caseNumber: '', firstName: '', lastName: '', ageMin: '', ageMax: '', biologicalSex: 'Unknown', heightMin: '', heightMax: '', location: '', artifacts: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Custom Floating Toast State
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/missing', formData);
      
      // Trigger Success Toast Popup
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000); // Auto-hide after 4 seconds

      setFormData({ caseNumber: '', firstName: '', lastName: '', ageMin: '', ageMax: '', biologicalSex: 'Unknown', heightMin: '', heightMax: '', location: '', artifacts: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Server transmission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
      
      <style>{`
        .reg-input, .reg-select, .reg-textarea { width: 100%; padding: 12px 16px; margin-top: 6px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; color: #1e293b; font-size: 0.95rem; outline: none; box-sizing: border-box; transition: all 0.2s ease; }
        .reg-input:focus, .reg-select:focus, .reg-textarea:focus { border-color: #0284c7; background-color: #ffffff; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
        .reg-label { font-weight: 700; font-size: 0.75rem; letter-spacing: 0.5px; display: block; color: #64748b; }
        .section-block { background-color: #fcfdfe; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .submit-btn { padding: 14px 28px; background-color: #0284c7; color: white; border: none; border-radius: 6px; font-size: 0.95rem; cursor: pointer; font-weight: 700; transition: all 0.2s ease; width: 100%; }
        .submit-btn:hover:not(:disabled) { background-color: #0369a1; transform: translateY(-1px); }
        @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* FLOATING SUCCESS POPUP (TOAST) */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1000, animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          <div style={{ fontWeight: '600', letterSpacing: '0.5px' }}>Missing person record seamlessly added to database.</div>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Missing Persons Registry</h1>
        <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.95rem' }}>Input confirmed biometric parameters to prime the database.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        {error && <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>I. INDIVIDUAL IDENTIFIERS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label className="reg-label">CASE NUMBER *</label><input type="text" name="caseNumber" value={formData.caseNumber} required onChange={handleChange} className="reg-input" placeholder="e.g., MP-2026-X8" /></div>
              <div><label className="reg-label">BIOLOGICAL SEX</label><select name="biologicalSex" value={formData.biologicalSex} onChange={handleChange} className="reg-select"><option value="Unknown">Unknown</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div><label className="reg-label">FIRST NAME *</label><input type="text" name="firstName" value={formData.firstName} required onChange={handleChange} className="reg-input" /></div>
              <div><label className="reg-label">LAST NAME *</label><input type="text" name="lastName" value={formData.lastName} required onChange={handleChange} className="reg-input" /></div>
            </div>
          </div>

          <div className="section-block">
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>II. BIOMETRIC SCALE MAPS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div><label className="reg-label">AGE PROFILE HORIZON (YRS)</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}><input type="number" name="ageMin" value={formData.ageMin} required onChange={handleChange} className="reg-input" placeholder="Min Age" /><input type="number" name="ageMax" value={formData.ageMax} required onChange={handleChange} className="reg-input" placeholder="Max Age" /></div></div>
              <div style={{ paddingLeft: '32px', borderLeft: '1px dashed #cbd5e1' }}><label className="reg-label">SKELETAL HEIGHT HORIZONS (CM)</label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}><input type="number" step="0.1" name="heightMin" value={formData.heightMin} required onChange={handleChange} className="reg-input" placeholder="Min cm" /><input type="number" step="0.1" name="heightMax" value={formData.heightMax} required onChange={handleChange} className="reg-input" placeholder="Max cm" /></div></div>
            </div>
          </div>

          <div className="section-block" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>III. PHYSICAL & SPATIAL EVIDENCE</h3>
            <div style={{ marginBottom: '20px' }}><label className="reg-label">LAST KNOWN LOCATION *</label><input type="text" name="location" value={formData.location} required onChange={handleChange} className="reg-input" /></div>
            <div><label className="reg-label">KNOWN ARTIFACTS</label><textarea name="artifacts" rows="3" value={formData.artifacts} onChange={handleChange} className="reg-textarea" style={{ resize: 'vertical' }} /></div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '32px', paddingTop: '24px' }}>
            <button type="submit" disabled={loading} className="submit-btn">{loading ? 'COMMITTING DATA...' : 'REGISTER MISSING PERSON'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}