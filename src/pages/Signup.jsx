import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PublicNavbar } from '../components/PublicNavbar';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export function Signup() {
  const { signup, verifyEmail, firebaseAuthVerify } = useAuth();
  const navigate = useNavigate();
  
  // Phase 1: Signup
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' or 'phone'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firmName, setFirmName] = useState('');
  
  // Phase 2: OTP Verification
  const [userId, setUserId] = useState(null); // Used for email verify flow
  const [otp, setOtp] = useState('');
  
  // Firebase state
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useGSAP(() => {
    gsap.fromTo('.auth-card', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (signupMethod === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        }
      });
    }
  }, [signupMethod]);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (signupMethod === 'email') {
        const res = await signup(name, email, '', password, firmName);
        if (res.userId) {
          setUserId(res.userId);
        }
      } else {
        // Firebase Phone Auth
        let formattedPhone = phone.trim();
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone.replace(/[^\d]/g, '');
        }
        const appVerifier = window.recaptchaVerifier;
        const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confResult);
      }
    } catch (err) {
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Make sure to include the country code (e.g. +91)');
      } else {
        setError(err.message || err);
      }
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (signupMethod === 'email') {
        await verifyEmail(userId, otp);
        navigate('/dashboard');
      } else {
        // Verify Firebase OTP
        const result = await confirmationResult.confirm(otp);
        const idToken = await result.user.getIdToken();
        // Send idToken to backend to create user in MongoDB
        await firebaseAuthVerify(idToken, { name, firmName });
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code.');
      } else {
        setError(err.message || err);
      }
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
          padding: '3rem', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          width: '100%', maxWidth: '450px', border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '1.5rem' }}>
            {(userId || confirmationResult) ? 'Verify Account' : 'Create Account'}
          </h2>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <div id="recaptcha-container"></div>
          
          {(!userId && !confirmationResult) ? (
            <>
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setSignupMethod('email')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: signupMethod === 'email' ? 'white' : 'transparent', boxShadow: signupMethod === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: signupMethod === 'email' ? '#0f172a' : '#64748b', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Email
                </button>
                <button 
                  type="button"
                  onClick={() => setSignupMethod('phone')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: signupMethod === 'phone' ? 'white' : 'transparent', boxShadow: signupMethod === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: signupMethod === 'phone' ? '#0f172a' : '#64748b', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Mobile Number
                </button>
              </div>

              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Full Name</label>
                  <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                    placeholder="Sunil Kumar"
                  />
                </div>
                
                {signupMethod === 'email' ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Email Address</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                      placeholder="account@example.com"
                    />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Mobile Number</label>
                    <input 
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                      placeholder="+91 9876543210"
                    />
                    <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Must include country code (e.g. +91)</small>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Firm Name (Optional)</label>
                  <input 
                    type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                    placeholder="SK & Associates"
                  />
                </div>
                
                {signupMethod === 'email' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                      placeholder="••••••••"
                    />
                  </div>
                )}
                
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '0.75rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending Verification...' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ color: '#475569', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>
                We sent a 6-digit verification code to <strong>{signupMethod === 'email' ? email : phone}</strong>. Please enter it below.
              </p>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Verification Code</label>
                <input 
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem' }}
                  placeholder="••••••"
                />
              </div>
              <button type="submit" disabled={loading || otp.length < 6} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '0.75rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', opacity: loading || otp.length < 6 ? 0.7 : 1 }}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button type="button" onClick={() => { setUserId(null); setConfirmationResult(null); }} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', marginTop: '0.5rem' }}>
                Go Back
              </button>
            </form>
          )}

          {(!userId && !confirmationResult) && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
              Already have an account? <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
