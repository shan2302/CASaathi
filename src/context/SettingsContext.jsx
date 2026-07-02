import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SETTINGS_KEY = 'ca_saathi_settings';
const DEFAULT_SETTINGS = { demoMode: false, firmName: 'My Practice' };
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const storageKey = user?.id ? `${SETTINGS_KEY}_${user.id}` : SETTINGS_KEY;
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let savedSettings = DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(storageKey);
      savedSettings = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      savedSettings = DEFAULT_SETTINGS;
    }

    setSettings({
      ...savedSettings,
      firmName: user?.firmName || savedSettings.firmName
    });
  }, [storageKey, user?.firmName]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
