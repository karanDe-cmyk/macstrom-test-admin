import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Calendar, TrendingUp, XCircle, Diamond } from 'lucide-react';
import axiosInstance from '../utils/axios';


const ReferralSystem = () => {
  // State for referrals, loading, and errors
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for creating a new referral
  const [newReferral, setNewReferral] = useState({
    amount: "",
    expiryDate: "",
  });

  // State for editing a referral
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Function to show a modal error message
  const displayError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };
  
  // Custom Modal component for errors
  const ErrorModal = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-red-600">Error</h4>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-700">{message}</p>
          <div className="mt-6 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Fetches all referrals from the API.
   * This function handles loading state and potential errors.
   */
  const fetchReferrals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/referral`);
      // Update state with fetched data, mapping expiryDate to Date objects
      const formattedReferrals = response.data.map(ref => ({
        ...ref,
        expiryDate: new Date(ref.expiryDate),
        status: new Date(ref.expiryDate) > new Date() ? 'active' : 'expired'
      }));
      setReferrals(formattedReferrals);
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
      displayError('Failed to fetch referrals. Please check if the API server is running.');
      setError('Failed to fetch referrals.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch referrals on initial component mount
  useEffect(() => {
    fetchReferrals();
  }, []);

  /**
   * Handles creating a new referral via a POST request.
   * @param {Event} e - The form submission event.
   */
  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!newReferral.amount || !newReferral.expiryDate) {
      displayError('Please enter both amount and expiry date.');
      return;
    }
    try {
      await axiosInstance.post(`/referral/generate`, {
        amount: parseFloat(newReferral.amount),
        expiryDate: newReferral.expiryDate,
      });
      setNewReferral({ amount: "", expiryDate: "" });
      fetchReferrals(); // Refresh the list after a successful creation
    } catch (err) {
      console.error('Failed to create referral:', err);
      displayError('Failed to create referral. Please check your input and try again.');
    }
  };

  /**
   * Handles starting the edit process for a specific referral.
   * @param {Object} referral - The referral object to edit.
   */
  const handleEditStart = (referral) => {
    setEditingId(referral.id);
    setEditData({
      amount: referral.amount,
      expiryDate: referral.expiryDate.toISOString().split('T')[0],
    });
  };

  /**
   * Handles saving the edited referral via a PUT request.
   */
  const handleEditSave = async () => {
    if (!editData.amount || !editData.expiryDate) {
      displayError('Please enter both amount and expiry date for the update.');
      return;
    }
    try {
      await axiosInstance.put(`/referral/${editingId}`, {
        amount: parseFloat(editData.amount),
        expiryDate: editData.expiryDate,
      });
      setEditingId(null);
      setEditData({});
      fetchReferrals(); // Refresh the list after a successful update
    } catch (err) {
      console.error('Failed to update referral:', err);
      displayError('Failed to update referral. The ID might not exist on the server.');
    }
  };

  /**
   * Cancels the editing process.
   */
  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  /**
   * Handles deleting a referral via a DELETE request.
   * @param {number} id - The ID of the referral to delete.
   */
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/referral/${id}`);
      fetchReferrals(); // Refresh the list after a successful deletion
    } catch (err) {
      console.error('Failed to delete referral:', err);
      displayError('Failed to delete referral. The ID might not exist on the server.');
    }
  };

  // Helper function to format the date
  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB");
  };

  // Stat Card component for displaying key metrics
  const StatCard = ({ title, value, bgColor, textColor }) => (
    <div className={`${bgColor} rounded-lg p-6 text-center`}>
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
    </div>
  );

  // Referral Card component for displaying individual referral details
  const ReferralCard = ({ referral }) => {
    const isEditing = editingId === referral.id;
    const isExpired = referral.status === "expired";

    if (isEditing) {
      return (
        <div className="bg-white rounded-lg border p-4 h-full">
          <div className="flex items-center mb-4">
            <div className={`w-2 h-2 rounded-full mr-2 ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <h3 className="font-medium">Editing: {referral.name || `ID: ${referral.id}`}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Diamonds</label>
              <div className="relative">
                <div className="absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-gray-400">💎</div>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Expiry Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={editData.expiryDate}
                  onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleEditSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border p-4 h-full relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <h3 className="font-medium">{referral.name || `Referral Code: ${referral.referralCode}`}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleEditStart(referral)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(referral.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              Amount
            </div>
            <div className="text-xl font-bold">₹{referral.amount}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              Expiry Date
            </div>
            <div className="flex items-center gap-2">
              <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
                {formatDate(referral.expiryDate)}
              </span>
              {isExpired && (
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                  Expired
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate stats based on the fetched data
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter((r) => r.status === "active").length;
  const expiredReferrals = referrals.filter((r) => r.status === "expired").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {showErrorModal && <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />}
      <div className="max-w-7xl mx-auto">
        {/* Referral System Header */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Referral System</h3>
                <p className="text-sm text-gray-500">Manage your referral campaigns</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-green-600 font-medium">System Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Create New Referral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center mb-6">
                <Plus className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Create New Referral</h2>
              </div>

              <form onSubmit={handleCreateReferral} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm text-gray-500 mb-1">Amount</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/3 transform -translate-y-1/2 w-4 h-4 text-gray-400">₹</div>
                    <input
                      id="amount"
                      type="number"
                      value={newReferral.amount}
                      onChange={(e) => setNewReferral({ ...newReferral, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm text-gray-500 mb-1">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="expiryDate"
                      type="date"
                      value={newReferral.expiryDate}
                      onChange={(e) => setNewReferral({ ...newReferral, expiryDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newReferral.amount || !newReferral.expiryDate}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Referral
                </button>
              </form>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">All Referrals ({totalReferrals})</h1>
              <button onClick={fetchReferrals} className="flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard 
                title="Total Referrals" 
                value={totalReferrals} 
                bgColor="bg-blue-100" 
                textColor="text-blue-600" 
              />
              <StatCard 
                title="Active Referrals" 
                value={activeReferrals} 
                bgColor="bg-green-100" 
                textColor="text-green-600" 
              />
              <StatCard 
                title="Expired Referrals" 
                value={expiredReferrals} 
                bgColor="bg-red-100" 
                textColor="text-red-600" 
              />
            </div>

            {/* Loading or Error State */}
            {isLoading && (
              <div className="text-center py-10 text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                Fetching referrals...
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center py-10 text-red-500">
                <XCircle className="w-8 h-8 mx-auto mb-3" />
                {error}
              </div>
            )}

            {/* Active Referrals */}
            {!isLoading && activeReferrals > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Active Referrals ({activeReferrals})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {referrals
                    .filter((ref) => ref.status === "active")
                    .map((referral) => (
                      <ReferralCard key={referral.id} referral={referral} />
                    ))}
                </div>
              </div>
            )}

            {/* Expired Referrals */}
            {!isLoading && expiredReferrals > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Expired Referrals ({expiredReferrals})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {referrals
                    .filter((ref) => ref.status === "expired")
                    .map((referral) => (
                      <ReferralCard key={referral.id} referral={referral} />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSystem;
