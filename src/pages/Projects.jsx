import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, reassignProjectOwner, getUsers } from '../services/api';
import { Search, Filter, Plus, TrendingUp, CheckCircle, XCircle, AlertCircle, Edit2, FolderOpen, UserCheck } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const stages = [
  'LEAD_IDENTIFIED',
  'GO_EVALUATION',
  'BID_SUBMITTED', 
  'CONTRACT_SUBMITTED',
  'PROJECT_START_DATE_SET',
  'IN_PROGRESS',
  'COMPLETED'
];

const stageLabels = {
  LEAD_IDENTIFIED: 'Lead Identified',
  GO_EVALUATION: 'Go Evaluation',
  BID_SUBMITTED: 'Bid Submitted',
  CONTRACT_SUBMITTED: 'Contract Submitted',
  PROJECT_START_DATE_SET: 'Project Start',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed'
};

const ProjectLifecycle = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newOwnerId, setNewOwnerId] = useState('');

  useEffect(() => {
    loadProjects();
    if (user?.role === 'C_LEVEL') {
      loadUsers();
    }
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedStage, selectedStatus, minValue, maxValue]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setAvailableUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const openReassignModal = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProject(project);
    setNewOwnerId('');
    setShowReassignModal(true);
  };

  const handleReassignOwner = async (e) => {
    e.preventDefault();
    try {
      await reassignProjectOwner(selectedProject.id, newOwnerId);
      toast.success('Project owner reassigned successfully');
      setShowReassignModal(false);
      setSelectedProject(null);
      setNewOwnerId('');
      loadProjects();
    } catch (error) {
      console.error('Failed to reassign owner:', error);
      toast.error('Failed to reassign project owner');
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStage) {
      filtered = filtered.filter(p => p.stage === selectedStage);
    }

    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (minValue) {
      filtered = filtered.filter(p => p.contractValue && p.contractValue >= parseFloat(minValue));
    }

    if (maxValue) {
      filtered = filtered.filter(p => p.contractValue && p.contractValue <= parseFloat(maxValue));
    }

    setFilteredProjects(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 border border-green-200',
      ON_HOLD: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-yellow-800 border border-yellow-200',
      CANCELLED: 'bg-gradient-to-r from-rose-100 to-red-100 text-red-800 border border-red-200',
      COMPLETED: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200';
  };

  const getGoScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getG0DecisionBadge = (decision) => {
    switch(decision) {
      case 'GO':
        return (
          <span className="badge badge-success flex items-center space-x-1 w-fit">
            <CheckCircle size={14} />
            <span>GO</span>
          </span>
        );
      case 'CONDITIONAL_GO':
        return (
          <span className="badge badge-warning flex items-center space-x-1 w-fit">
            <AlertCircle size={14} />
            <span>CONDITIONAL</span>
          </span>
        );
      case 'NO_GO':
        return (
          <span className="badge badge-error flex items-center space-x-1 w-fit">
            <XCircle size={14} />
            <span>NO-GO</span>
          </span>
        );
      case 'PENDING':
        return <span className="badge badge-gray text-xs">Pending Review</span>;
      default:
        return null;
    }
  };

  const getG0StatusBadge = (status) => {
    const badges = {
      DRAFT: 'badge-gray',
      SUBMITTED: 'badge-info',
      UNDER_REVIEW: 'badge-warning',
      APPROVED: 'badge-success',
      CONDITIONAL: 'badge-warning',
      REJECTED: 'badge-error'
    };
    return status ? <span className={`badge ${badges[status]} text-xs`}>{status}</span> : null;
  };

  const getG0AssessmentBackground = (g0Assessment) => {
    if (!g0Assessment || !g0Assessment.status || g0Assessment.status === 'DRAFT') {
      return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
    
    if (g0Assessment.totalScore !== null && g0Assessment.maxScore) {
      const score = (g0Assessment.totalScore / g0Assessment.maxScore) * 3;
      
      if (score > 2.5) {
        return 'bg-gradient-to-br from-emerald-50 to-green-100';
      } else if (score >= 1.8 && score <= 2.5) {
        return 'bg-gradient-to-br from-amber-50 to-yellow-100';
      } else if (score < 1.8) {
        return 'bg-gradient-to-br from-rose-50 to-red-100';
      }
    }
    
    return 'bg-gradient-to-br from-gray-100 to-gray-200';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto animate-fade-in">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="card mb-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Projects</h1>
          <p className="text-gray-600 mt-2">Track and manage all your projects</p>
        </div>
        <Link to="/projects/create" className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300 flex items-center space-x-2 font-semibold">
          <Plus size={20} />
          <span>Add Project</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stageLabels[stage]}</option>
            ))}
          </select>

          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedStage('');
              setSelectedStatus('');
              setMinValue('');
              setMaxValue('');
            }}
            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:shadow-soft transition-all duration-200 flex items-center justify-center space-x-2 font-medium border border-gray-300"
          >
            <Filter size={20} />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* Value Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Min Value</label>
            <input
              type="number"
              placeholder="Minimum contract value..."
              className="input w-full"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Max Value</label>
            <input
              type="number"
              placeholder="Maximum contract value..."
              className="input w-full"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={searchTerm || selectedStage || selectedStatus ? 'No projects match your filters' : 'No projects yet'}
          description={searchTerm || selectedStage || selectedStatus ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Get started by creating your first project and track it through its lifecycle.'}
          actionLabel="Create Project"
          actionLink="/projects/create"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <div 
              key={project.id} 
              className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium hover:shadow-large border border-gray-200/50 p-6 transition-all duration-300 relative animate-slide-in-up hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Edit Button */}
              <div className="absolute top-4 right-4 z-10">
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 rounded-lg transition-all duration-200 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 size={18} />
                </Link>
              </div>

              {/* Card Content - Clickable */}
              <Link to={`/projects/${project.id}`} className="block">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 pr-12">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{project.sector}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 shrink-0 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Region</span>
                  <span className="font-semibold text-gray-900">{project.region}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Stage</span>
                  <span className="font-semibold text-gray-900 px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full text-xs">{stageLabels[project.stage]}</span>
                </div>
                {project.contractValue && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Value</span>
                    <span className="font-bold text-primary-600">
                      {project.currency} {project.contractValue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* G0 Assessment */}
              {project.g0Assessment ? (
                <div className={`pt-4 border-t space-y-2 -mx-6 -mb-6 px-6 pb-6 mt-4 rounded-b-lg ${getG0AssessmentBackground(project.g0Assessment)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">G0 Assessment</span>
                    {getG0DecisionBadge(project.g0Assessment.decision)}
                  </div>
                  {project.g0Assessment.totalScore !== null && project.g0Assessment.maxScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Score</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {((project.g0Assessment.totalScore / project.g0Assessment.maxScore) * 3).toFixed(2)} / 3.00
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Status</span>
                    {getG0StatusBadge(project.g0Assessment.status)}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t bg-gradient-to-br from-gray-100 to-gray-200 -mx-6 -mb-6 px-6 pb-6 mt-4 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-semibold">G0 Assessment</span>
                    <span className="text-xs text-gray-500 italic">Not started</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Owner: {project.owner.firstName} {project.owner.lastName}</span>
                  <span>{project._count.pursuits} pursuit(s)</span>
                </div>
              </div>
              </Link>
              
              {/* Reassign Button - Outside clickable area */}
              {user?.role === 'C_LEVEL' && (
                <button
                  onClick={(e) => openReassignModal(project, e)}
                  className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-glow text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <UserCheck size={16} />
                  <span>Reassign</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {stages.slice(0, 4).map((stage, idx) => {
          const count = projects.filter(p => p.stage === stage).length;
          const gradients = [
            'from-blue-500 to-indigo-600',
            'from-purple-500 to-pink-600',
            'from-emerald-500 to-teal-600',
            'from-orange-500 to-red-600'
          ];
          return (
            <div key={stage} className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6 text-center hover:shadow-large transition-all duration-300">
              <p className={`text-4xl font-bold bg-gradient-to-r ${gradients[idx]} bg-clip-text text-transparent`}>{count}</p>
              <p className="text-sm text-gray-600 mt-2 font-medium">{stageLabels[stage]}</p>
            </div>
          );
        })}
      </div>

      {/* Reassign Owner Modal */}
      {showReassignModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Reassign Project Owner</h3>
                <button 
                  onClick={() => setShowReassignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleReassignOwner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <p className="text-base font-semibold text-gray-900">{selectedProject.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Owner
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {selectedProject.owner?.firstName} {selectedProject.owner?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedProject.owner?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Owner *
                  </label>
                  <select
                    required
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">Select new owner</option>
                    {availableUsers.filter(u => u.id !== selectedProject.ownerId).map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReassignModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Reassign Owner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLifecycle;
