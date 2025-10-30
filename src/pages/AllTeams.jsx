import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Calendar, DollarSign, Users, CheckCircle, X, Save } from 'lucide-react';
import axiosInstance from '../utils/axios';
import {toast} from 'react-toastify';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const API_BASE = 'https://mactromtest-backend.onrender.com/api/admin/teams';

  // Custom axios-like HTTP client
  const httpClient = {
    get: async (url) => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { data: await response.json() };
    },
    delete: async (url) => {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { data: response.status === 204 ? null : await response.json() };
    },
    put: async (url, data) => {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { data: await response.json() };
    }
  };

  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get(API_BASE);
      setTeams(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch teams. Please try again.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId) => {
    try {
      await httpClient.delete(`${API_BASE}/${teamId}`);
      setTeams(teams.filter(team => team.id !== teamId));
      setShowDeleteModal(null);
       toast.success('Team deleted successfully ');
      setError('');
    } catch (err) {
       toast.error('Failed to delete team ');
      console.error('Error deleting team:', err);
    }
  };

  const updateTeam = async (teamId, updatedData) => {
    try {
      const response = await httpClient.put(`${API_BASE}/${teamId}`, updatedData);
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, ...updatedData } : team
      ));
      setEditingTeam(null);
      toast.success('Team updated successfully ');
      setError('');
    } catch (err) {
      toast.error('Failed to update team ');
      console.error('Error updating team:', err);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get('name'),
      registrationAmount: formData.get('registrationAmount'),
      lastRegistrationDate: formData.get('lastRegistrationDate'),
    };
    updateTeam(editingTeam.id, updatedData);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-2">Manage your gaming teams and tournaments</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
                <p className="text-sm text-gray-500">Total Teams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Team Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                {team.imageUrl ? (
                  <img 
                    src={team.imageUrl} 
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setEditingTeam(team)}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(team)}
                    className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white p-2 rounded-full transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Team Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{team.name}</h3>
                
                {/* Team Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">Registration: ₹{team.registrationAmount}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Last Date: {formatDate(team.lastRegistrationDate)}</span>
                  </div>
                </div>

                {/* Rules */}
                {team.rules && team.rules.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Rules:</h4>
                    <div className="space-y-1">
                      {team.rules.map((rule) => (
                        <div key={rule.id} className="flex items-start">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-xs text-gray-600">
                            {rule.text === '[object Object]' ? 'Rule details' : rule.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {team.benefits && team.benefits.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {team.benefits.map((benefit) => (
                        <span key={benefit.id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {benefit.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* How to Play */}
                {team.howToPlay && team.howToPlay.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">How to Play:</h4>
                    <div className="space-y-1">
                      {team.howToPlay.map((step, index) => (
                        <div key={step.id} className="flex items-start">
                          <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs text-gray-600">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Team</h2>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    defaultValue={editingTeam.name}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="edit-amount"
                    defaultValue={editingTeam.registrationAmount}
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Registration Date
                  </label>
                  <input
                    type="date"
                    id="edit-date"
                    defaultValue={editingTeam.lastRegistrationDate ? editingTeam.lastRegistrationDate.split('T')[0] : ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setEditingTeam(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const name = document.getElementById('edit-name').value;
                      const registrationAmount = document.getElementById('edit-amount').value;
                      const lastRegistrationDate = document.getElementById('edit-date').value;
                      
                      updateTeam(editingTeam.id, {
                        name,
                        registrationAmount,
                        lastRegistrationDate
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Team</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{showDeleteModal.name}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteTeam(showDeleteModal.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {teams.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600">Teams will appear here when they are created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;