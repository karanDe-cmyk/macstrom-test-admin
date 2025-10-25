import React, { useState } from 'react';
import { DollarSign, TrendingDown, TrendingUp, RefreshCcw, Crown,} from 'lucide-react';

import { profitAndLossData } from '../data/users'; 

const PLOverview = () => {
  const [selectedRange, setSelectedRange] = useState('Today');
  const data = profitAndLossData[selectedRange];

  return (
    <div className="p-6 bg-gray-50 text-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl"><Crown className="text-purple-800 w-6 h-6" /> </span> Super Admin Panel
          </h1>
          <p className="text-sm text-gray-500">
            Deep system oversight and administrative controls
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100">
            <RefreshCcw size={14} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Profit & Loss Overview */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-md font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Profit & Loss Overview
          </h2>


          <select
            className="border rounded px-2 py-1 text-sm"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            {Object.keys(profitAndLossData).map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Data source: <code>materialized view pl_summary_daily</code>
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="bg-green-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
            <DollarSign className="text-green-600 mb-2" />
            <p className="text-sm text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-green-900">
              ${data.revenue.toLocaleString()}
            </h3>
            <p className="text-xs text-green-600 mt-1">📈 {data.revenueChange}</p>
          </div>

          {/* Costs */}
          <div className="bg-red-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
            <TrendingDown className="text-red-600 mb-2" />
            <p className="text-sm text-gray-500">Total Costs</p>
            <h3 className="text-2xl font-bold text-red-900">
              ${data.costs.toLocaleString()}
            </h3>
            <p className="text-xs text-red-600 mt-1">📉 {data.costsChange}</p>
          </div>

          {/* Profit */}
          <div className="bg-purple-100 p-4 rounded shadow-sm flex flex-col items-center justify-center text-center">
            <TrendingUp className="text-purple-600 mb-2" />
            <p className="text-sm text-gray-500">Net Profit</p>
            <h3 className="text-2xl font-bold text-purple-900">
              ${data.profit.toLocaleString()}
            </h3>
            <p className="text-xs text-purple-600 mt-1">{data.margin} margin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PLOverview;

