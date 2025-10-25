import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Coins, Calendar, User, Eye } from 'lucide-react';

const WalletTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: 50, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data for demonstration (replace with actual API call)
  const sampleData = {
    success: true,
    meta: { page: 1, limit: 20, total: 12 },
    data: [
      {
        id: 4567,
        userId: 123,
        reason: "reward_complete",
        adId: 13,
        adViewId: "view_abc123",
        amount: 10,
        balanceAfter: 320,
        meta: null,
        createdAt: "2025-09-26T10:15:22.000Z",
        updatedAt: "2025-09-26T10:15:22.000Z"
      },
      {
        id: 4568,
        userId: 123,
        reason: "ad_bonus",
        adId: 14,
        adViewId: "view_def456",
        amount: 5,
        balanceAfter: 325,
        meta: { device: "mobile", version: "1.2.0" },
        createdAt: "2025-09-26T11:20:15.000Z",
        updatedAt: "2025-09-26T11:20:15.000Z"
      },
      {
        id: 4569,
        userId: 123,
        reason: "purchase_debit",
        adId: null,
        adViewId: null,
        amount: -15,
        balanceAfter: 310,
        meta: { item: "premium_feature" },
        createdAt: "2025-09-26T12:05:30.000Z",
        updatedAt: "2025-09-26T12:05:30.000Z"
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Replace this with actual API call
        // const response = await fetch(`https://macstormbattle-backend2.onrender.com/api/admin/wallet/ads/3/transactions?page=${currentPage}&limit=20`);
        // const data = await response.json();
        
        // Using sample data for demonstration
        setTimeout(() => {
          setTransactions(sampleData.data);
          setMeta(sampleData.meta);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonColor = (reason) => {
    const colors = {
      reward_complete: 'bg-green-100 text-green-800',
      ad_bonus: 'bg-blue-100 text-blue-800',
      purchase_debit: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };
    return colors[reason] || colors.default;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      reward_complete: 'Reward Complete',
      ad_bonus: 'Ad Bonus',
      purchase_debit: 'Purchase Debit',
      default: reason
    };
    return labels[reason] || labels.default;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toString().includes(searchTerm);
    const matchesFilter = filterReason === 'all' || transaction.reason === filterReason;
    return matchesSearch && matchesFilter;
  });

  const reasons = [...new Set(transactions.map(t => t.reason))];

  if (loading) {
    return (
      <div className="w-full max-w-[97%] mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[97%] mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[97%] mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Wallet Transactions</h1>
        <p className="text-gray-600">Ad ID: 3 • Total: {meta.total} transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Reasons</option>
                {reasons.map(reason => (
                  <option key={reason} value={reason}>
                    {getReasonLabel(reason)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-600">There are no transactions matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance After</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{transaction.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(transaction.reason)}`}>
                          {getReasonLabel(transaction.reason)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.balanceAfter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.adId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{transaction.id}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getReasonColor(transaction.reason)}`}>
                      {getReasonLabel(transaction.reason)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                    </p>
                    <p className="text-sm text-gray-500">Balance: {transaction.balanceAfter}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    User: {transaction.userId}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Eye className="w-4 h-4 mr-1" />
                    Ad: {transaction.adId || 'N/A'}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta.total > meta.limit && (
            <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex items-center text-sm text-gray-700">
                Showing {((currentPage - 1) * meta.limit) + 1} to {Math.min(currentPage * meta.limit, meta.total)} of {meta.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 py-1 text-sm font-medium">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * meta.limit >= meta.total}
                  className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WalletTransactions;