import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Save, Trash2, Download, AlertCircle, CheckCircle, X, Shield } from 'lucide-react';

const EnvConfigManager = () => {
  const [envData, setEnvData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const API_BASE = 'https://mactromtest-backend.onrender.com/api';
  
  const getAuthHeaders = () => {
    // Try multiple possible token key names
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  localStorage.getItem('jwt');
    
    if (!token) {
      console.log('Available localStorage keys:', Object.keys(localStorage));
      setError('No authentication token found. Please login first.');
      return null;
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchConfig = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      return; // Don't show loading or make request if no token
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/config`, {
        headers
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setEnvData(data.data);
        setError(''); // Clear any previous errors
      } else {
        setError(data.message || 'Failed to fetch configuration');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/config/_reload`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Environment reloaded successfully!');
        await fetchConfig();
      } else {
        setError(data.message || 'Failed to reload environment');
      }
    } catch (err) {
      setError(err.message || 'Failed to reload environment');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/config/_backup`, {
        method: 'POST',
        headers
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Backup created successfully!');
      } else {
        setError(data.message || 'Failed to create backup');
      }
    } catch (err) {
      setError(err.message || 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      setError('Key and value are required');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/config`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          key: newKey.trim(),
          value: newValue.trim()
        })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Key "${newKey}" added successfully!`);
        setNewKey('');
        setNewValue('');
        setShowAddForm(false);
        await fetchConfig();
      } else {
        setError(data.message || 'Failed to add new key');
      }
    } catch (err) {
      setError(err.message || 'Failed to add new key');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/config/${key}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value: editValue })
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Key "${key}" updated successfully!`);
        setEditingKey(null);
        setEditValue('');
        await fetchConfig();
      } else {
        setError(data.message || 'Failed to update key');
      }
    } catch (err) {
      setError(err.message || 'Failed to update key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Are you sure you want to delete "${key}"?`)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/config/${key}`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`Key "${key}" deleted successfully!`);
        await fetchConfig();
      } else {
        setError(data.message || 'Failed to delete key');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete key');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ENV Configuration</h1>
              <p className="text-sm text-gray-600">Configure authentication and security policies</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 flex-1">{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
              <X size={20} />
            </button>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800 flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-200 flex flex-wrap gap-3">
            <button
              onClick={handleReload}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Reload Environment
            </button>
            
            <button
              onClick={handleBackup}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Create Backup
            </button>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium ml-auto"
            >
              <Plus size={16} />
              Add Data
            </button>
          </div>

          {/* Add New Key Form */}
          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Add New Environment Variable</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Key (e.g., TEST)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewKey('');
                    setNewValue('');
                  }}
                  className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Config List */}
          <div className="p-6">
            {loading && Object.keys(envData).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
                <p>Loading configuration...</p>
              </div>
            ) : Object.keys(envData).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No environment variables found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(envData).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    {editingKey === key ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">{key}</label>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <button
                            onClick={() => handleUpdate(key)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-700 mb-1">{key}</h3>
                          <p className="text-gray-900 font-mono text-sm break-all">{value}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(key, value)}
                            className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(key)}
                            disabled={loading}
                            className="px-3 py-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvConfigManager;