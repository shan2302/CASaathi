import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PublicNavbar } from '../components/PublicNavbar';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
    gsap.fromTo('.auth-card', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset link. Missing token.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(token, password);
      // Wait a moment then redirect to login
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div className="auth-premium-bg"></div>

      <PublicNavbar />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
        <div className="auth-card" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '450px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1rem' }}>Set New Password</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
            Enter your new secure password below.
          </p>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '0.75rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
