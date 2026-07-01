import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, PlaySquare, Building } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings } = useSettings();

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      
      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <SettingsIcon color="var(--accent-primary)" size={24} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Application Preferences</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Demo Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ 
                width: '40px', height: '40px', 
                backgroundColor: 'var(--accent-secondary)', color: 'var(--accent-primary)',
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <PlaySquare size={20} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Demo Mode</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Enable premium animations simulating automated workflow.
                </p>
              </div>
            </div>
            
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={settings.demoMode}
                onChange={(e) => updateSettings({ demoMode: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Firm Name Setting */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <div style={{ 
                width: '40px', height: '40px', 
                backgroundColor: 'var(--accent-secondary)', color: 'var(--accent-primary)',
                borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <Building size={20} />
              </div>
              <div style={{ flex: 1, paddingRight: '2rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>Firm Name</h3>
                <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  This name will appear at the bottom of all WhatsApp reminders.
                </p>
                <input 
                  type="text" 
                  value={settings.firmName}
                  onChange={(e) => updateSettings({ firmName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
