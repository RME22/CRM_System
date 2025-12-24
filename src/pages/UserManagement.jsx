import { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import { UserCog, Plus, Edit2, Trash2, Mail, Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'PROJECT_DEV'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const getRoleColor = (role) => {
    const colors = {
      C_LEVEL: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200',
      ADMIN: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
      PROJECT_DEV: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleLabel = (role) => {
    const labels = {
      C_LEVEL: 'C-Level',
      ADMIN: 'Admin',
      PROJECT_DEV: 'Project Developer'
    };
    return labels[role] || role;
  };

  const handleCreateUser = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'PROJECT_DEV'
    });
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement create user API call
      toast.success('User created successfully');
      setShowCreateModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement update user API call
      toast.success('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            User Management
          </h1>
          <p className="text-gray-600 text-lg">Manage system users and permissions</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="px-6 py-3 bg-gradient-primary hover:shadow-glow text-white rounded-lg transition-all duration-300 flex items-center space-x-2 font-semibold"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <UserCog size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              <Shield size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'C_LEVEL').length}
              </p>
              <p className="text-sm text-gray-600">C-Level</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
              <Shield size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
              <UserCog size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {users.filter(u => u.role === 'PROJECT_DEV').length}
              </p>
              <p className="text-sm text-gray-600">Developers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input w-full"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="C_LEVEL">C-Level</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_DEV">Project Developer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-large border border-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCog size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  className="input w-full"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                <select
                  className="input w-full"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="PROJECT_DEV">Project Developer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="C_LEVEL">C-Level</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300 font-semibold"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="input w-full"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  className="input w-full"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                <select
                  className="input w-full"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="PROJECT_DEV">Project Developer</option>
                  <option value="ADMIN">Admin</option>
                  <option value="C_LEVEL">C-Level</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300 font-semibold"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
