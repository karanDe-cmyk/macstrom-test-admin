import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Power, PowerOff, AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axios';

// const API_BASE_URL = 'https://mactromtest-backend.onrender.com/api/payment-gateway-status';
// ✅ Fetch all gateways
export const fetchGatewaysApi = async () => {
  const { data } = await axiosInstance.get("/get-status");
  return data;
};

// ✅ Toggle gateway status
export const toggleGatewayStatusApi = async (gatewayName, status) => {
  const { data } = await axiosInstance.post("/set-status", {
    gatewayName,
    status,
  });
  return data;
};

// ✅ Delete a gateway
export const deleteGatewayApi = async (gatewayName) => {
  const { data } = await axiosInstance.delete("/delete", {
    data: { gatewayName },
  });
  return data;
};

// ✅ Add a new gateway
export const addGatewayApi = async (newGateway) => {
  const { data } = await axiosInstance.post("/set-status", newGateway);
  return data;
};


export default function PaymentGatewayManager() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGateway, setNewGateway] = useState({ gatewayName: '', status: true });

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  };

  const fetchGateways = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchGatewaysApi();
      if (data.success) {
        setGateways(data.gateways);
      } else {
        setError("Failed to fetch gateways");
      }
    } catch (err) {
      setError("Error fetching gateways: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (gatewayName, currentStatus) => {
    setError("");
    setSuccess("");
    try {
      await toggleGatewayStatusApi(gatewayName, !currentStatus);
      setSuccess(`${gatewayName} status updated successfully`);
      await fetchGateways();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error updating status: " + err.message);
    }
  };

  const deleteGateway = async (gatewayName) => {
    if (!window.confirm(`Are you sure you want to delete ${gatewayName}?`)) return;

    setError("");
    setSuccess("");
    try {
      await deleteGatewayApi(gatewayName);
      setSuccess(`${gatewayName} deleted successfully`);
      await fetchGateways();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error deleting gateway: " + err.message);
    }
  };

  const addGateway = async () => {
    setError("");
    setSuccess("");

    if (!newGateway.gatewayName.trim()) {
      setError("Gateway name is required");
      return;
    }

    try {
      await addGatewayApi(newGateway);
      setSuccess("Gateway added successfully");
      setNewGateway({ gatewayName: "", status: true });
      setShowAddForm(false);
      await fetchGateways();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error adding gateway: " + err.message);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Payment Gateway Manager</h1>
              <p className="text-blue-700">Manage and monitor payment gateway statuses</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchGateways}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Gateway
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-900 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-900 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Add New Gateway</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Gateway Name (e.g., paypal, stripe)"
                value={newGateway.gatewayName}
                onChange={(e) => setNewGateway({ ...newGateway, gatewayName: e.target.value })}
                className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-2 text-blue-900 placeholder-blue-400"
              />
              <select
                value={newGateway.status}
                onChange={(e) => setNewGateway({ ...newGateway, status: e.target.value === 'true' })}
                className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-blue-900"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <button
                onClick={addGateway}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-blue-900 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && gateways.length === 0 ? (
            <div className="col-span-full text-center text-blue-900 py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading gateways...
            </div>
          ) : gateways.length === 0 ? (
            <div className="col-span-full text-center text-blue-700 py-12">
              No payment gateways found. Add one to get started.
            </div>
          ) : (
            gateways.map((gateway) => (
              <div
                key={gateway.gatewayName}
                className="bg-white rounded-2xl p-6 border border-blue-200 hover:border-blue-400 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 capitalize mb-1">
                      {gateway.gatewayName}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Updated: {formatDate(gateway.lastUpdated)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${gateway.status ? 'bg-green-100' : 'bg-red-100'}`}>
                    {gateway.status ? (
                      <Power className="w-5 h-5 text-green-600" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${gateway.status
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                    {gateway.status ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(gateway.gatewayName, gateway.status)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${gateway.status
                        ? 'bg-blue-400 hover:bg-blue-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {gateway.status ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => deleteGateway(gateway.gatewayName)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
