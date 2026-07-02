import React, { useState } from 'react';
import { Search, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export function Documents() {
  const { documents, updateDocumentStatus } = useData();
  const { addToast } = useToast();
  const [updatingDocumentKey, setUpdatingDocumentKey] = useState(null);

  // Calculate total pending docs across all clients
  const totalPendingDocs = documents.reduce((sum, client) => sum + (client.pendingCount || 0), 0);

  const handleDocumentStatusToggle = async (docGroup, docIndex, currentStatus) => {
    const documentGroupId = docGroup._id || docGroup.id;
    const nextStatus = currentStatus === 'Received' ? 'Pending' : 'Received';
    const updateKey = `${documentGroupId}-${docIndex}`;

    setUpdatingDocumentKey(updateKey);
    try {
      await updateDocumentStatus(documentGroupId, docIndex, nextStatus);
      addToast(`Document marked ${nextStatus.toLowerCase()}`, 'success');
    } catch (err) {
      addToast('Failed to update document status', 'error');
    } finally {
      setUpdatingDocumentKey(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Track which documents each client has submitted.</p>
        </div>
        {totalPendingDocs > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--badge-red-bg)', color: 'var(--badge-red-text)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontWeight: 500, fontSize: '0.875rem' }}>
            <Clock size={16} /> {totalPendingDocs} pending documents
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        
        <div className="tabs-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <button className="tab active" style={{ padding: '0.5rem 1rem', background: 'var(--accent-primary)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none' }}>All</button>
          <button className="tab" style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}>Pending</button>
          <button className="tab" style={{ padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: 'none' }}>Received</button>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem',
          border: '1px solid var(--border)',
          backgroundColor: 'white',
          width: '250px'
        }}>
          <Search size={16} color="var(--text-secondary)" style={{ marginRight: '0.5rem' }} />
          <input 
            type="text" 
            placeholder="Search client..." 
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

      {/* Documents Grid */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {documents.map((docGroup, index) => (
          <div key={docGroup.id || docGroup._id} data-aos="fade-up" data-aos-delay={index * 100} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{docGroup.clientName}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{docGroup.business}</p>
              </div>
              {docGroup.pendingCount > 0 && (
                <span className="badge badge-due-soon" style={{ fontSize: '0.75rem', border: '1px solid #fde047' }}>
                  {docGroup.pendingCount} pending
                </span>
              )}
            </div>

            {/* Document List */}
            <div style={{ padding: '0' }}>
              {docGroup.docs.map((doc, index) => (
                <div key={index} className="doc-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {doc.status === 'Received' ? (
                      <CheckCircle2 size={16} color="var(--badge-green-text)" />
                    ) : (
                      <Clock size={16} color="var(--badge-yellow-text)" />
                    )}
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.name}</span>
                  </div>
                  
                  {doc.status === 'Received' ? (
                    <button
                      className="doc-badge doc-badge-pending"
                      disabled={updatingDocumentKey === `${docGroup._id || docGroup.id}-${index}`}
                      onClick={() => handleDocumentStatusToggle(docGroup, index, doc.status)}
                    >
                      {updatingDocumentKey === `${docGroup._id || docGroup.id}-${index}` ? 'Saving...' : 'Mark Pending'}
                    </button>
                  ) : (
                    <button
                      className="doc-badge doc-badge-received"
                      disabled={updatingDocumentKey === `${docGroup._id || docGroup.id}-${index}`}
                      onClick={() => handleDocumentStatusToggle(docGroup, index, doc.status)}
                    >
                      {updatingDocumentKey === `${docGroup._id || docGroup.id}-${index}` ? 'Saving...' : 'Mark Received'}
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        ))}
        {documents.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No clients or documents found. Add a client to see their documents here.
          </div>
        )}
      </div>

    </div>
  );
}
