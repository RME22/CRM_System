import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeamWorkload } from '../services/api';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamWorkload = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('by-user'); // 'by-user' or 'by-project'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getTeamWorkload();
      console.log('Team workload data:', data);
      setProjects(data.projects || []);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to load team workload:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.error || 'Failed to load team workload');
    } finally {
      setLoading(false);
    }
  };

  const getUserProjects = (userId) => {
    return projects.filter(p => p.ownerId === userId);
  };

  const getUserActivities = (userId) => {
    return projects.flatMap(p => 
      p.pursuits.filter(pursuit => pursuit.ownerId === userId)
    );
  };

  const getProjectClient = (project) => {
    return project.stakeholders[0]?.stakeholder?.name || 'No client assigned';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Workload</h1>
          <p className="text-gray-600">Overview of team members and their assigned projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('by-user')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'by-user'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            By Team Member
          </button>
          <button
            onClick={() => setViewMode('by-project')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'by-project'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Briefcase size={18} className="inline mr-2" />
            By Project
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="text-primary-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <Briefcase className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Activities</p>
              <p className="text-3xl font-bold text-gray-900">
                {projects.reduce((sum, p) => sum + p.pursuits.length, 0)}
              </p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Projects/Person</p>
              <p className="text-3xl font-bold text-gray-900">
                {users.length > 0 ? (projects.length / users.length).toFixed(1) : 0}
              </p>
            </div>
            <Building2 className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* By Team Member View */}
      {viewMode === 'by-user' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Team Members & Their Projects</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workload
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userProjects = getUserProjects(user.id);
                  const userActivities = getUserActivities(user.id);
                  const totalWorkload = userProjects.length + userActivities.length;
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-info">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {userProjects.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {userActivities.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  totalWorkload >= 5 ? 'bg-red-600' :
                                  totalWorkload >= 3 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min((totalWorkload / 10) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600">{totalWorkload}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {selectedUser?.id === user.id ? 'Hide' : 'View'} Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* User Details Panel */}
          {selectedUser && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4">
                {selectedUser.firstName} {selectedUser.lastName}'s Projects
              </h3>
              <div className="space-y-3">
                {getUserProjects(selectedUser.id).map((project) => (
                  <div key={project.id} className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link 
                          to={`/projects/${project.id}`}
                          className="font-medium text-primary-600 hover:text-primary-800"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Client: {getProjectClient(project)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="badge badge-info text-xs">{project.stage}</span>
                          <span className="badge badge-success text-xs">{project.status}</span>
                        </div>
                      </div>
                      {project.contractValue && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${project.contractValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{project.currency}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {getUserProjects(selectedUser.id).length === 0 && (
                  <p className="text-sm text-gray-500">No projects assigned</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* By Project View */}
      {viewMode === 'by-project' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Projects & Team Assignments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link 
                        to={`/projects/${project.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getProjectClient(project)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                          {project.owner.firstName[0]}{project.owner.lastName[0]}
                        </div>
                        <span className="ml-2 text-sm text-gray-900">
                          {project.owner.firstName} {project.owner.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-info text-xs">{project.stage}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.contractValue ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            ${project.contractValue.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">{project.currency}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        to={`/projects/${project.id}`}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkload;
