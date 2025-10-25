import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit3, Save, X, Trophy, Gift, Users, Zap } from 'lucide-react';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const TournamentAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('prizes');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prizes, setPrizes] = useState([]);
  const [additionalBenefits, setAdditionalBenefits] = useState([]);
  const [newPrize, setNewPrize] = useState({ place: '', amount: '', benefits: [''] });
  const [newBenefit, setNewBenefit] = useState({ category: '', icon: 'gift', items: [{ name: '', description: '' }] });

  const API_BASE_URL = 'https://macstrombattle-api.kglame.com/api';
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGUiOiJTdXBlckFkbWluIiwiaWF0IjoxNzU4NzE1NjU5LCJleHAiOjE3NjAwMTE2NTl9.jIXfpq3K2-_vi3dp2CbKL7tBFfETyCiDsdpEd6r3aoo';

  // Helper function for API requests with Axios
  const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await axios(url, config);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `HTTP error! status: ${error.response?.status}`);
    }
  };

  // Fetch prizes and benefits on component mount
  useEffect(() => {
    fetchPrizes();
    fetchBenefits();
  }, []);

  const fetchPrizes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest('/prizes');
      if (response.success) {
        setPrizes(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching prizes:', error);
      setError('Failed to fetch prizes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiRequest('/benefits');
      if (response.success) {
        // Map API response to match frontend structure
        const formattedBenefits = response.data.map(benefit => ({
          id: benefit.id,
          category: benefit.categoryName,
          icon: benefit.icon,
          items: benefit.items.map(item => ({
            id: item.id || Date.now() + Math.random(), // Generate temporary ID if not provided
            name: item.name,
            description: item.description
          }))
        }));
        setAdditionalBenefits(formattedBenefits || []);
      }
    } catch (error) {
      console.error('Error fetching benefits:', error);
      setError('Failed to fetch benefits');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      gift: Gift,
      trophy: Trophy,
      users: Users,
      zap: Zap
    };
    const IconComponent = icons[iconName.toLowerCase()] || Gift;
    return <IconComponent className="w-5 h-5" />;
  };

  const addPrize = async () => {
    if (newPrize.place && newPrize.amount) {
      try {
        setLoading(true);
        setError('');
        const prizeData = {
          place: parseInt(newPrize.place),
          amount: parseInt(newPrize.amount),
          benefits: newPrize.benefits.filter(b => b.trim() !== '')
        };
        const response = await apiRequest('/prizes', {
          method: 'POST',
          data: prizeData
        });
        if (response.success) {
          await fetchPrizes();
          toast.success('Prize added successfully ');
          setNewPrize({ place: '', amount: '', benefits: [''] });
        }
      } catch (error) {
        console.error('Error adding prize:', error);
        setError('Failed to add prize');
      } finally {
        setLoading(false);
      }
    }
  };

  const deletePrize = async (id) => {
    try {
      setLoading(true);
      setError('');
      await apiRequest(`/prizes/${id}`, { method: 'DELETE' });
      await fetchPrizes();
       toast.success('Prize deleted successfully ');
    } catch (error) {
      console.error('Error deleting prize:', error);
      setError('Failed to delete prize');
       toast.error('Failed to delete prize ');
    } finally {
      setLoading(false);
    }
  };

  const updatePrize = async (id, updatedData) => {
    try {
      setLoading(true);
      setError('');
      await apiRequest(`/prizes/${id}`, {
        method: 'PUT',
        data: updatedData
      });
      await fetchPrizes();
      setEditingItem(null);
       toast.success('Prize updated successfully ');
    } catch (error) {
      console.error('Error updating prize:', error);
      setError('Failed to update prize');
      toast.error('Failed to update prize ');
    } finally {
      setLoading(false);
    }
  };

  const addBenefitCategory = async () => {
    if (newBenefit.category) {
      try {
        setLoading(true);
        setError('');
        const benefitData = {
          categoryName: newBenefit.category,
          icon: newBenefit.icon,
          items: newBenefit.items.filter(item => item.name.trim() !== '')
        };
        const response = await apiRequest('/benefits', {
          method: 'POST',
          data: benefitData
        });
        if (response.success) {
          await fetchBenefits();
          setNewBenefit({ category: '', icon: 'gift', items: [{ name: '', description: '' }] });
        }
      } catch (error) {
        console.error('Error adding benefit:', error);
        setError('Failed to add benefit');
      } finally {
        setLoading(false);
      }
    }
  };

  const updateBenefitCategory = async (id, updatedData) => {
    try {
      setLoading(true);
      setError('');
      await apiRequest(`/benefits/${id}`, {
        method: 'PUT',
        data: updatedData
      });
      await fetchBenefits();
    } catch (error) {
      console.error('Error updating benefit:', error);
      setError('Failed to update benefit');
    } finally {
      setLoading(false);
    }
  };

  const deleteBenefitCategory = async (id) => {
    try {
      setLoading(true);
      setError('');
      await apiRequest(`/benefits/${id}`, { method: 'DELETE' });
      await fetchBenefits();
          toast.success('Benefit category deleted ');
    } catch (error) {
      console.error('Error deleting benefit:', error);
      setError('Failed to delete benefit');
       toast.error('Failed to delete benefit ');
    } finally {
      setLoading(false);
    }
  };

  const updateBenefitItem = (categoryId, itemId, field, value) => {
  setAdditionalBenefits(additionalBenefits.map(category => {
    if (category.id === categoryId) {
      const updatedItems = category.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      );
      return { ...category, items: updatedItems };
    }
    return category;
  }));
};

const saveBenefitCategory = async (category) => {
  try {
    setLoading(true);
    setError('');
    await apiRequest(`/benefits/${category.id}`, {
      method: 'PUT',
      data: {
        categoryName: category.category,
        icon: category.icon,
        items: category.items
      }
    });
    await fetchBenefits();
    toast.success('Benefit category saved successfully ');
  } catch (error) {
    console.error('Error saving benefit category:', error);
    setError('Failed to save benefit');
    toast.error('Failed to save benefit ');
  } finally {
    setLoading(false);
  }
};

  const addBenefitItem = (categoryId) => {
    setAdditionalBenefits(additionalBenefits.map(category => {
      if (category.id === categoryId) {
        const updatedCategory = {
          ...category,
          items: [...category.items, { id: Date.now(), name: '', description: '' }]
        };
        updateBenefitCategory(categoryId, {
          categoryName: updatedCategory.category,
          icon: updatedCategory.icon,
          items: updatedCategory.items
        });
        return updatedCategory;
      }
      return category;
    }));
  };

  const deleteBenefitItem = (categoryId, itemId) => {
    setAdditionalBenefits(additionalBenefits.map(category => {
      if (category.id === categoryId) {
        const updatedItems = category.items.filter(item => item.id !== itemId);
        const updatedCategory = { ...category, items: updatedItems };
        updateBenefitCategory(categoryId, {
          categoryName: updatedCategory.category,
          icon: updatedCategory.icon,
          items: updatedItems
        });
        return updatedCategory;
      }
      return category;
    }));
  };

  return (
    <div className="min-h-screen text-gray-800">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-6 mx-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Prize distribution</h1>
               <p className="text-gray-600 dark:text-gray-400">Manage prizes, benefits, and tournament settings</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'prizes' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Cash Prizes & Ranks
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'benefits' 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Additional Benefits
          </button>
        </div>

        {/* Prizes Tab */}
        {activeTab === 'prizes' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-red-600">{error}</p>
                  <button 
                    onClick={() => setError('')}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Prize Configuration</h2>
              
              {loading && (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading...</p>
                </div>
              )}
              
              {/* Existing Prizes */}
              <div className="space-y-4 mb-6">
                {prizes.map((prize) => (
                  <div key={prize.id} 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                            {prize.place === 1 ? '1st' : prize.place === 2 ? '2nd' : prize.place === 3 ? '3rd' : `${prize.place}th`} Place
                          </h3>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ₹{prize.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem(prize.id)}
                          className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-md transition-colors"
                          disabled={loading}
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deletePrize(prize.id)}
                          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-md transition-colors"
                          disabled={loading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {editingItem === prize.id ? (
                      <EditPrizeForm 
                        prize={prize}
                        onSave={(updatedData) => updatePrize(prize.id, updatedData)}
                        onCancel={() => setEditingItem(null)}
                        loading={loading}
                      />
                    ) : (
                      <div className="space-y-1">
                        {prize.benefits && prize.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center text-gray-700">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                            {benefit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Prize */}
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                <h3 className="font-bold mb-4 text-gray-800">Add New Prize</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Place</label>
                    <input
                      type="number"
                      value={newPrize.place}
                      onChange={(e) => setNewPrize({...newPrize, place: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="1, 2, 3..."
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Amount</label>
                    <input
                      type="number"
                      value={newPrize.amount}
                      onChange={(e) => setNewPrize({...newPrize, amount: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="25000"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Benefits</label>
                  {newPrize.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const updated = [...newPrize.benefits];
                          updated[idx] = e.target.value;
                          setNewPrize({...newPrize, benefits: updated});
                        }}
                        className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter benefit..."
                        disabled={loading}
                      />
                      {idx === newPrize.benefits.length - 1 && (
                        <button
                          onClick={() => setNewPrize({...newPrize, benefits: [...newPrize.benefits, '']})}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addPrize}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-md font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Prize'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-purple-600">Additional Benefits</h2>
              
              {/* Existing Benefit Categories */}
              <div className="space-y-6 mb-6">
                {additionalBenefits.map((category) => (
                  <div key={category.id} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-2">
                          {getIconComponent(category.icon)}
                          <span className="sr-only">Icon</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800">{category.category}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addBenefitItem(category.id)}
                          className="text-green-500 hover:text-green-600 p-2 hover:bg-green-50 rounded-md transition-colors"
                          disabled={loading}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteBenefitCategory(category.id)}
                          className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-md transition-colors"
                          disabled={loading}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateBenefitItem(category.id, item.id, 'name', e.target.value)}
                              className="flex-1 p-2 bg-gray-50 rounded border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Benefit name..."
                              disabled={loading}
                            />
                            <button
                              onClick={() => deleteBenefitItem(category.id, item.id)}
                              className="ml-2 text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateBenefitItem(category.id, item.id, 'description', e.target.value)}
                            className="w-full p-2 bg-gray-50 rounded border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Description (optional)..."
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-right">
  <button
    onClick={() => saveBenefitCategory(category)}
    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors disabled:opacity-50"
    disabled={loading}
  >
    Save
  </button>
</div>
                  </div>
                ))}
              </div>

              {/* Add New Benefit Category */}
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                <h3 className="font-bold mb-4 text-gray-800">Add New Benefit Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Category Name</label>
                    <input
                      type="text"
                      value={newBenefit.category}
                      onChange={(e) => setNewBenefit({...newBenefit, category: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., Community Perks"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Icon</label>
                    <select
                      value={newBenefit.icon}
                      onChange={(e) => setNewBenefit({...newBenefit, icon: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      disabled={loading}
                    >
                      <option value="gift">Gift</option>
                      <option value="trophy">Trophy</option>
                      <option value="users">Users</option>
                      <option value="zap">Zap</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Benefits</label>
                  {newBenefit.items.map((item, idx) => (
                    <div key={idx} className="space-y-2 mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...newBenefit.items];
                          updated[idx].name = e.target.value;
                          setNewBenefit({...newBenefit, items: updated});
                        }}
                        className="w-full p-2 bg-white rounded border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Benefit name..."
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...newBenefit.items];
                          updated[idx].description = e.target.value;
                          setNewBenefit({...newBenefit, items: updated});
                        }}
                        className="w-full p-2 bg-white rounded border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="Description (optional)..."
                        disabled={loading}
                      />
                      {idx === newBenefit.items.length - 1 && (
                        <button
                          onClick={() => setNewBenefit({...newBenefit, items: [...newBenefit.items, {name: '', description: ''}]})}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm transition-colors"
                          disabled={loading}
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add Item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addBenefitCategory}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-md font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105">
            <Save className="w-6 h-6 inline mr-2" />
            Save All Changess
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Prize Form Component
const EditPrizeForm = ({ prize, onSave, onCancel, loading }) => {
  const [editData, setEditData] = useState({
    amount: prize.amount,
    benefits: prize.benefits || ['']
  });

  const handleSave = () => {
    const updatedData = {
      amount: parseInt(editData.amount),
      benefits: editData.benefits.filter(b => b.trim() !== '')
    };
    onSave(updatedData);
  };

  return (
    <div className="space-y-4 mt-4 p-4 bg-white rounded-lg border border-gray-300">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Amount</label>
        <input
          type="number"
          value={editData.amount}
          onChange={(e) => setEditData({...editData, amount: e.target.value})}
          className="w-full p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Benefits</label>
        {editData.benefits.map((benefit, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={benefit}
              onChange={(e) => {
                const updated = [...editData.benefits];
                updated[idx] = e.target.value;
                setEditData({...editData, benefits: updated});
              }}
              className="flex-1 p-3 bg-gray-50 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter benefit..."
              disabled={loading}
            />
            {idx === editData.benefits.length - 1 && (
              <button
                onClick={() => setEditData({...editData, benefits: [...editData.benefits, '']})}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TournamentAdminPanel;