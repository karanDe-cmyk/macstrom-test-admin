// ActivityLog.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LogIn, 
  LogOut, 
  Edit, 
  Search, 
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axiosInstance from '../utils/axios';

const ActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  useEffect(() => {
    const fetchActivityLogs = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/auth/admin/activity-logs');
        // Make sure we're setting the data array from response
        setActivityLogs(response.data.data || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, []);

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="w-4 h-4" />;
      case 'FORCE_LOGOUT':
        return <LogOut className="w-4 h-4" />;
      case 'UPDATE_ADMIN':
        return <Edit className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'FORCE_LOGOUT':
        return 'bg-red-100 text-red-800';
      case 'UPDATE_ADMIN':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const parseUserAgent = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown Browser';
  };

  const filteredLogs = activityLogs.filter(log => {
    if (!log) return false;
    
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip?.includes(searchTerm) ||
      log.targetAdminId?.toString().includes(searchTerm);
    
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    
    const matchesDate = (!dateRange.start || new Date(log.createdAt) >= new Date(dateRange.start)) &&
                       (!dateRange.end || new Date(log.createdAt) <= new Date(dateRange.end));
    
    return matchesSearch && matchesAction && matchesDate;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
  <div className="max-w-7xl mx-auto p-6">
    {/* Header */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitor and track all administrator activities
        </p>
      </div>
    </div>

    {/* Filters */}
    <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search actions, IP, admin ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="FORCE_LOGOUT">Force Logout</option>
            <option value="UPDATE_ADMIN">Update Admin</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    {/* Activity Logs List */}
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No activity logs found
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {activityLogs.length === 0 ? 'No logs available.' : 'Try adjusting your search or filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
              {/* Main Log Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {log.action?.replace(/_/g, ' ') || 'Unknown Action'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Actor: Admin #{log.actorAdminId} • Target: Admin #{log.targetAdminId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(log.createdAt)} • {log.ip}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
                >
                  {expandedLogs.has(log.id) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedLogs.has(log.id) && (
                <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Metadata
                      </h4>
                      <pre className="p-3 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 overflow-x-auto">
                        {JSON.stringify(log.meta || {}, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Technical Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                          <span className="text-gray-800 dark:text-gray-200">{log.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Browser:</span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {parseUserAgent(log.userAgent)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {log.userAgent}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Timestamp:</span>
                          <span className="text-gray-800 dark:text-gray-200">{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default ActivityLog;