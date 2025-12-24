import { useState, useEffect } from 'react';
import { getBDPerformance, getWinRate, getSectorBreakdown, getRegionBreakdown } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, TrendingUp, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [bdPerformance, setBdPerformance] = useState(null);
  const [winRate, setWinRate] = useState(null);
  const [sectorBreakdown, setSectorBreakdown] = useState([]);
  const [regionBreakdown, setRegionBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [bdData, winData, sectorData, regionData] = await Promise.all([
        getBDPerformance(),
        getWinRate(),
        getSectorBreakdown(),
        getRegionBreakdown()
      ]);
      console.log('Reports data loaded:', { bdData, winData, sectorData, regionData });
      setBdPerformance(bdData || {});
      setWinRate(winData || {});
      setSectorBreakdown(sectorData || []);
      setRegionBreakdown(regionData || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports data');
      // Set default empty data
      setBdPerformance({});
      setWinRate({});
      setSectorBreakdown([]);
      setRegionBreakdown([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Development Reports</h1>
          <p className="text-gray-600 mt-1">Analyze BD performance and trends</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Download size={20} />
          <span>Export Reports</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Projects</p>
            <FileText size={20} className="text-primary-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{bdPerformance?.totalProjects || 0}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Activities</p>
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{bdPerformance?.totalPursuits || 0}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Win Rate</p>
            <Award size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{winRate?.winRate || 0}%</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Go Score</p>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{bdPerformance?.averageGoScore || 0}/100</p>
        </div>
      </div>

      {/* Win Rate Analysis */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-6">Win Rate Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{winRate?.total || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Total Decisions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{winRate?.won || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Won</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{winRate?.lost || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Lost</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{winRate?.pending || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
        </div>

        {winRate && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Won', value: winRate.won },
                  { name: 'Lost', value: winRate.lost },
                  { name: 'Pending', value: winRate.pending }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
                <Cell fill="#f59e0b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Sector Breakdown</h2>
          {sectorBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0ea5e9" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                {sectorBreakdown.map((sector, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{sector.sector}</span>
                    <span className="font-medium">{sector.count} projects</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Region Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Region Breakdown</h2>
          {regionBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Projects" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-2">
                {regionBreakdown.map((region, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{region.region}</span>
                    <span className="font-medium">{region.count} projects</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Go/No-Go Decisions */}
      {bdPerformance?.goDecisions && (
        <div className="card mt-8">
          <h2 className="text-xl font-semibold mb-6">Go/No-Go Decisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {bdPerformance.goDecisions.GO || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Go</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">
                {bdPerformance.goDecisions.CONDITIONAL_GO || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Conditional Go</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">
                {bdPerformance.goDecisions.NO_GO || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">No-Go</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-600">
                {bdPerformance.goDecisions.PENDING || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
