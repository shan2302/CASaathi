import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PublicNavbar() {
  const { user } = useAuth();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1.25rem 5%', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100, 
      background: 'rgba(255,255,255,0.8)', 
      backdropFilter: 'blur(10px)', 
      borderBottom: '1px solid rgba(226,232,240,0.5)' 
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <img src="/logo.png" alt="CA Saathi Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' }}>CA Saathi</span>
      </Link>
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <div className="hide-on-mobile" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <a href="/#features" style={{ textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem' }}>Features</a>
          <a href="/#pricing" style={{ textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem' }}>Pricing</a>
          <a href="/#about" style={{ textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem' }}>About Us</a>
          <a href="/#contact" style={{ textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: '0.95rem' }}>Contact</a>
        </div>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', fontSize: '0.95rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)' }}>Dashboard</Link>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', fontSize: '0.95rem', background: 'linear-gradient(to right, #2563eb, #1d4ed8)', boxShadow: '0 4px 14px 0 rgba(37,99,235,0.39)' }}>Login</Link>
        )}
      </div>
    </nav>
  );
}
