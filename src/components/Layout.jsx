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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-cyan-50/40">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-xl transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/60">
          {sidebarOpen && (
            <img src="https://rowad-rme.com/wp-content/uploads/Rowad-Logo.png" width="150" alt="Rowad Logo" className="mx-auto transition-all duration-300" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-sky-50 transition-all duration-300 hover:shadow-soft transform hover:scale-105 active:scale-95"
          >
            {sidebarOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-soft shadow-primary-500/30 font-semibold'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-sky-50 hover:text-primary-700 hover:shadow-sm'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'} transition-colors duration-300`} />
                {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200/60 p-4">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2.5 mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold shadow-soft text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-600 truncate font-medium">{user?.role}</p>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 rounded-xl transition-all duration-300 group hover:shadow-sm"
              >
                <Settings size={18} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                <span className="ml-3 font-medium">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all duration-300 group hover:shadow-sm"
              >
                <LogOut size={18} className="text-gray-500 group-hover:text-danger-600 transition-colors" />
                <span className="ml-3 font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/settings"
                className="flex items-center justify-center p-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 rounded-xl transition-all duration-300 hover:shadow-sm transform hover:scale-105"
              >
                <Settings size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-all duration-300 hover:shadow-sm transform hover:scale-105"
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
        <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-3 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:shadow-soft transition-all duration-300 group"
            >
              <Search size={18} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
              <span className="text-gray-600 font-medium">Search...</span>
              <span className="text-xs text-gray-400 ml-4 px-2 py-1 bg-gray-100 rounded font-semibold">Ctrl+K</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2.5 text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-sky-50 rounded-xl transition-all duration-300 hover:shadow-soft transform hover:scale-105">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-danger-500 to-rose-500 rounded-full animate-pulse-slow shadow-sm"></span>
            </button>

            {isCLevel() && (
              <span className="px-4 py-1.5 bg-gradient-to-r from-primary-100 to-sky-100 text-primary-800 text-xs font-bold rounded-full shadow-sm border border-primary-200/60">
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
