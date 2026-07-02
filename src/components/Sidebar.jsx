import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, BellRing, FileText, Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ isOpen, onClose }) {
  const { settings } = useSettings();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Clients', path: '/clients', icon: <Users size={18} /> },
    { name: 'Deadlines', path: '/deadlines', icon: <CalendarDays size={18} /> },
    { name: 'Reminders', path: '/reminders', icon: <BellRing size={18} /> },
    { name: 'Documents', path: '/documents', icon: <FileText size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay show-on-mobile" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      
      {/* Logo Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.5rem', marginBottom: '1rem' }}>
        <img src="/logo.png" alt="CA Saathi Logo" style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '4px' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1rem', margin: 0, color: 'white', fontWeight: 600 }}>CA Saathi</h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-sidebar)', marginTop: '2px', wordBreak: 'break-word' }}>
            {user?.firmName || settings.firmName}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-yellow)' : 'white',
              backgroundColor: isActive ? 'transparent' : 'transparent',
              border: isActive ? '1px solid var(--accent-yellow)' : '1px solid transparent',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            })}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span style={{ fontSize: '0.75rem' }}>v1.0 - MVP</span>
        <span style={{ fontSize: '0.75rem' }}>© CA Saathi</span>
      </div>
      
    </aside>
    </>
  );
}
