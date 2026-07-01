import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, CalendarDays } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';

export function Header() {
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const { deadlines } = useData();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const pendingNotifs = deadlines.filter(d => d.status === 'Overdue' || d.status === 'Due Soon');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      {/* Left side: Firm Name */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>FIRM</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.firmName || settings.firmName}</span>
      </div>

      {/* Center: Search Bar */}
      <div style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#f1f5f9', 
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem',
          border: '1px solid var(--border)'
        }}>
          <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search clients, deadlines..." 
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Right side: Profile & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {/* Notifications */}
        <div className="dropdown-container" ref={notifRef}>
          <button 
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex' }}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <Bell size={20} color="var(--text-secondary)" />
            {pendingNotifs.length > 0 && (
              <div style={{ 
                position: 'absolute', top: -2, right: -2, 
                width: '8px', height: '8px', 
                backgroundColor: 'var(--badge-red-text)', 
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            )}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu" style={{ width: '320px', right: 0, left: 'auto', padding: 0 }}>
              <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
                <span className="badge badge-blue-bg badge-blue-text">{pendingNotifs.length} New</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {pendingNotifs.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    You're all caught up!
                  </div>
                ) : (
                  pendingNotifs.map((notif, index) => (
                    <div key={notif._id || notif.id || index} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: notif.status === 'Overdue' ? 'var(--badge-red-bg)' : 'var(--badge-yellow-bg)', padding: '0.5rem', borderRadius: '50%', flexShrink: 0 }}>
                        <CalendarDays size={16} color={notif.status === 'Overdue' ? 'var(--badge-red-text)' : 'var(--badge-yellow-text)'} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {notif.clientName} - {notif.type}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Due: {notif.dueDate} ({notif.status})
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                <Link to="/reminders" onClick={() => setIsNotifOpen(false)} style={{ fontSize: '0.875rem', color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 500 }}>
                  View All Actions
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="profile-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div style={{ 
              width: '32px', height: '32px', 
              backgroundColor: 'var(--sidebar-bg)', 
              color: 'white', 
              borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'CA'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: '1.2' }}>{user?.name || 'CA Anil Sharma'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>{user?.email || 'demo@casaathi.in'}</span>
            </div>
            <ChevronDown size={16} color="var(--text-secondary)" style={{ marginLeft: '0.5rem' }} />
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.name || 'CA Anil Sharma'}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email || 'demo@casaathi.in'}</span>
              </div>
              
              <div style={{ padding: '0.25rem 0' }}>
                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
