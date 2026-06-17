// frontend/src/pages/MissingPersonsRegistry.jsx
import { useState } from 'react';
import api from '../api';

export default function MissingPersonsRegistry() {
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

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' };
  const labelStyle = { fontWeight: '500', color: '#334155' };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Missing Persons Registry</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Case Number</label>
            <input type="text" name="caseNumber" value={formData.caseNumber} required onChange={handleChange} style={inputStyle} placeholder="e.g., MP-2026-X8" />
          </div>
          <div>
            <label style={labelStyle}>Biological Sex</label>
            <select name="biologicalSex" value={formData.biologicalSex} onChange={handleChange} style={inputStyle}>
              <option value="Unknown">Unknown</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input type="text" name="firstName" value={formData.firstName} required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} required onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Min Age (Years)</label>
            <input type="number" name="ageMin" value={formData.ageMin} required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Age (Years)</label>
            <input type="number" name="ageMax" value={formData.ageMax} required onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Min Height (cm)</label>
            <input type="number" step="0.1" name="heightMin" value={formData.heightMin} required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Height (cm)</label>
            <input type="number" step="0.1" name="heightMax" value={formData.heightMax} required onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        <label style={labelStyle}>Last Known Location (City / District)</label>
        <input type="text" name="location" value={formData.location} required onChange={handleChange} style={inputStyle} placeholder="e.g., Gampaha District" />

        <label style={labelStyle}>Known Belongings / Distinctive Artifacts</label>
        <textarea name="artifacts" rows="3" value={formData.artifacts} onChange={handleChange} style={inputStyle} placeholder="e.g., wearing a metallic watch, carrying a leather backpack..."></textarea>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Register Missing Person
        </button>

        {statusMessage && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', backgroundColor: statusMessage.includes('Success') ? '#dcfce7' : '#fee2e2', color: statusMessage.includes('Success') ? '#166534' : '#991b1b', textAlign: 'center' }}>
            {statusMessage}
          </div>
        )}
        
      </form>
    </div>
  );
}