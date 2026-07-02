import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Keep axios in sync with the current auth token.
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const email = identifier.includes('@') ? identifier : undefined;
      const phone = !identifier.includes('@') ? identifier : undefined;
      
      const payload = { password };
      if (email) payload.email = email;
      if (phone) payload.phone = phone;

      const res = await axios.post('/api/auth/login', payload);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (error) {
      throw error.response?.data?.message || 'Error logging in';
    }
  };

  const signup = async (name, email, phone, password, firmName) => {
    try {
      const res = await axios.post('/api/auth/signup', { name, email, phone, password, firmName });
      // We don't set the token here anymore because they need to verify OTP
      return res.data; 
    } catch (error) {
      throw error.response?.data?.message || 'Error signing up';
    }
  };

  const verifyEmail = async (userId, otp) => {
    try {
      const res = await axios.post('/api/auth/verify-email', { userId, otp });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Invalid or expired OTP';
    }
  };

  const firebaseAuthVerify = async (idToken, signupData = null) => {
    try {
      const payload = { idToken };
      if (signupData) {
        payload.name = signupData.name;
        payload.firmName = signupData.firmName;
        // email is not sent because this is phone auth
      }
      const res = await axios.post('/api/auth/firebase', payload);
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Firebase Authentication Failed';
    }
  };

  const loginOtpSend = async (identifier) => {
    try {
      const res = await axios.post('/api/auth/login-otp/send', { identifier });
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send OTP';
    }
  };

  const loginOtpVerify = async (identifier, otp) => {
    try {
      const res = await axios.post('/api/auth/login-otp/verify', { identifier, otp });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Invalid or expired OTP';
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send reset link';
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const res = await axios.post('/api/auth/reset-password', { token, newPassword });
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reset password';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, loading, login, signup, verifyEmail, logout,
      loginOtpSend, loginOtpVerify, forgotPassword, resetPassword, firebaseAuthVerify
    }}>
      {children}
    </AuthContext.Provider>
  );
}
