import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';

export default function UserRedemptionLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const redemptionData = [
    {
      id: 1,
      userId: '101',
      reward: 'Diamonds',
      quantity: '100',
      date: '02-Oct-2025',
      status: 'Success'
    },
    {
      id: 2,
      userId: '102',
      reward: 'Bundle',
      quantity: 'Outfit',
      date: '02-Oct-2025',
      status: 'Pending'
    },
    {
      id: 3,
      userId: '103',
      reward: 'Diamonds',
      quantity: '250',
      date: '03-Oct-2025',
      status: 'Success'
    },
    {
      id: 4,
      userId: '104',
      reward: 'Bundle',
      quantity: 'Weapon Skin',
      date: '03-Oct-2025',
      status: 'Failed'
    },
    {
      id: 5,
      userId: '105',
      reward: 'Diamonds',
      quantity: '500',
      date: '04-Oct-2025',
      status: 'Success'
    },
    {
      id: 6,
      userId: '106',
      reward: 'Bundle',
      quantity: 'Premium Pass',
      date: '04-Oct-2025',
      status: 'Pending'
    }
  ];

  const filteredData = redemptionData.filter(item =>
    item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reward.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.quantity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[95%] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                User Redemption Logs
              </h1>
              <p className="text-blue-600 text-sm sm:text-base">
                Track all user reward redemptions
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by User ID, Reward, Quantity, or Status..."
              className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Reward</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 text-blue-900 font-semibold">{item.userId}</td>
                      <td className="px-6 py-4 text-blue-800">{item.reward}</td>
                      <td className="px-6 py-4 text-blue-800">{item.quantity}</td>
                      <td className="px-6 py-4 text-blue-700">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-blue-400">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-blue-100">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div key={item.id} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-blue-600 block mb-1">User ID</span>
                        <span className="text-lg font-bold text-blue-900">{item.userId}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-medium text-blue-600 block mb-1">Reward</span>
                        <span className="text-sm font-semibold text-blue-800">{item.reward}</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-600 block mb-1">Quantity</span>
                        <span className="text-sm font-semibold text-blue-800">{item.quantity}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-600 block mb-1">Date</span>
                      <span className="text-sm text-blue-700">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-blue-400">
                No results found
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="bg-blue-50 px-6 py-4 border-t-2 border-blue-100">
            <p className="text-sm text-blue-700">
              Showing <span className="font-semibold">{filteredData.length}</span> of <span className="font-semibold">{redemptionData.length}</span> records
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}