import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useReminders } from '../context/ReminderContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { generateReminderMessage } from '../services/reminderService';
import axios from 'axios';

export function SendReminderButton({ client, deadlineType, dueDate }) {
  const [isSending, setIsSending] = useState(false);
  const [showDemoSuccess, setShowDemoSuccess] = useState(false);
  
  const { addReminder } = useReminders();
  const { settings } = useSettings();
  const { addToast } = useToast();

  const handleSend = async () => {
    setIsSending(true);
    
    const message = generateReminderMessage(
      client.name,
      deadlineType,
      dueDate,
      settings.firmName
    );

    try {
      // Send real email and SMS via backend Brevo integration
      const res = await axios.post('/api/reminders/send', {
        clientEmail: client.email,
        clientPhone: client.phone,
        clientName: client.name,
        subject: `Reminder: ${deadlineType} Due Soon`,
        message: message,
        sendMethod: 'both' // Sends both email and SMS
      });

      // Log the reminder
      addReminder({
        clientName: client.name,
        deadlineType,
        phoneNumber: client.phone,
        email: client.email
      });

      const serverMessage = res.data.message || 'Reminder sent successfully';

      if (settings.demoMode) {
        setShowDemoSuccess(true);
        setTimeout(() => {
          setShowDemoSuccess(false);
          addToast(serverMessage, serverMessage.includes('failed') ? 'warning' : 'success');
        }, 2500);
      } else {
        addToast(serverMessage, serverMessage.includes('failed') ? 'warning' : 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reminder. Ensure client has contact info.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSend}
        disabled={isSending || showDemoSuccess}
        className="btn"
        style={{
          backgroundColor: 'var(--accent-yellow)',
          color: 'var(--text-primary)',
          fontWeight: 500,
          fontSize: '0.75rem',
          padding: '0.5rem 1rem',
          display: 'inline-flex',
          gap: '0.5rem',
          alignItems: 'center',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: isSending ? 'not-allowed' : 'pointer',
          opacity: isSending ? 0.7 : 1
        }}
      >
        {isSending ? (
          <>
            <Loader2 className="animate-spin" size={14} />
            Sending...
          </>
        ) : (
          <>
            <Send size={14} />
            Send Reminder
          </>
        )}
      </button>

      {/* Demo Mode Premium Animation Overlay */}
      <AnimatePresence>
        {showDemoSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              backdropFilter: 'blur(5px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle color="var(--badge-green-text)" size={64} />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ margin: 0, color: 'var(--text-primary)' }}
              >
                Reminder Processed Successfully
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ color: 'var(--text-secondary)', margin: 0 }}
              >
                Message was sent via Email / SMS.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
