// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  // Your exact original state variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Your exact original login logic
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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#090d16', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Embedded CSS for smooth hover and focus animations */}
      <style>
        {`
          .login-input {
            width: 100%; padding: 14px 16px; margin-top: 6px; margin-bottom: 22px;
            background-color: #1e293b; border: 1px solid #334155; border-radius: 6px;
            color: #f8fafc; font-size: 0.95rem; outline: none; box-sizing: border-box;
            transition: all 0.2s ease;
          }
          .login-input:focus {
            border-color: #38bdf8; 
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
          }
          .login-input::placeholder {
            color: #64748b;
          }
          .login-btn {
            width: 100%; padding: 14px; background-color: #0ea5e9; color: white;
            border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;
            font-weight: 700; margin-top: 10px; transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
          }
          .login-btn:hover {
            background-color: #0284c7; 
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(14, 165, 233, 0.35);
          }
        `}
      </style>

      {/* Left Panel: Tactical Branding Area */}
      <div style={{ flex: 1.2, backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle dot-grid background pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1.5px', marginBottom: '20px' }}>
            SECURE LAW ENFORCEMENT PORTAL
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: '2.5rem', fontWeight: '800', margin: '0 0 15px 0', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Forensic Identity<br/>& Intelligence Platform
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
            Authorized personnel only. Access AI-driven postmortem analysis, cross-jurisdictional missing persons data, and dynamic biometric matching algorithms.
          </p>
        </div>
      </div>

      {/* Right Panel: Functional Form Area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0f19', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <form onSubmit={handleLogin} style={{ backgroundColor: '#111827', padding: '40px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px 0' }}>Operator Authorization</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 30px 0' }}>Enter your encrypted badge credentials to proceed.</p>
            
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <label style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.5px', display: 'block' }}>
              BADGE ID / USERNAME
            </label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="login-input" 
              placeholder="e.g., agent001" 
            />

            <label style={{ fontWeight: '600', color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.5px', display: 'block' }}>
              SECURITY PASSCODE
            </label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="login-input" 
              placeholder="••••••••••••" 
            />

            <button type="submit" className="login-btn">
              Verify Credentials
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}