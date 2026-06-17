// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      
      // Save token and user details to localStorage for persistent state tracking
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
      
      // Force app refresh to re-evaluate route authentication guards
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication server unreachable.');
    }
  };

  const inputStyle = { width: '100%', padding: '12px', marginTop: '6px', marginBottom: '15px', border: '1px solid #cbd5e1', borderRadius: '4px' };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '5px', color: '#0f172a' }}>Forensic Identity Platform</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>Authorized Law Enforcement Access Only</p>
        
        {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

        <label style={{ fontWeight: '500', color: '#334155' }}>Badge ID / Username</label>
        <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />

        <label style={{ fontWeight: '500', color: '#334155' }}>Security Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Verify Credentials
        </button>
      </form>
    </div>
  );
}