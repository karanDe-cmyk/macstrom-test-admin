// components/Modules.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const Modules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showSubmoduleForm, setShowSubmoduleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingSubmodule, setEditingSubmodule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    name: '',
    description: ''
  });

  const [submoduleForm, setSubmoduleForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchModules();
  }, []);

  // API Calls with better error handling
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching modules...');
      
      const response = await axiosInstance.get('/modules');
      console.log('Modules API response:', response);
      
      // Handle different response structures
      const modulesData = response.data?.data || response.data || response;
      console.log('Modules data:', modulesData);
      
      if (Array.isArray(modulesData)) {
        setModules(modulesData);
      } else {
        console.error('Unexpected response format:', modulesData);
        setModules([]);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch modules';
      setError(errorMessage);
      setModules([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmodules = async (moduleId) => {
    try {
      const response = await axiosInstance.get(`/modules/${moduleId}/submodules`);
      const submodulesData = response.data?.data || response.data || response;
      return Array.isArray(submodulesData) ? submodulesData : [];
    } catch (err) {
      console.error(`Error fetching submodules for module ${moduleId}:`, err);
      return [];
    }
  };

  const createModule = async (moduleData) => {
    const response = await axiosInstance.post('/modules', moduleData);
    return response.data;
  };

  const updateModule = async (moduleId, moduleData) => {
    const response = await axiosInstance.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  };

  const deleteModule = async (moduleId) => {
    const response = await axiosInstance.delete(`/modules/${moduleId}`);
    return response.data;
  };

  const createSubmodule = async (moduleId, submoduleData) => {
    const response = await axiosInstance.post(`/modules/${moduleId}/submodules`, submoduleData);
    return response.data;
  };

  const updateSubmodule = async (moduleId, submoduleId, submoduleData) => {
    const response = await axiosInstance.put(`/modules/${moduleId}/submodules/${submoduleId}`, submoduleData);
    return response.data;
  };

  const deleteSubmodule = async (moduleId, submoduleId) => {
    const response = await axiosInstance.delete(`/modules/${moduleId}/submodules/${submoduleId}`);
    return response.data;
  };

  // Module handlers
  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createModule(moduleForm);
      setModuleForm({ name: '', description: '' });
      setShowModuleForm(false);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create module';
      setError(errorMessage);
      console.error('Error creating module:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateModule(editingModule.id, moduleForm);
      setModuleForm({ name: '', description: '' });
      setEditingModule(null);
      setShowModuleForm(false);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update module';
      setError(errorMessage);
      console.error('Error updating module:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All submodules will also be deleted.')) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteModule(moduleId);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete module';
      setError(errorMessage);
      console.error('Error deleting module:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Submodule handlers
  const handleCreateSubmodule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createSubmodule(selectedModule.id, submoduleForm);
      setSubmoduleForm({ name: '', description: '' });
      setShowSubmoduleForm(false);
      setSelectedModule(null);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create submodule';
      setError(errorMessage);
      console.error('Error creating submodule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmodule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateSubmodule(
        selectedModule.id,
        editingSubmodule.id,
        submoduleForm
      );
      setSubmoduleForm({ name: '', description: '' });
      setEditingSubmodule(null);
      setShowSubmoduleForm(false);
      setSelectedModule(null);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update submodule';
      setError(errorMessage);
      console.error('Error updating submodule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmodule = async (moduleId, submoduleId) => {
    if (!window.confirm('Are you sure you want to delete this submodule?')) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteSubmodule(moduleId, submoduleId);
      await fetchModules();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete submodule';
      setError(errorMessage);
      console.error('Error deleting submodule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Form handlers
  const openModuleForm = (module = null) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        name: module.name || '',
        description: module.description || ''
      });
    } else {
      setEditingModule(null);
      setModuleForm({ name: '', description: '' });
    }
    setShowModuleForm(true);
  };

  const openSubmoduleForm = (module, submodule = null) => {
    setSelectedModule(module);
    if (submodule) {
      setEditingSubmodule(submodule);
      setSubmoduleForm({
        name: submodule.name || '',
        description: submodule.description || ''
      });
    } else {
      setEditingSubmodule(null);
      setSubmoduleForm({ name: '', description: '' });
    }
    setShowSubmoduleForm(true);
  };

  const closeForms = () => {
    setShowModuleForm(false);
    setShowSubmoduleForm(false);
    setEditingModule(null);
    setEditingSubmodule(null);
    setSelectedModule(null);
    setModuleForm({ name: '', description: '' });
    setSubmoduleForm({ name: '', description: '' });
  };

  const toggleModule = async (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      // Fetch submodules if not already loaded
      const module = modules.find(m => m.id === moduleId);
      if (module && !module.submodules) {
        const submodules = await fetchSubmodules(moduleId);
        setModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, submodules } : m
        ));
      }
    }
    setExpandedModules(newExpanded);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading modules...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modules Management</h1>
            <p className="text-gray-600 mt-2">Manage application modules and submodules</p>
          </div>
          <button
            onClick={() => openModuleForm()}
            disabled={actionLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {actionLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add Module
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Modules List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first module.</p>
              <button
                onClick={() => openModuleForm()}
                disabled={actionLoading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Module
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {modules.map((module) => (
                <div key={module.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleModule(module.id)}
                        disabled={actionLoading}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                      >
                        <svg
                          className={`w-5 h-5 transform transition-transform ${
                            expandedModules.has(module.id) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSubmoduleForm(module)}
                        disabled={actionLoading}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50 flex items-center text-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Submodule
                      </button>
                      <button
                        onClick={() => openModuleForm(module)}
                        disabled={actionLoading}
                        className="text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center text-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module.id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 flex items-center text-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Submodules */}
                  {expandedModules.has(module.id) && (
                    <div className="mt-4 ml-9 border-l-2 border-gray-200 pl-6">
                      {(!module.submodules || module.submodules.length === 0) ? (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                          <p>No submodules found.</p>
                          <button
                            onClick={() => openSubmoduleForm(module)}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Add your first submodule
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {module.submodules.map((submodule) => (
                            <div key={submodule.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{submodule.name}</h4>
                                <p className="text-gray-600 text-sm mt-1">{submodule.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openSubmoduleForm(module, submodule)}
                                  disabled={actionLoading}
                                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 text-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmodule(module.id, submodule.id)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Module Form Modal */}
        {showModuleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h2>
              <form onSubmit={editingModule ? handleUpdateModule : handleCreateModule}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={moduleForm.name}
                      onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter module name"
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter module description"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeForms}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                  >
                    {actionLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editingModule ? 'Update' : 'Create'} Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submodule Form Modal */}
        {showSubmoduleForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingSubmodule ? 'Edit Submodule' : 'Create New Submodule'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Module: <span className="font-medium">{selectedModule?.name}</span>
              </p>
              <form onSubmit={editingSubmodule ? handleUpdateSubmodule : handleCreateSubmodule}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submodule Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={submoduleForm.name}
                      onChange={(e) => setSubmoduleForm({ ...submoduleForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter submodule name"
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={submoduleForm.description}
                      onChange={(e) => setSubmoduleForm({ ...submoduleForm, description: e.target.value })}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter submodule description"
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeForms}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
                  >
                    {actionLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editingSubmodule ? 'Update' : 'Create'} Submodule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modules;