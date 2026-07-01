import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PublicNavbar } from '../components/PublicNavbar';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export function Login() {
  const { login, loginOtpSend, loginOtpVerify, firebaseAuthVerify } = useAuth();
  const navigate = useNavigate();
  
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Phase 2: OTP Verification
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
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
    if (loginMethod === 'phone' && !window.recaptchaVerifierLogin) {
      window.recaptchaVerifierLogin = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
        'size': 'invisible'
      });
    }
  }, [loginMethod]);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier) {
      setError('Please enter your email or phone number first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'email') {
        await loginOtpSend(identifier);
        setIsOtpSent(true);
      } else {
        // Firebase Phone Auth
        let formattedPhone = identifier.trim();
        if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+' + formattedPhone.replace(/[^\d]/g, '');
        }
        const appVerifier = window.recaptchaVerifierLogin;
        const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confResult);
        setIsOtpSent(true);
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'An error occurred');
      if (window.recaptchaVerifierLogin) {
        window.recaptchaVerifierLogin.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (loginMethod === 'email') {
        await loginOtpVerify(identifier, otp);
        navigate('/dashboard');
      } else {
        const result = await confirmationResult.confirm(otp);
        const idToken = await result.user.getIdToken();
        await firebaseAuthVerify(idToken);
        navigate('/dashboard');
      }
    } catch (err) {
      if (err?.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code.');
      } else {
        setError(typeof err === 'string' ? err : err?.message || 'An error occurred');
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
            {isOtpSent ? 'Verify Login' : 'Welcome Back'}
          </h2>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
          
          <div id="recaptcha-container-login"></div>

          {!isOtpSent ? (
            <>
              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem' }}>
                <button 
                  type="button" onClick={() => setLoginMethod('email')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: loginMethod === 'email' ? 'white' : 'transparent', boxShadow: loginMethod === 'email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: loginMethod === 'email' ? '#0f172a' : '#64748b', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Email
                </button>
                <button 
                  type="button" onClick={() => setLoginMethod('phone')}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: loginMethod === 'phone' ? 'white' : 'transparent', boxShadow: loginMethod === 'phone' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: loginMethod === 'phone' ? '#0f172a' : '#64748b', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Mobile Number
                </button>
              </div>

              <form onSubmit={handleStandardLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>
                    {loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                  </label>
                  <input 
                    type={loginMethod === 'email' ? 'email' : 'tel'} 
                    value={identifier} onChange={(e) => setIdentifier(e.target.value)} required
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                    placeholder={loginMethod === 'email' ? 'account@example.com' : '+91 9876543210'}
                  />
                  {loginMethod === 'phone' && <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Must include country code (e.g. +91)</small>}
                </div>
                
                {loginMethod === 'email' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                      placeholder="••••••••"
                    />
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                      <Link to="/forgot-password" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none' }}>Forgot Password?</Link>
                    </div>
                  </div>
                )}
                
                {loginMethod === 'email' && (
                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '0.75rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Logging in...' : 'Log In'}
                  </button>
                )}

                <div style={{ position: 'relative', textAlign: 'center', margin: '1rem 0' }}>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '0 0.5rem', color: '#64748b', fontSize: '0.875rem' }}>OR</span>
                </div>

                <button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={loading}
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #2563eb', background: 'white', color: '#2563eb', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending OTP...' : `Login with ${loginMethod === 'email' ? 'Email' : 'SMS'} OTP`}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ color: '#475569', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>
                We sent a 6-digit verification code to <strong>{identifier}</strong>. Please enter it below.
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
              <button type="button" onClick={() => { setIsOtpSent(false); setConfirmationResult(null); }} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', marginTop: '0.5rem' }}>
                Go Back
              </button>
            </form>
          )}

          {!isOtpSent && (
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
              Don't have an account? <Link to="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
