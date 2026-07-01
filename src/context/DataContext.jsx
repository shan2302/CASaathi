import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const { user, token } = useAuth();
  const [clients, setClients] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data whenever user authentication changes
  useEffect(() => {
    if (!token || !user) {
      setClients([]);
      setDeadlines([]);
      setDocuments([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, deadlinesRes, docsRes] = await Promise.all([
          axios.get('/api/clients'),
          axios.get('/api/deadlines'),
          axios.get('/api/documents')
        ]);
        setClients(clientsRes.data);
        setDeadlines(deadlinesRes.data);
        setDocuments(docsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  // Helper to calculate deadline status
  const calculateStatus = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDateStr);
    
    if (isNaN(dueDate.getTime())) return 'Safe'; // fallback

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return 'Due Soon';
    return 'Safe';
  };

  const addClient = async (newClientData, initialDeadlineData) => {
    // Optimistic UI Update: Create a temporary ID and add it immediately
    const tempClientId = 'temp_' + Date.now();
    const optimisticClient = { id: tempClientId, ...newClientData, createdAt: new Date().toISOString() };
    
    setClients(prev => [optimisticClient, ...prev]);

    try {
      // 1. Save Client
      const clientRes = await axios.post('/api/clients', newClientData);
      const savedClient = clientRes.data;
      
      // Replace optimistic client with the real one from DB
      setClients(prev => prev.map(c => c.id === tempClientId ? savedClient : c));
      
      const promises = [];

      // 2. Save custom initial deadline for this client
      if (initialDeadlineData && initialDeadlineData.type && initialDeadlineData.dueDate) {
        const deadlinePayload = {
          clientName: savedClient.name,
          clientPhone: savedClient.phone,
          type: initialDeadlineData.type,
          dueDate: initialDeadlineData.dueDate,
          status: calculateStatus(initialDeadlineData.dueDate)
        };
        promises.push(
          axios.post('/api/deadlines', deadlinePayload).then(res => {
            setDeadlines(prev => [res.data, ...prev]);
          })
        );
      }

      // 3. Save dummy documents for this client
      const docPayload = {
        clientName: savedClient.name,
        business: savedClient.business,
        pendingCount: 4,
        docs: [
          { name: 'GST Bills', status: 'Pending' },
          { name: 'Bank Statement', status: 'Pending' },
          { name: 'Sales Report', status: 'Pending' },
          { name: 'Purchase Report', status: 'Pending' },
        ]
      };
      
      promises.push(
        axios.post('/api/documents', docPayload).then(res => {
          setDocuments(prev => [res.data, ...prev]);
        })
      );

      // Execute Deadline and Document inserts simultaneously
      await Promise.all(promises);
      
    } catch (err) {
      console.error("Error adding client:", err);
      // Revert optimistic update if the initial client insert failed
      setClients(prev => prev.filter(c => c.id !== tempClientId));
    }
  };

  const addDeadline = async (newDeadlineData) => {
    try {
      const client = clients.find(c => c.name === newDeadlineData.clientName);
      
      const payload = {
        clientName: newDeadlineData.clientName,
        clientPhone: client ? client.phone : '-',
        type: newDeadlineData.type,
        dueDate: newDeadlineData.dueDate,
        status: calculateStatus(newDeadlineData.dueDate)
      };
      
      const res = await axios.post('/api/deadlines', payload);
      setDeadlines(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Error adding deadline:", err);
    }
  };

  const removeClient = async (clientId) => {
    try {
      const clientToRemove = clients.find(c => (c._id || c.id) === clientId);
      if (!clientToRemove) return;
      
      await axios.post(`/api/clients/delete/${clientId}`);
      
      setClients(prev => prev.filter(c => (c._id || c.id) !== clientId));
      setDeadlines(prev => prev.filter(d => d.clientName !== clientToRemove.name));
      setDocuments(prev => prev.filter(d => d.clientName !== clientToRemove.name));
    } catch (err) {
      console.error("Error removing client:", err);
    }
  };

  const removeDeadline = async (deadlineId) => {
    try {
      await axios.post(`/api/deadlines/delete/${deadlineId}`);
      setDeadlines(prev => prev.filter(d => (d._id || d.id) !== deadlineId));
    } catch (err) {
      console.error("Error removing deadline:", err);
    }
  };

  const editClient = async (clientId, updatedData) => {
    try {
      const res = await axios.post(`/api/clients/update/${clientId}`, updatedData);
      setClients(prev => prev.map(c => (c._id || c.id) === clientId ? res.data : c));
      
      // Update associated documents and deadlines with the new name if it changed
      if (updatedData.name) {
         setDeadlines(prev => prev.map(d => d.clientName === updatedData.name ? { ...d, clientPhone: updatedData.phone || d.clientPhone } : d));
         setDocuments(prev => prev.map(d => d.clientName === updatedData.name ? { ...d, business: updatedData.business || d.business } : d));
      }
    } catch (err) {
      console.error("Error editing client:", err);
    }
  };

  const editDeadline = async (deadlineId, updatedData) => {
    try {
      // Need to recalculate status if dueDate is updated
      if (updatedData.dueDate) {
        updatedData.status = calculateStatus(updatedData.dueDate);
      }
      const res = await axios.post(`/api/deadlines/update/${deadlineId}`, updatedData);
      setDeadlines(prev => prev.map(d => (d._id || d.id) === deadlineId ? res.data : d));
    } catch (err) {
      console.error("Error editing deadline:", err);
    }
  };

  const value = {
    clients,
    deadlines,
    documents,
    loading,
    addClient,
    removeClient,
    addDeadline,
    removeDeadline,
    editClient,
    editDeadline
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
