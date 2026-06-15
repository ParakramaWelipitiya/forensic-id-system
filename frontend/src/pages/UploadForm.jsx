// frontend/src/pages/UploadForm.jsx
import { useState } from 'react';

export default function UploadForm() {
  const [formData, setFormData] = useState({
    caseNumber: '',
    location: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Case Data to Backend:", formData);
    // Next step will be sending this to the Express server using Axios
    alert("Case logged! AI analysis would trigger here.");
  };

  // Shared styling for inputs to keep the code clean
  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Upload Case Data</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Case Number</label>
        <input type="text" name="caseNumber" required onChange={handleChange} style={inputStyle} placeholder="e.g., DOE-2026-001" />

        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Location</label>
        <input type="text" name="location" required onChange={handleChange} style={inputStyle} placeholder="Enter exact address or coordinates" />

        <label style={{ fontWeight: '500', color: '#334155' }}>Postmortem Images (For AI Analysis)</label>
        <input type="file" multiple accept="image/*" style={inputStyle} />

        <label style={{ fontWeight: '500', color: '#334155' }}>Initial Findings / Found Artifacts</label>
        <textarea name="notes" rows="4" onChange={handleChange} style={inputStyle} placeholder="Describe any distinctive items, clothing, or initial anthropological notes..."></textarea>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Submit to AI Engine
        </button>
        
      </form>
    </div>
  );
}