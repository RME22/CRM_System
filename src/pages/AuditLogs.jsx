import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    userId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.entityType) queryParams.append('entityType', filters.entityType);
      if (filters.userId) queryParams.append('userId', filters.userId);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await axios.get(`${API_URL}/api/audit-logs?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLogs(response.data.data);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch audit logs');
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axios.get(`${API_URL}/api/audit-logs/stats?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      entityType: '',
      userId: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800 border-green-300',
      UPDATE: 'bg-blue-100 text-blue-800 border-blue-300',
      DELETE: 'bg-red-100 text-red-800 border-red-300',
      LOGIN: 'bg-purple-100 text-purple-800 border-purple-300',
      LOGOUT: 'bg-gray-100 text-gray-800 border-gray-300',
      UPLOAD: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      DOWNLOAD: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      APPROVE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      REJECT: 'bg-orange-100 text-orange-800 border-orange-300',
      ASSIGN: 'bg-pink-100 text-pink-800 border-pink-300',
      COMPLETE: 'bg-teal-100 text-teal-800 border-teal-300'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      USER: '👤',
      PROJECT: '📁',
      PURSUIT: '🎯',
      STAKEHOLDER: '🤝',
      ENGAGEMENT: '💬',
      DOCUMENT: '📄',
      MILESTONE: '🎯',
      EVENT: '📅',
      G0_ASSESSMENT: '✅'
    };
    return icons[entityType] || '📋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Audit Logs
            </h1>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-soft"
            >
              ← Back to Home
            </button>
          </div>
          <p className="text-gray-600">Complete system activity tracking and monitoring</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-medium border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-1">
                    {stats.totalLogs.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Action Types</p>
                  <p className="text-3xl font-bold bg-gradient-ocean bg-clip-text text-transparent mt-1">
                    {stats.actionStats.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-ocean rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-medium border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entity Types</p>
                  <p className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mt-1">
                    {stats.entityStats.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-sunset rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-medium border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="UPLOAD">Upload</option>
                <option value="APPROVE">Approve</option>
                <option value="ASSIGN">Assign</option>
                <option value="COMPLETE">Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
              <select
                name="entityType"
                value={filters.entityType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="USER">User</option>
                <option value="PROJECT">Project</option>
                <option value="PURSUIT">Pursuit</option>
                <option value="STAKEHOLDER">Stakeholder</option>
                <option value="ENGAGEMENT">Engagement</option>
                <option value="DOCUMENT">Document</option>
                <option value="MILESTONE">Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl shadow-medium border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No audit logs found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.user?.firstName} {log.user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{log.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{getEntityIcon(log.entityType)}</span>
                          <span className="text-sm text-gray-900">{log.entityType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {log.newValue && (
                          <div className="max-w-xs truncate">
                            {typeof log.newValue === 'object' 
                              ? Object.entries(log.newValue).slice(0, 2).map(([key, value]) => 
                                  `${key}: ${value}`
                                ).join(', ')
                              : log.newValue
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
