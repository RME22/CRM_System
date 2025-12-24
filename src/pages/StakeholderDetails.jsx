import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStakeholderById, getProjects, linkStakeholderToProject } from '../services/api';
import { ArrowLeft, Building2, Mail, Phone, Globe, MapPin, Plus, X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const StakeholderDetails = () => {
  const { id } = useParams();
  const [stakeholder, setStakeholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [role, setRole] = useState('Partner');
  const [isPrimary, setIsPrimary] = useState(false);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadStakeholder();
  }, [id]);

  const loadStakeholder = async () => {
    try {
      const data = await getStakeholderById(id);
      setStakeholder(data);
    } catch (error) {
      console.error('Failed to load stakeholder:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      // Filter out already linked projects
      const linkedProjectIds = stakeholder?.projects?.map(p => p.project.id) || [];
      const availableProjects = data.filter(p => !linkedProjectIds.includes(p.id));
      setProjects(availableProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleLinkProject = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    setLinking(true);
    try {
      await linkStakeholderToProject(id, selectedProject, role, isPrimary);
      toast.success('Project linked successfully!');
      setShowLinkModal(false);
      setSelectedProject('');
      setRole('Partner');
      setIsPrimary(false);
      // Reload stakeholder data
      await loadStakeholder();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to link project');
    } finally {
      setLinking(false);
    }
  };

  const openLinkModal = () => {
    loadProjects();
    setShowLinkModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/clients" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Clients
      </Link>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 size={40} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{stakeholder.name}</h1>
              <Link 
                to={`/clients/${stakeholder.id}/edit`}
                className="btn btn-secondary btn-sm flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className="badge badge-info">{stakeholder.stakeholderType}</span>
              <span className="badge badge-success">{stakeholder.relationshipTier}</span>
              <span className="badge badge-gray">{stakeholder.influenceLevel} Influence</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stakeholder.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail size={16} />
                  <span>{stakeholder.email}</span>
                </div>
              )}
              {stakeholder.phone && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={16} />
                  <span>{stakeholder.phone}</span>
                </div>
              )}
              {stakeholder.website && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Globe size={16} />
                  <a href={stakeholder.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {stakeholder.website}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin size={16} />
                <span>{stakeholder.region}, {stakeholder.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">
            {stakeholder.projects?.length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Projects</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stakeholder.pursuits?.length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Activities</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {stakeholder.engagements?.length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Engagements</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {stakeholder.satisfactionScore || 'N/A'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Satisfaction Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Primary Sector</span>
              <span className="font-medium">{stakeholder.primarySector}</span>
            </div>
            {stakeholder.secondarySectors?.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Secondary Sectors</span>
                <span className="font-medium">{stakeholder.secondarySectors.join(', ')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Account Owner</span>
              <span className="font-medium">
                {stakeholder.owner?.firstName} {stakeholder.owner?.lastName}
              </span>
            </div>
            {stakeholder.lastEngagementDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Engagement</span>
                <span className="font-medium">
                  {new Date(stakeholder.lastEngagementDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Engagements */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Engagements</h2>
          {stakeholder.engagements && stakeholder.engagements.length > 0 ? (
            <div className="space-y-3">
              {stakeholder.engagements.slice(0, 5).map((engagement) => (
                <div key={engagement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{engagement.engagementType}</span>
                    <span className={`badge ${
                      engagement.sentiment === 'POSITIVE' ? 'badge-success' :
                      engagement.sentiment === 'NEGATIVE' ? 'badge-danger' : 'badge-gray'
                    }`}>
                      {engagement.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{engagement.notes}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(engagement.engagementDate).toLocaleDateString()} - {engagement.user.firstName} {engagement.user.lastName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No engagements yet</p>
          )}
        </div>

        {/* Linked Projects */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Linked Projects</h2>
            <button
              onClick={openLinkModal}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Link Project</span>
            </button>
          </div>
          {stakeholder.projects && stakeholder.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stakeholder.projects.map((ps) => (
                <Link
                  key={ps.id}
                  to={`/projects/${ps.project.id}`}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{ps.project.name}</h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="badge badge-info">{ps.project.stage}</span>
                    <span className="badge badge-success">{ps.project.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{ps.role}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No linked projects</p>
          )}
        </div>
      </div>

      {/* Link Project Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Link Project to Stakeholder</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Select Project *</label>
                <select
                  className="input"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Choose a project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.sector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Role *</label>
                <input
                  type="text"
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Client, Consultant, Partner"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                  />
                  <span className="text-sm">Set as Primary Stakeholder</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="btn btn-secondary"
                  disabled={linking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLinkProject}
                  disabled={linking || !selectedProject}
                  className="btn btn-primary"
                >
                  {linking ? 'Linking...' : 'Link Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeholderDetails;
