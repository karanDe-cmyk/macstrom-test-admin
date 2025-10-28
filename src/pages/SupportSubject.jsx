import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check, Loader2 } from 'lucide-react';

import axiosInstance from '../utils/axios';

export default function SupportSubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [bulkSubjects, setBulkSubjects] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/support/subject');
      setSubjects(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    
    try {
      setActionLoading(true);
      await axiosInstance.post('/support/subject', {
        subject: newSubject.trim()
      });
      setNewSubject('');
      setShowAddModal(false);
      await fetchSubjects();
    } catch (err) {
      setError('Failed to add subject');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    const subjectsArray = bulkSubjects
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (subjectsArray.length === 0) return;
    
    try {
      setActionLoading(true);
      await axiosInstance.post('/support/subject', {
        subjects: subjectsArray
      });
      setBulkSubjects('');
      setShowBulkModal(false);
      await fetchSubjects();
    } catch (err) {
      setError('Failed to add bulk subjects');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubject = async (id) => {
    if (!editSubject.trim()) return;
    
    try {
      setActionLoading(true);
      await axiosInstance.put(`/support/subject/${id}`, {
        subject: editSubject.trim()
      });
      setEditingId(null);
      setEditSubject('');
      await fetchSubjects();
    } catch (err) {
      setError('Failed to update subject');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/support/subject/${id}`);
      await fetchSubjects();
    } catch (err) {
      setError('Failed to delete subject');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setEditSubject(subject.subject);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSubject('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Subjects</h1>
              <p className="text-gray-600 mt-1">Manage support ticket categories</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Bulk Add
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Subject
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Subjects List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No subjects found</p>
              <p className="text-sm mt-2">Click "Add Subject" to create one</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingId === subject.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateSubject(subject.id)}
                            disabled={actionLoading}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>ID: {subject.id}</span>
                            <span>•</span>
                            <span className={subject.isActive ? 'text-green-600' : 'text-red-600'}>
                              {subject.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span>•</span>
                            <span>{new Date(subject.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {editingId !== subject.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(subject)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Subject Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Add New Subject</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter subject name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubject}
                  disabled={actionLoading || !newSubject.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="animate-spin" size={16} />}
                  Add Subject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Add Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Bulk Add Subjects</h2>
                <button onClick={() => setShowBulkModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">Enter one subject per line</p>
              <textarea
                value={bulkSubjects}
                onChange={(e) => setBulkSubjects(e.target.value)}
                placeholder="Gaming Issue&#10;Account Locked&#10;App Crash"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 font-mono text-sm"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAdd}
                  disabled={actionLoading || !bulkSubjects.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading && <Loader2 className="animate-spin" size={16} />}
                  Add All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}