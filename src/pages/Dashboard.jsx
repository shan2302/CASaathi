import React, { useRef } from 'react';
import { Users, CalendarDays, FileText, BellRing, ArrowRight } from 'lucide-react';
import { useReminders } from '../context/ReminderContext';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Dashboard() {
  const { getRemindersThisMonth } = useReminders();
  const { clients, deadlines, documents } = useData();
  const containerRef = useRef();

  useGSAP(() => {
    gsap.fromTo('.stat-card', 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.7)" }
    );
    gsap.fromTo('.dashboard-table',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: "power3.out" }
    );
  }, { scope: containerRef });

  // Upcoming deadlines (first 5 for dashboard)
  const upcomingDeadlines = deadlines.filter(d => d.status === 'Overdue' || d.status === 'Due Soon').slice(0, 5);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Overdue': return <span className="badge badge-overdue">Overdue</span>;
      case 'Due Soon': return <span className="badge badge-due-soon">Due Soon</span>;
      case 'Safe': return <span className="badge badge-safe">Safe</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  // Calculate pending documents total
  const totalPendingDocs = documents.reduce((sum, docGroup) => sum + docGroup.pendingCount, 0);

  return (
    <div ref={containerRef} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <h1 className="page-title" data-aos="fade-right">Dashboard</h1>
      <p className="page-subtitle" data-aos="fade-right" data-aos-delay="100">Overview of your firm's deadlines, clients & document collection.</p>
      
      {/* Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Total Clients */}
        <div className="card stat-card" style={{ padding: '1rem' }}>
          <div className="stat-icon" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
            <Users size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL CLIENTS</p>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{clients.length}</h3>
          </div>
        </div>
        
        {/* Upcoming Deadlines */}
        <div className="card stat-card" style={{ padding: '1rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--badge-yellow-bg)', color: 'var(--badge-yellow-text)' }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>UPCOMING DEADLINES</p>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{deadlines.filter(d => d.status !== 'Safe').length}</h3>
          </div>
        </div>

        {/* Pending Documents */}
        <div className="card stat-card" style={{ padding: '1rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--badge-red-bg)', color: 'var(--badge-red-text)' }}>
            <FileText size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>PENDING DOCUMENTS</p>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{totalPendingDocs}</h3>
          </div>
        </div>

        {/* Reminders Sent */}
        <div className="card stat-card" style={{ padding: '1rem' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--badge-green-bg)', color: 'var(--badge-green-text)' }}>
            <BellRing size={20} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em' }}>REMINDERS SENT (THIS MONTH)</p>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{getRemindersThisMonth()}</h3>
          </div>
        </div>

      </div>

      {/* Upcoming Deadlines Table */}
      <div className="card dashboard-table" style={{ padding: 0, overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Next due across all clients</p>
          </div>
          <Link to="/deadlines" style={{ 
            background: 'none', border: 'none', textDecoration: 'none',
            color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, 
            display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' 
          }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'white' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Deadline Type</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Due Date</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingDeadlines.map((deadline) => (
                <tr key={deadline._id || deadline.id}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                    {deadline.clientName}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {deadline.type}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {deadline.dueDate}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    {getStatusBadge(deadline.status)}
                  </td>
                </tr>
              ))}
              {upcomingDeadlines.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No upcoming deadlines found.
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
