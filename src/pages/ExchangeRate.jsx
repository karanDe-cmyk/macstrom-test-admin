import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function ExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState('');
  const [status, setStatus] = useState('Active');
  const [savedRate, setSavedRate] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    if (exchangeRate) {
      setSavedRate({
        rate: exchangeRate,
        status: status,
        savedAt: new Date().toLocaleString()
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="w-[95%] mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                Exchange Rate
              </h1>
              <p className="text-blue-600 text-sm sm:text-base">
                Configure currency exchange rates
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg mb-6 shadow-md animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Exchange rate saved successfully!</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-6">
            {/* Exchange Rate Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Exchange Rate
              </label>
              <input
                type="text"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="500 Diamonds = 1000 Coins"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-base"
              />
              <p className="mt-2 text-sm text-blue-500">
                Example: "500 Diamonds = 1000 Coins"
              </p>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white text-base"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!exchangeRate}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md ${
                exchangeRate
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={20} />
              Save Exchange Rate
            </button>
          </div>
        </div>

        {/* Current Rate Display */}
        {savedRate && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              Current Exchange Rate
            </h2>
            <div className="bg-blue-50 rounded-lg p-5 border-2 border-blue-100">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-blue-600 block mb-1">
                    Rate
                  </span>
                  <span className="text-lg font-semibold text-blue-900">
                    {savedRate.rate}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">
                      Status
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      savedRate.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {savedRate.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">
                      Last Updated
                    </span>
                    <span className="text-sm text-blue-700">
                      {savedRate.savedAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}