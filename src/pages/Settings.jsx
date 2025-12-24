import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../services/api';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateProfile({ firstName, lastName });
      await refreshUser(); // Refresh user data in context
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'security'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock size={20} />
              <span>Security</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'permissions'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={20} />
              <span>Permissions</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="card lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">First Name</label>
                    <input
                      type="text"
                      className="input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input
                      type="text"
                      className="input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    defaultValue={user?.email}
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Contact admin to change email address
                  </p>
                </div>

                <div>
                  <label className="label">Role</label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={user?.role}
                    disabled
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="label">Current Password</label>
                  <input 
                    type="password" 
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label">New Password</label>
                  <input 
                    type="password" 
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">At least 6 characters</p>
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Go/No-Go Decisions</p>
                    <p className="text-sm text-gray-600">Notify when decisions are pending</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Activity Updates</p>
                    <p className="text-sm text-gray-600">Get notified on activity status changes</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Meeting Reminders</p>
                    <p className="text-sm text-gray-600">Reminders for upcoming events</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Your Permissions</h2>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Role: {user?.role}</p>
                  <div className="space-y-2 text-sm">
                    {user?.role === 'C_LEVEL' && (
                      <>
                        <p className="text-green-600">✓ View all projects and activities</p>
                        <p className="text-green-600">✓ Make Go/No-Go decisions</p>
                        <p className="text-green-600">✓ Access analytics and reports</p>
                        <p className="text-green-600">✓ View financial information</p>
                      </>
                    )}
                    {user?.role === 'PROJECT_DEV' && (
                      <>
                        <p className="text-green-600">✓ Create and edit projects</p>
                        <p className="text-green-600">✓ Manage activities</p>
                        <p className="text-green-600">✓ Add stakeholders</p>
                        <p className="text-green-600">✓ Upload documents</p>
                        <p className="text-gray-400">✗ Make Go/No-Go decisions</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Contact your administrator to request additional permissions or role changes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
