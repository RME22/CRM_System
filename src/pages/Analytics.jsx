import { useState, useEffect } from 'react';
import { getDashboardMetrics, getRevenueForecast } from '../services/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, Award, AlertCircle } from 'lucide-react';

const Analytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastPeriod, setForecastPeriod] = useState(90);

  useEffect(() => {
    loadAnalytics();
  }, [forecastPeriod]);

  const loadAnalytics = async () => {
    try {
      const [metricsData, forecastData] = await Promise.all([
        getDashboardMetrics(),
        getRevenueForecast(forecastPeriod)
      ]);
      setMetrics(metricsData);
      setForecast(forecastData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const forecastData = forecast ? [
    { period: '30 Days', value: forecast.forecasts.next30Days },
    { period: '60 Days', value: forecast.forecasts.next60Days },
    { period: '90 Days', value: forecast.forecasts.next90Days }
  ] : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600 mt-1">Data-driven insights and forecasts</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="input"
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(Number(e.target.value))}
          >
            <option value={30}>30 Days</option>
            <option value={60}>60 Days</option>
            <option value={90}>90 Days</option>
            <option value={180}>180 Days</option>
          </select>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Pipeline Value</p>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">
            ${(metrics?.totalPipelineValue || 0).toLocaleString()}
          </p>
          <p className="text-sm opacity-90 mt-2">Active opportunities</p>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Win Rate</p>
            <Award size={24} />
          </div>
          <p className="text-3xl font-bold">
            {forecast?.pursuitCount > 0 
              ? Math.round((metrics?.recentWins / forecast.pursuitCount) * 100)
              : 0}%
          </p>
          <p className="text-sm opacity-90 mt-2">Success probability</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Avg Go Score</p>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">{metrics?.averageGoScore || 0}</p>
          <p className="text-sm opacity-90 mt-2">Out of 100</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">High Risk</p>
            <AlertCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{metrics?.highRiskPursuits || 0}</p>
          <p className="text-sm opacity-90 mt-2">Pursuits need attention</p>
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Revenue Forecast</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Risk-Adjusted Pipeline</p>
            <p className="text-2xl font-bold text-primary-600">
              ${(forecast?.riskAdjustedValue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {forecastData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="value" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Next 30 Days</p>
            <p className="text-xl font-bold text-blue-600">
              ${(forecast?.forecasts.next30Days || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Next 60 Days</p>
            <p className="text-xl font-bold text-blue-600">
              ${(forecast?.forecasts.next60Days || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Next 90 Days</p>
            <p className="text-xl font-bold text-blue-600">
              ${(forecast?.forecasts.next90Days || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Key Opportunities */}
      {forecast?.breakdown && forecast.breakdown.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-6">Top Opportunities</h2>
          <div className="space-y-3">
            {forecast.breakdown.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.clientName}</h3>
                  <p className="text-sm text-gray-600">
                    Expected: {new Date(item.expectedDecisionDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ${item.contractValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Win Prob: {Math.round(item.winProbability * 100)}%
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.winProbability >= 0.7 ? 'bg-green-500' :
                        item.winProbability >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.winProbability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">BD Velocity</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Lead to Project Start</span>
                <span className="font-semibold">~90 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Go Evaluation Speed</span>
                <span className="font-semibold">~14 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Bid Preparation</span>
                <span className="font-semibold">~21 days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Risk Analysis</h2>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Low Risk</span>
                <span className="text-lg font-bold text-green-800">
                  {metrics?.activePursuits - (metrics?.highRiskPursuits || 0) || 0}
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-800">Medium Risk</span>
                <span className="text-lg font-bold text-yellow-800">0</span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-800">High Risk</span>
                <span className="text-lg font-bold text-red-800">
                  {metrics?.highRiskPursuits || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
