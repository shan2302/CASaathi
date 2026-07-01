import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ReminderContext = createContext(null);

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState([]);

  const fetchReminders = async () => {
    try {
      const res = await axios.get('/api/reminders');
      if (Array.isArray(res.data)) {
        setReminders(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    }
  };

  useEffect(() => {
    // We only fetch reminders if there's a token (handled by AuthContext generally)
    if (localStorage.getItem('token')) {
      fetchReminders();
    }
  }, []);

  const addReminder = (reminder) => {
    // Instead of localStorage, we just refetch from the backend
    // Or optimistically update the UI
    const newReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: 'Sent'
    };
    setReminders(prev => [newReminder, ...prev]);
    // Optionally trigger a silent refetch to sync with Supabase
    fetchReminders();
  };

  const getRemindersThisMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return reminders.filter(r => {
      const date = new Date(r.created_at || r.dateTime);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
  };

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, getRemindersThisMonth, fetchReminders }}>
      {children}
    </ReminderContext.Provider>
  );
}

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
