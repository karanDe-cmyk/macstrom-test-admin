import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '../utils/axios';

const RulesAdminPanel = () => {
  const [rules, setRules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    section: '',
    content: [''],
    type: '',
    important_notice: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [filterSection, setFilterSection] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = 'https://macstrombattle-api.kglame.com/api';

  const types = [
    { value: 'eligibility', label: 'Eligibility' },
    { value: 'conduct', label: 'Conduct' },
    { value: 'anti-cheat', label: 'Anti-Cheat' },
    { value: 'format', label: 'Format' },
    { value: 'prizes', label: 'Prizes' },
    { value: 'technical', label: 'Technical' }
  ];

  // Get unique sections from rules
  const sections = [...new Set(rules.map(rule => rule.section))];

  // Fetch rules from API
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`${API_BASE}/rule-regulation`);
      
      // Transform API data to match component structure
      const transformedRules = response.data.map(rule => ({
        ...rule,
        content: typeof rule.content === 'string' ? JSON.parse(rule.content) : rule.content
      }));
      
      setRules(transformedRules);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('Failed to load rules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);

  // Filter rules based on search and filters
  const filteredRules = rules.filter(rule => {
    const matchesSection = filterSection === 'all' || rule.section === filterSection;
    const matchesType = filterType === 'all' || rule.type === filterType;
    
    // Search through content array and other fields
    const contentString = Array.isArray(rule.content) ? rule.content.join(' ') : rule.content;
    const matchesSearch = 
      contentString.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.important_notice.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSection && matchesType && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRules = filteredRules.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSection, filterType, searchTerm, itemsPerPage]);
  
  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      section: '',
      content: [''],
      type: '',
      important_notice: ''
    });
    setIsModalOpen(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      section: rule.section,
      content: Array.isArray(rule.content) ? rule.content : [rule.content],
      type: rule.type,
      important_notice: rule.important_notice
    });
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      try {
        setLoading(true);
        await axiosInstance.delete(`${API_BASE}/rule-regulation/${id}`);
        await fetchRules(); // Refresh the list
      } catch (err) {
        console.error('Error deleting rule:', err);
        setError('Failed to delete rule. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.section || !formData.type  ) {
      setError('Please fill in all required fields');
      return;
    }

    // Filter out empty content items
    const contentArray = formData.content.filter(item => item.trim() !== '');
    if (contentArray.length === 0) {
      setError('Please add at least one content item');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        section: formData.section,
        content: contentArray,
        type: formData.type,
        important_notice: formData.important_notice
      };

      if (editingRule) {
        await axiosInstance.put(`${API_BASE}/rule-regulation/${editingRule.id}`, payload);
      } else {
        await axiosInstance.post(`${API_BASE}/rule-regulation`, payload);
      }
      
      setIsModalOpen(false);
      setEditingRule(null);
      await fetchRules(); // Refresh the list
    } catch (err) {
      console.error('Error saving rule:', err);
      setError('Failed to save rule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle content array changes
  const handleContentChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((item, i) => i === index ? value : item)
    }));
  };

  const addContentItem = () => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, '']
    }));
  };

  const removeContentItem = (index) => {
    if (formData.content.length > 1) {
      setFormData(prev => ({
        ...prev,
        content: prev.content.filter((_, i) => i !== index)
      }));
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'eligibility': return 'bg-blue-100 text-blue-800';
      case 'conduct': return 'bg-green-100 text-green-800';
      case 'anti-cheat': return 'bg-red-100 text-red-800';
      case 'format': return 'bg-purple-100 text-purple-800';
      case 'prizes': return 'bg-yellow-100 text-yellow-800';
      case 'technical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    const typeObj = types.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
  };

  // Pagination component
  const Pagination = ({ className = '' }) => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
        {/* Results info */}
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredRules.length)} of {filteredRules.length} results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2 order-1 sm:order-2">
          {/* Items per page - hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                disabled={typeof page !== 'number'}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-blue-500 text-white'
                    : typeof page === 'number'
                    ? 'border border-gray-300 hover:bg-gray-50'
                    : 'cursor-default'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-700 hover:text-red-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Rules & Regulations Management</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage tournament rules and regulations with important notices</p>
            </div>
            <button
              onClick={handleAddRule}
              disabled={loading}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:inline">Add New Rule</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Filters and controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Section:</label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sections</option>
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    {types.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">View:</label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 sm:px-4 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 sm:px-4 py-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Grid
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 font-medium">
                  Total: {filteredRules.length} rules
                </div>
              </div>
            </div>
          </div>

          {/* Top Pagination */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Pagination />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center mb-6">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading rules...</p>
          </div>
        )}

        {/* Rules Display */}
        {!loading && (
          <>
            {viewMode === 'list' ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rule Content</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Section</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Important Notice</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {Array.isArray(rule.content) ? rule.content.map((item, index) => (
                                <p key={index} className="text-gray-800 text-sm">• {item}</p>
                              )) : (
                                <p className="text-gray-800 text-sm">{rule.content}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {rule.section}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs ${getTypeColor(rule.type)}`}>
                              {getTypeLabel(rule.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                              {rule.important_notice}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleEditRule(rule)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit Rule"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRule(rule.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view for list mode */}
                <div className="lg:hidden space-y-4 p-4">
                  {currentRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {rule.section}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs ${getTypeColor(rule.type)}`}>
                            {getTypeLabel(rule.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <button
                            onClick={() => handleEditRule(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit Rule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        {Array.isArray(rule.content) ? rule.content.map((item, index) => (
                          <p key={index} className="text-gray-800 text-sm">• {item}</p>
                        )) : (
                          <p className="text-gray-800 text-sm">{rule.content}</p>
                        )}
                      </div>
                      
                      <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <p className="text-xs text-red-600 font-medium mb-1">Important Notice:</p>
                        <p className="text-xs text-red-700">{rule.important_notice}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {currentRules.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    No rules found matching your criteria.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
                {currentRules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {rule.section}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${getTypeColor(rule.type)}`}>
                          {getTypeLabel(rule.type)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      {Array.isArray(rule.content) ? rule.content.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-gray-800 text-sm">• {item}</p>
                      )) : (
                        <p className="text-gray-800 text-sm line-clamp-3">{rule.content}</p>
                      )}
                      {Array.isArray(rule.content) && rule.content.length > 3 && (
                        <p className="text-gray-500 text-xs">+{rule.content.length - 3} more items</p>
                      )}
                    </div>
                    
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                      <p className="text-xs text-red-600 font-medium mb-1">Important Notice:</p>
                      <p className="text-xs text-red-700">{rule.important_notice}</p>
                    </div>
                  </div>
                ))}
                
                {currentRules.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No rules found matching your criteria.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Bottom Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-4">
            <Pagination />
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                    {editingRule ? 'Edit Rule' : 'Add New Rule'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setError('');
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="Enter section name (e.g., Eligibility Requirements)"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type...</option>
                      {types.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Items *
                    </label>
                    <div className="space-y-2">
                      {formData.content.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleContentChange(index, e.target.value)}
                            placeholder={`Content item ${index + 1}`}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {formData.content.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContentItem(index)}
                              className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addContentItem}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Content Item
                      </button>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Important Notice 
                    </label>
                    <textarea
                      name="important_notice"
                      value={formData.important_notice}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter important notice about violations or consequences"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setError('');
                      }}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          {editingRule ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {editingRule ? 'Update Rule' : 'Create Rule'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RulesAdminPanel;