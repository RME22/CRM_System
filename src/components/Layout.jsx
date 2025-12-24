import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  LayoutDashboard,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  ClipboardCheck,
  UserCog
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout, isCLevel } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home, roles: ['C_LEVEL', 'ADMIN'] },
    { name: 'Projects', href: '/projects', icon: LayoutDashboard, roles: ['all'] },
    { name: 'Clients', href: '/clients', icon: Users, roles: ['all'] },
    { name: 'Activities', href: '/activities', icon: Target, roles: ['all'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['all'] },
    { name: 'Pending Requests', href: '/pending-requests', icon: ClipboardCheck, roles: ['C_LEVEL', 'ADMIN'] },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp, roles: ['C_LEVEL', 'ADMIN'] },
    { name: 'Team Workload', href: '/team', icon: Users, roles: ['C_LEVEL', 'ADMIN'] },
    { name: 'User Management', href: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: FileText, roles: ['C_LEVEL', 'ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white/95 backdrop-blur-lg border-r border-gray-200/50 shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/50">
          {sidebarOpen && (
            <img src="https://rowad-rme.com/wp-content/uploads/Rowad-Logo.png" width="150" alt="Rowad Logo" className="mx-auto" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 transition-all duration-200"
          >
            {sidebarOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-700 shadow-sm font-semibold'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200/50 p-4">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.role}</p>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-lg transition-all duration-200"
              >
                <Settings size={18} />
                <span className="ml-3">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-200"
              >
                <LogOut size={18} />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center justify-center p-2 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 rounded-lg transition-all duration-200"
              >
                <Settings size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-200"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200"
            >
              <Search size={18} />
              <span className="text-gray-600">Search...</span>
              <span className="text-xs text-gray-400 ml-4">Ctrl+K</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 rounded-lg transition-all duration-200">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse-slow"></span>
            </button>
            
            {isCLevel() && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-semibold rounded-full shadow-sm border border-purple-200/50">
                C-Level
              </span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
};

export default Layout;
