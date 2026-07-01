import React, { useState } from 'react';
import { Plus, List, Grid, Edit2, Trash2, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

export function Deadlines() {
  const { deadlines, clients, addDeadline, removeDeadline, editDeadline } = useData();
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState(null);
  const { addToast } = useToast();

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Overdue': return <span className="badge badge-overdue">Overdue</span>;
      case 'Due Soon': return <span className="badge badge-due-soon">Due Soon</span>;
      case 'Safe': return <span className="badge badge-safe">Safe</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const filteredDeadlines = deadlines.filter(d => activeTab === 'All' || d.status === activeTab);

  const counts = {
    All: deadlines.length,
    Overdue: deadlines.filter(d => d.status === 'Overdue').length,
    'Due Soon': deadlines.filter(d => d.status === 'Due Soon').length,
    Safe: deadlines.filter(d => d.status === 'Safe').length,
  };

  const handleAddDeadline = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    let formattedDate = formData.get('dueDate');
    if (formattedDate) {
      try {
        formattedDate = format(new Date(formattedDate), 'dd MMM yyyy');
      } catch (err) {}
    }

    const data = {
      clientName: formData.get('clientName'),
      type: formData.get('type'),
      dueDate: formattedDate,
      notes: formData.get('notes')
    };

    if (editingDeadline) {
      editDeadline(editingDeadline._id || editingDeadline.id, data);
      addToast('Deadline updated successfully', 'success');
    } else {
      addDeadline(data);
      addToast('Deadline added successfully', 'success');
    }

    setIsModalOpen(false);
    setEditingDeadline(null);
  };

  const openEditModal = (deadline) => {
    setEditingDeadline(deadline);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingDeadline(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Deadlines</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Track GST, TDS, ITR and Audit deadlines across all clients.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setEditingDeadline(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Add Deadline
        </button>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Filters and View Toggles */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Overdue', 'Due Soon', 'Safe'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '100px',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#1e293b' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab} <span style={{ opacity: 0.7, marginLeft: '0.25rem', fontSize: '0.75rem' }}>({counts[tab]})</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button style={{ padding: '0.5rem', border: 'none', background: '#f8fafc', color: 'var(--text-primary)', cursor: 'pointer' }}><List size={18} /></button>
            <button style={{ padding: '0.5rem', border: 'none', borderLeft: '1px solid var(--border)', background: 'white', color: 'var(--text-secondary)', cursor: 'pointer' }}><Grid size={18} /></button>
          </div>
          
        </div>
        
        {/* Table */}
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'white' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Client</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Deadline Type</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Due Date</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeadlines.map((deadline) => (
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
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button 
                        className="action-icon"
                        onClick={() => openEditModal(deadline)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-icon delete"
                        onClick={() => {
                          removeDeadline(deadline._id || deadline.id);
                          addToast('Deadline deleted', 'info');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeadlines.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No deadlines found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add/Edit Deadline Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeAndResetModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingDeadline ? 'Edit Deadline' : 'Add Deadline'}</h2>
              <button 
                onClick={closeAndResetModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddDeadline}>
              <div className="modal-body">
                
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Select Client *</label>
                  <select name="clientName" className="form-input" style={{ backgroundColor: 'white' }} defaultValue={editingDeadline?.clientName} required>
                    <option value="" disabled>Select a client...</option>
                    {clients.map(c => (
                      <option key={c._id || c.id} value={c.name}>{c.name} {c.business !== '-' ? `— ${c.business}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Deadline Type *</label>
                    <select name="type" className="form-input" style={{ backgroundColor: 'white' }} defaultValue={editingDeadline?.type} required>
                      <option value="" disabled>Select type...</option>
                      <option value="GST Return">GST Return</option>
                      <option value="TDS Filing">TDS Filing</option>
                      <option value="ITR Filing">ITR Filing</option>
                      <option value="Audit">Audit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" name="dueDate" className="form-input" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <textarea 
                    name="notes"
                    className="form-input" 
                    placeholder="Any specific instructions for this deadline..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAndResetModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDeadline ? 'Save Changes' : 'Add Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
