import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';

import axiosInstance from '../utils/axios';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    teamName: '',
    rank: '',
    MP: '',
    W: '',
    L: '',
    POINTS: '',
    image: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/macstrom-teams/teams');
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('teamName', formData.teamName);
      submitData.append('rank', formData.rank);
      submitData.append('POINTS', formData.POINTS);

      if (!editingTeam) {
        submitData.append('MP', formData.MP);
        submitData.append('W', formData.W);
        submitData.append('L', formData.L);
      }

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingTeam) {
        await axiosInstance.put(`/macstrom-teams/teams/${editingTeam.id}`, submitData);
      } else {
        await axiosInstance.post('/macstrom-teams/teams', submitData);
      }

      await fetchTeams();
      handleCloseModal();
      alert(editingTeam ? 'Team updated successfully!' : 'Team created successfully!');
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      teamName: team.teamName,
      rank: team.rank,
      MP: team.MP,
      W: team.W,
      L: team.L,
      POINTS: team.POINTS,
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/macstrom-teams/teams/${id}`);
      await fetchTeams();
      alert('Team deleted successfully!');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({
      teamName: '',
      rank: '',
      MP: '',
      W: '',
      L: '',
      POINTS: '',
      image: null
    });
  };

  const filteredTeams = teams.filter(team => team.teamName.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalItems = filteredTeams.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const currentTeams = filteredTeams.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900">Team Management</h1>
            <p className="text-blue-600 mt-2">Manage your tournament teams</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            Add Team
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-64 px-4 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none pl-10"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-blue-900 font-medium">Rows per page:</label>
            <select
              value={rowsPerPage === Infinity ? 'All' : rowsPerPage}
              onChange={e => {
                const val = e.target.value;
                setRowsPerPage(val === 'All' ? Infinity : parseInt(val, 10));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:border-blue-500"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="All">All</option>
            </select>
          </div>
        </div>

        {loading && !showModal ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-blue-600 mt-4">Loading teams...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Team Name</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Rank</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">MP</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">W</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">L</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Points</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-blue-600">
                        {searchTerm ? 'No teams match the search criteria.' : 'No teams found. Click "Add Team" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    currentTeams.map((team, index) => (
                      <tr key={team.id} className={`hover:bg-blue-100 transition-colors ${index % 2 === 0 ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center">
                            {team.imageUrl ? (
                              <img 
                                src={team.imageUrl} 
                                alt={team.teamName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-bold text-lg">
                                {team.teamName.charAt(0)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-blue-900">{team.teamName}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {team.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-blue-900 font-medium">{team.MP}</td>
                        <td className="px-6 py-4 text-center text-green-600 font-medium">{team.W}</td>
                        <td className="px-6 py-4 text-center text-red-600 font-medium">{team.L}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {team.POINTS}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(team)}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Edit Team"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(team.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Delete Team"
                            >
                              <Trash2 size={18} />
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
        )}

        {!loading && filteredTeams.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              First
            </button>
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-blue-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
            <button
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg disabled:opacity-50"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              Last
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingTeam ? 'Edit Team' : 'Add New Team'}
                </h2>
                <button onClick={handleCloseModal} className="hover:bg-blue-700 p-2 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      Rank *
                    </label>
                    <input
                      type="number"
                      name="rank"
                      value={formData.rank}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-blue-900 mb-2">
                      Points *
                    </label>
                    <input
                      type="number"
                      name="POINTS"
                      value={formData.POINTS}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="12"
                    />
                  </div>
                </div>

                {!editingTeam && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        Matches Played *
                      </label>
                      <input
                        type="number"
                        name="MP"
                        value={formData.MP}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        Wins *
                      </label>
                      <input
                        type="number"
                        name="W"
                        value={formData.W}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        Losses *
                      </label>
                      <input
                        type="number"
                        name="L"
                        value={formData.L}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                    Team Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  {editingTeam && editingTeam.imageUrl && (
                    <p className="text-sm text-blue-600 mt-2">Current image will be kept if no new image is uploaded</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;