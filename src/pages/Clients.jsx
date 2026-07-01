import React, { useState } from 'react';
import { Search, Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

export function Clients() {
  const { clients, addClient, removeClient, editClient } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const { addToast } = useToast();

  const handleAddClient = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const deadlineType = formData.get('deadlineType');
    const dueDateRaw = formData.get('dueDate');

    if (dueDateRaw && !deadlineType) {
      addToast('Please select a Deadline Type if you provide a Due Date.', 'error');
      return;
    }
    if (deadlineType && !dueDateRaw) {
      addToast('Please provide a Due Date if you select a Deadline Type.', 'error');
      return;
    }

    const clientData = {
      name: formData.get('name'),
      business: formData.get('business') || '-',
      phone: formData.get('phone') || '-',
      email: formData.get('email') || '-',
      gstin: formData.get('gstin') || '-',
    };

    if (editingClient) {
      // Edit mode
      editClient(editingClient._id || editingClient.id, clientData);
      addToast('Client updated successfully', 'success');
    } else {
      // Add mode
      let formattedDate = dueDateRaw;
      if (dueDateRaw) {
        try {
          formattedDate = format(new Date(dueDateRaw), 'dd MMM yyyy');
        } catch(err) {}
      }

      const initialDeadline = {
        type: deadlineType,
        dueDate: formattedDate
      };

      addClient(clientData, initialDeadline);
      addToast('Client added successfully', 'success');
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Manage your client list. {clients.length} total.</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Add Client
        </button>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        
        {/* Search Bar */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            borderRadius: 'var(--radius-md)',
            padding: '0.625rem 1rem',
            border: '1px solid var(--border)',
            maxWidth: '500px'
          }}>
            <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Search by name, business, GSTIN..." 
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
        
        {/* Table */}
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'white' }}>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Business</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem' }}>GSTIN</th>
                <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id || client.id}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>
                    {client.name}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {client.business}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {client.phone}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {client.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {client.gstin}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      <button className="action-icon">
                        <Eye size={16} />
                      </button>
                      <button className="action-icon" onClick={() => openEditModal(client)}>
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-icon delete"
                        onClick={() => removeClient(client._id || client.id)}
                        title="Delete Client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No clients found. Add a new client to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add/Edit Client Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeAndResetModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingClient ? 'Edit Client' : 'Add Client'}</h2>
              <button 
                onClick={closeAndResetModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient}>
              <div className="modal-body">
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Client Name *</label>
                    <input type="text" name="name" defaultValue={editingClient?.name} className="form-input" placeholder="Rajesh Kumar" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input type="text" name="business" defaultValue={editingClient?.business !== '-' ? editingClient?.business : ''} className="form-input" placeholder="Kumar Traders" />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" name="phone" defaultValue={editingClient?.phone !== '-' ? editingClient?.phone : ''} className="form-input" placeholder="9876543210" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" defaultValue={editingClient?.email !== '-' ? editingClient?.email : ''} className="form-input" placeholder="client@example.com" />
                  </div>
                  
                  {!editingClient && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Initial Deadline Type</label>
                        <select name="deadlineType" className="form-input" style={{ backgroundColor: 'white' }}>
                          <option value="">None</option>
                          <option value="GST Return">GST Return</option>
                          <option value="TDS Filing">TDS Filing</option>
                          <option value="ITR Filing">ITR Filing</option>
                          <option value="Audit">Audit</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Initial Due Date</label>
                        <input type="date" name="dueDate" className="form-input" />
                      </div>
                    </>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">GST Number</label>
                  <input type="text" name="gstin" defaultValue={editingClient?.gstin !== '-' ? editingClient?.gstin : ''} className="form-input" placeholder="10ABCDE1234A1Z5" />
                </div>

              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAndResetModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
