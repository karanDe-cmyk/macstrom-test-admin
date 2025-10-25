import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function SpinRewardRules() {
  const [rules, setRules] = useState([]);
  const [spinsNeeded, setSpinsNeeded] = useState('');
  const [rewardType, setRewardType] = useState('Diamonds');
  const [reward, setReward] = useState('');

  const addRule = () => {
    if (spinsNeeded && reward) {
      const newRule = {
        id: Date.now(),
        spinsNeeded: parseInt(spinsNeeded),
        rewardType,
        reward
      };
      setRules([...rules, newRule]);
      setSpinsNeeded('');
      setReward('');
    }
  };

  const deleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="w-[95%] mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
            Spin Reward Rules
          </h1>
          <p className="text-blue-600 text-sm sm:text-base">
            Configure rewards based on the number of spins
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Spins Needed Input */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Spins Needed
              </label>
              <input
                type="number"
                value={spinsNeeded}
                onChange={(e) => setSpinsNeeded(e.target.value)}
                placeholder="e.g., 50"
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                min="1"
              />
            </div>

            {/* Reward Type Dropdown */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Reward Type
              </label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
              >
                <option value="Diamonds">Diamonds</option>
                <option value="Bundle">Bundle</option>
              </select>
            </div>

            {/* Reward Input */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Reward
              </label>
              <input
                type="text"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder={rewardType === 'Diamonds' ? '100' : 'Bundle Name'}
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Add Button */}
            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={addRule}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <Plus size={20} />
                Add Rule
              </button>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Active Rules ({rules.length})
          </h2>
          
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-300 mb-3">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-blue-400 text-lg">No rules added yet</p>
              <p className="text-blue-300 text-sm mt-1">Add your first spin reward rule above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-medium text-blue-600 block mb-1">
                        Spins Needed
                      </span>
                      <span className="text-lg font-bold text-blue-900">
                        {rule.spinsNeeded}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-600 block mb-1">
                        Type
                      </span>
                      <span className="text-lg font-semibold text-blue-800">
                        {rule.rewardType}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-600 block mb-1">
                        Reward
                      </span>
                      <span className="text-lg font-semibold text-blue-800">
                        {rule.reward}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors self-end sm:self-center"
                    title="Delete rule"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}