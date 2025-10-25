import React from 'react';

export default function PrizeDistributionTable({ prizes }) {
  if (!prizes || prizes.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Prize Distribution</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prize Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prizes.map((prize, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {prize.rank.includes("-") ? (
                    <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium">
                      {prize.rank}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                      #{prize.rank}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {prize.percentage * 1}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-green-700">
                  ₹{prize.winning_amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
