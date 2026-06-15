// frontend/src/pages/UploadForm.jsx
import { useState } from 'react';
import api from '../api'; // Import the axios configuration we made earlier

export default function UploadForm() {
  const [formData, setFormData] = useState({
    caseNumber: '',
    location: '',
    notes: ''
  });
  
  // State to handle UI feedback (loading, success, error)
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('Saving to database...');

    try {
      // Send a POST request to your new backend route
      const response = await api.post('/cases', formData);
      
      setStatusMessage('Success! Case securely logged.');
      console.log('Backend Response:', response.data);
      
      // Clear the form after successful submission
      setFormData({ caseNumber: '', location: '', notes: '' });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatusMessage(error.response?.data?.error || 'Failed to connect to the server.');
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Upload Case Data</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Case Number</label>
        <input type="text" name="caseNumber" value={formData.caseNumber} required onChange={handleChange} style={inputStyle} placeholder="e.g., DOE-2026-001" />

        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Location</label>
        <input type="text" name="location" value={formData.location} required onChange={handleChange} style={inputStyle} placeholder="Enter exact address or coordinates" />

        <label style={{ fontWeight: '500', color: '#334155' }}>Postmortem Images (Text-only for now)</label>
        <input type="file" multiple accept="image/*" disabled style={{...inputStyle, backgroundColor: '#f1f5f9'}} title="Image upload will be activated in the AI phase" />

        <label style={{ fontWeight: '500', color: '#334155' }}>Initial Findings / Found Artifacts</label>
        <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange} style={inputStyle} placeholder="Describe any distinctive items..."></textarea>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
          Log Case to Database
        </button>

        {/* Display success or error messages to the user */}
        {statusMessage && (
          <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', backgroundColor: statusMessage.includes('Success') ? '#dcfce7' : '#fee2e2', color: statusMessage.includes('Success') ? '#166534' : '#991b1b', textAlign: 'center' }}>
            {statusMessage}
          </div>
        )}
        
      </form>
    </div>
  );
}