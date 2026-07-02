import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings as SettingsIcon, PlaySquare, Building, Save } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { user, updateFirmName } = useAuth();
  const { addToast } = useToast();
  const [firmNameDraft, setFirmNameDraft] = useState(settings.firmName || '');
  const [isSavingFirmName, setIsSavingFirmName] = useState(false);

  useEffect(() => {
    setFirmNameDraft(settings.firmName || '');
  }, [settings.firmName]);

  const handleFirmNameSubmit = async (e) => {
    e.preventDefault();
    const nextFirmName = firmNameDraft.trim();

    if (!nextFirmName) {
      setFirmNameDraft(settings.firmName || '');
      addToast('Firm name is required', 'error');
      return;
    }

    if (nextFirmName === settings.firmName) return;

    setIsSavingFirmName(true);
    try {
      if (user) {
        await updateFirmName(nextFirmName);
      }
      updateSettings({ firmName: nextFirmName });
      addToast('Firm name updated successfully', 'success');
    } catch (error) {
      setFirmNameDraft(settings.firmName || '');
      addToast(typeof error === 'string' ? error : 'Failed to update firm name', 'error');
    } finally {
      setIsSavingFirmName(false);
    }
  };

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
                  This name comes from your signup profile and appears in reminders.
                </p>
                <form onSubmit={handleFirmNameSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={firmNameDraft}
                    onChange={(e) => setFirmNameDraft(e.target.value)}
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
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSavingFirmName || firmNameDraft.trim() === settings.firmName}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Save size={16} /> {isSavingFirmName ? 'Saving' : 'Save'}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
