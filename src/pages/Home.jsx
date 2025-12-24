import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardMetrics, getUpcomingEvents } from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Plus
} from 'lucide-react';

const Home = () => {
  const { user, isCLevel } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect PROJECT_DEV users to Projects page
  useEffect(() => {
    if (user?.role === 'PROJECT_DEV') {
      navigate('/projects');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [metricsData, eventsData] = await Promise.all([
        getDashboardMetrics(),
        getUpcomingEvents(7)
      ]);
      setMetrics(metricsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your business development today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/projects/create"
          className="card hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <Plus size={24} className="text-primary-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Project</h3>
              <p className="text-sm text-gray-600">Create project opportunity</p>
            </div>
          </div>
        </Link>

        <Link
          to="/activities"
          className="card hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <TrendingUp size={24} className="text-secondary-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Active Activities</h3>
              <p className="text-sm text-gray-600">{metrics?.activePursuits || 0} in progress</p>
            </div>
          </div>
        </Link>

        <Link
          to="/clients/create"
          className="card hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-success-100 to-success-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <Plus size={24} className="text-success-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Client</h3>
              <p className="text-sm text-gray-600">Manage relationships</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent mt-1">
                ${(metrics?.totalPipelineValue || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-success-100 to-success-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <DollarSign size={24} className="text-success-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="text-success-600 mr-1" />
            <span className="text-success-600 font-semibold">Active projects</span>
          </div>
        </div>

        <div className="card hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mt-1">
                {metrics?.activeProjects || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <TrendingUp size={24} className="text-primary-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 font-medium">
            {metrics?.totalProjects || 0} total projects
          </div>
        </div>

        <div className="card hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Decisions</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-warning-600 to-warning-700 bg-clip-text text-transparent mt-1">
                {metrics?.pendingGoDecisions || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-warning-100 to-warning-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <Clock size={24} className="text-warning-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 font-medium">
            Awaiting Go/No-Go review
          </div>
        </div>

        <div className="card hover:shadow-lg group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Wins</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent mt-1">
                {metrics?.recentWins || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-success-100 to-success-200 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <CheckCircle size={24} className="text-success-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 font-medium">
            Last 30 days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Go/No-Go Decision Panel */}
        {isCLevel() && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Go/No-Go Decisions</h2>
              <Link to="/projects?filter=pending-decision" className="text-primary-600 text-sm hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-warning-50 to-warning-100/50 rounded-xl border border-warning-200/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Clock size={20} className="text-warning-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pending Review</p>
                    <p className="text-sm text-gray-600">{metrics?.pendingGoDecisions || 0} projects</p>
                  </div>
                </div>
                <span className="badge badge-warning">Action Required</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-success-50 to-success-100/50 rounded-xl border border-success-200/50 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <CheckCircle size={20} className="text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Approved</p>
                    <p className="text-sm text-gray-600">Recent wins</p>
                  </div>
                </div>
                <span className="badge badge-success">{metrics?.recentWins || 0}</span>
              </div>

              {metrics?.highRiskPursuits > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-danger-50 to-danger-100/50 rounded-xl border border-danger-200/50 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <AlertTriangle size={20} className="text-danger-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">High Risk</p>
                      <p className="text-sm text-gray-600">{metrics.highRiskPursuits} pursuits</p>
                    </div>
                  </div>
                  <span className="badge badge-danger">Review</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link to="/events" className="text-primary-600 text-sm hover:underline">
              View All
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 rounded-lg transition-all cursor-pointer">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Calendar size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {event.priority === 'High' && (
                    <span className="badge badge-danger">High</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Indicators */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Performance Indicators</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Average Go Score</span>
                <span className="font-semibold">{metrics?.averageGoScore || 0}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner-soft">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    (metrics?.averageGoScore || 0) >= 70
                      ? 'bg-gradient-to-r from-success-500 to-success-600'
                      : (metrics?.averageGoScore || 0) >= 50
                      ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                      : 'bg-gradient-to-r from-danger-500 to-danger-600'
                  }`}
                  style={{ width: `${metrics?.averageGoScore || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Quick Stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.activePursuits || 0}</p>
                  <p className="text-xs text-gray-600">Active Pursuits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.upcomingEvents || 0}</p>
                  <p className="text-xs text-gray-600">This Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity / BD Updates */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">BD Updates</h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 hover:bg-gradient-to-r hover:from-success-50 hover:to-green-50 rounded-lg transition-all">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-success-500 to-success-600 rounded-full mt-2 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">New lead identified</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 rounded-lg transition-all">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mt-2 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pursuit status updated</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 hover:bg-gradient-to-r hover:from-warning-50 hover:to-yellow-50 rounded-lg transition-all">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-warning-500 to-warning-600 rounded-full mt-2 shadow-sm"></div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Client meeting scheduled</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
