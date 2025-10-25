import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, RefreshCw } from 'lucide-react';
import axiosInstance from "../utils/axios";

const ReferEarn = () => {
  const [referralSplits, setReferralSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    firstPartAmount: '',
    secondPartAmount: '',
    secondPartPercentageAmount: ''
  });

  // Fetch referral splits
  const fetchReferralSplits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/referral-split');
      if (response.data.success) {
        setReferralSplits(response.data.data);
      } else {
        setError('Failed to fetch referral splits');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch referral splits');
    } finally {
      setLoading(false);
    }
  };


  // Create new referral split
  const createReferralSplit = async () => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        firstPartAmount: Number(formData.firstPartAmount),
        secondPartAmount: Number(formData.secondPartAmount),
        secondPartPercentageAmount: Number(formData.secondPartPercentageAmount)
      };
      const response = await axiosInstance.post('/referral-split', payload);

      if (response.data.success) {
        setSuccess('Referral split created successfully');
        resetForm();
        setShowAddForm(false);
        fetchReferralSplits();
      } else {
        setError('Failed to create referral split');
      }
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create referral split');
    } finally {
      setLoading(false);
    }
  };

  // Update referral split
 const updateReferralSplit = async (id) => {
    try {
      setLoading(true);
      setError('');
      const payload = {
        firstPartAmount: Number(formData.firstPartAmount),
        secondPartAmount: Number(formData.secondPartAmount),
        secondPartPercentageAmount: Number(formData.secondPartPercentageAmount)
      };
      const response = await axiosInstance.put(`/referral-split/${id}`, payload);

      if (response.data.success) {
        setSuccess('Referral split updated successfully');
        setEditingId(null);
        resetForm();
        fetchReferralSplits();
      } else {
        setError('Failed to update referral split');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update referral split');
    } finally {
      setLoading(false);
    }
  };

  // Delete referral split
  const deleteReferralSplit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this referral split?')) return;

    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.delete(`/referral-split/${id}`);

      if (response.data.success) {
        setSuccess('Referral split deleted successfully');
        fetchReferralSplits();
      } else {
        setError('Failed to delete referral split');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete referral split');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      firstPartAmount: '',
      secondPartAmount: '',
      secondPartPercentageAmount: ''
    });
  };

  const startEdit = (split) => {
    setEditingId(split.id);
    setFormData({
      firstPartAmount: split.firstPartAmount.toString(),
      secondPartAmount: split.secondPartAmount.toString(),
      secondPartPercentageAmount: split.secondPartPercentageAmount.toString()
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = () => {
    if (editingId) {
      updateReferralSplit(editingId);
    } else {
      createReferralSplit();
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    fetchReferralSplits();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 px-2 sm:px-4">
      <div className="w-full max-w-[90%] mx-auto">
        {/* Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Referral Split Manager
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">Manage your referral commission splits efficiently</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={fetchReferralSplits}
                disabled={loading}
                className="group relative overflow-hidden bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setEditingId(null);
                  resetForm();
                }}
                className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                Add New Split
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex justify-between items-center shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{success}</span>
            </div>
            <button onClick={clearMessages} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex justify-between items-center shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={clearMessages} className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="mb-6 p-4 sm:p-6 lg:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {editingId ? 'Edit Referral Split' : 'Create New Referral Split'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  First Part Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    type="number"
                    name="firstPartAmount"
                    value={formData.firstPartAmount}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Second Part Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    type="number"
                    name="secondPartAmount"
                    value={formData.secondPartAmount}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Second Part Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="secondPartPercentageAmount"
                    value={formData.secondPartPercentageAmount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-slate-300"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">%</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : editingId ? 'Update Split' : 'Create Split'}
              </button>
              <button
                onClick={() => {
                  if (editingId) {
                    cancelEdit();
                  } else {
                    setShowAddForm(false);
                    resetForm();
                  }
                }}
                className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-semibold"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200/50">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
              Referral Splits ({referralSplits.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-slate-50/50 backdrop-blur-sm">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    First Part Amount
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Second Part Amount
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                    Created At
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-slate-200/50">
                {loading && referralSplits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                        <span className="text-lg font-medium">Loading referral splits...</span>
                      </div>
                    </td>
                  </tr>
                ) : referralSplits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Plus className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-slate-600">No referral splits found</p>
                          <p className="text-sm text-slate-400 mt-1">Create your first referral split to get started</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  referralSplits.map((split, index) => (
                    <tr key={split.id} className={`hover:bg-indigo-50/50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/30' : 'bg-slate-50/30'}`}>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold rounded-lg">
                            {split.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-emerald-600">₹{split.firstPartAmount}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-blue-600">₹{split.secondPartAmount}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800">
                          {split.secondPartPercentageAmount}%
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">
                        {new Date(split.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(split)}
                            className="group p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-300"
                          >
                            <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          </button>
                          <button
                            onClick={() => deleteReferralSplit(split.id)}
                            className="group p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferEarn;