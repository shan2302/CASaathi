import React from 'react';
import { Search, BellRing, History } from 'lucide-react';
import { useReminders } from '../context/ReminderContext';
import { useData } from '../context/DataContext';
import { SendReminderButton } from '../components/SendReminderButton';
import { format } from 'date-fns';

export function Reminders() {
  const { reminders } = useReminders();
  const { deadlines, clients } = useData();

  // Compute pending reminders from deadlines
  const pendingReminders = deadlines.filter(d => d.status === 'Overdue' || d.status === 'Due Soon');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Overdue': return <span className="badge badge-overdue">Overdue</span>;
      case 'Due Soon': return <span className="badge badge-due-soon">Due Soon</span>;
      case 'Safe': return <span className="badge badge-safe">Safe</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Reminders</h1>
        <p className="page-subtitle" style={{ margin: 0 }}>Send WhatsApp reminders for upcoming and overdue deadlines.</p>
      </div>

      {/* Pending Reminders Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BellRing size={20} color="var(--accent-yellow)" />
            <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Pending Reminders ({pendingReminders.length})</h2>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            border: '1px solid var(--border)',
            width: '300px'
          }}>
            <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search client or type..." 
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

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'white' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Deadline</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Due</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingReminders.map((pending) => {
                const clientObj = clients.find(c => c.name === pending.clientName);
                return (
                <tr key={pending._id || pending.id}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                    {pending.clientName}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {pending.clientPhone || '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {pending.type}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {pending.dueDate}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    {getStatusBadge(pending.status)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <SendReminderButton 
                      client={{ name: pending.clientName, phone: pending.clientPhone, email: clientObj?.email || pending.clientEmail || '' }}
                      deadlineType={pending.type}
                      dueDate={pending.dueDate}
                    />
                  </td>
                </tr>
              )})}
              {pendingReminders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No pending reminders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder History Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1.5rem' }}>
          <History size={20} color="var(--text-secondary)" />
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Reminder History ({reminders.length})</h2>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'white' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Sent At</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Deadline</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder.id || reminder._id}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {reminder.createdAt || reminder.created_at || reminder.dateTime 
                      ? format(new Date(reminder.createdAt || reminder.created_at || reminder.dateTime), 'dd MMM yyyy, hh:mm a')
                      : 'Unknown Date'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                    {reminder.client_name || reminder.clientName}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {reminder.client_email || reminder.email || reminder.phoneNumber || '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {reminder.deadlineType || '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <span className="badge badge-blue-text badge-blue-bg">{reminder.status}</span>
                  </td>
                </tr>
              ))}
              {reminders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No reminders sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
