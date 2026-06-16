// frontend/src/pages/UploadForm.jsx
import { useState } from 'react';
import api from '../api';

export default function UploadForm() {
  const [formData, setFormData] = useState({
    caseNumber: '',
    location: '',
    notes: ''
  });
  
  // NEW: State to hold the selected image file
  const [imageFile, setImageFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // NEW: Handle file selection
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatusMessage("Please select an image for analysis.");
      return;
    }

    setStatusMessage('Transmitting data to AI Engine...');
    setIsProcessing(true);

    // NEW: Package data as FormData so the file can be sent
    const submitData = new FormData();
    submitData.append('caseNumber', formData.caseNumber);
    submitData.append('location', formData.location);
    submitData.append('notes', formData.notes);
    submitData.append('image', imageFile); // Attach the file!

    try {
      // Note: We don't use 'formData' here, we use the 'submitData' object we just built
      const response = await api.post('/cases', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatusMessage('Success! Case logged & AI Analysis complete.');
      setFormData({ caseNumber: '', location: '', notes: '' });
      setImageFile(null); // Clear the file input
      
      // Reset the physical file input field
      document.getElementById('image-upload').value = '';
      
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '20px', color: '#0f172a' }}>Upload Case Data</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Case Number</label>
        <input type="text" name="caseNumber" value={formData.caseNumber} required onChange={handleChange} style={inputStyle} />

        <label style={{ fontWeight: '500', color: '#334155' }}>Recovery Location</label>
        <input type="text" name="location" value={formData.location} required onChange={handleChange} style={inputStyle} />

        {/* UPDATED: File input is now active */}
        <label style={{ fontWeight: '500', color: '#334155' }}>Postmortem Image (Required for AI)</label>
        <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} required style={inputStyle} />

        <label style={{ fontWeight: '500', color: '#334155' }}>Initial Findings / Investigator Notes</label>
        <textarea name="notes" rows="4" value={formData.notes} onChange={handleChange} style={inputStyle}></textarea>

        <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '12px', backgroundColor: isProcessing ? '#94a3b8' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
          {isProcessing ? 'AI Engine Analyzing...' : 'Submit to AI Engine'}
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