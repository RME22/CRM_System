import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, updateProject, getStakeholders, linkStakeholderToProject } from '../services/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [originalClientId, setOriginalClientId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: '',
    region: '',
    country: '',
    city: '',
    contractValue: '',
    currency: 'USD',
    startDate: '',
    completionDate: '',
    stage: '',
    status: ''
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projectData, stakeholdersData] = await Promise.all([
        getProjectById(id),
        getStakeholders()
      ]);
      
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        sector: projectData.sector || '',
        region: projectData.region || '',
        country: projectData.country || '',
        city: projectData.city || '',
        contractValue: projectData.contractValue || '',
        currency: projectData.currency || 'USD',
        startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
        completionDate: projectData.completionDate ? projectData.completionDate.split('T')[0] : '',
        stage: projectData.stage || '',
        status: projectData.status || ''
      });
      
      setStakeholders(stakeholdersData);
      
      // Load existing client if any
      if (projectData.stakeholders && projectData.stakeholders.length > 0) {
        const primaryStakeholder = projectData.stakeholders[0];
        setSelectedClient({
          ...primaryStakeholder.stakeholder,
          role: primaryStakeholder.role,
          isPrimary: primaryStakeholder.isPrimary
        });
        setOriginalClientId(primaryStakeholder.stakeholder.id);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectClient = (stakeholderId) => {
    const stakeholder = stakeholders.find(s => s.id === stakeholderId);
    if (stakeholder) {
      setSelectedClient({ ...stakeholder, role: 'Client', isPrimary: true });
    }
  };

  const removeClient = () => {
    setSelectedClient(null);
  };

  const updateClientRole = (role) => {
    if (selectedClient) {
      setSelectedClient({ ...selectedClient, role });
    }
  };

  const togglePrimary = () => {
    if (selectedClient) {
      setSelectedClient({ ...selectedClient, isPrimary: !selectedClient.isPrimary });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate client selection
    if (!selectedClient) {
      toast.error('Please select a client before saving the project');
      return;
    }
    
    setSaving(true);
    
    try {
      await updateProject(id, formData);
      
      // Update client link if changed
      if (selectedClient.id !== originalClientId) {
        await linkStakeholderToProject(
          selectedClient.id,
          id,
          selectedClient.role,
          selectedClient.isPrimary
        );
      }
      
      toast.success('Project updated successfully');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.error || 'Failed to update project');
    } finally {
      setSaving(false);
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
    <div className="p-6 max-w-4xl mx-auto">
      <Link to={`/projects/${id}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Project
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Sector *</label>
                <select
                  name="sector"
                  className="input"
                  value={formData.sector}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Sector</option>
                  <option value="Energy">Energy</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Construction">Construction</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Water">Water</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div>
                <label className="label">Region *</label>
                <select
                  name="region"
                  className="input"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="Asia Pacific">Asia Pacific</option>
                  <option value="Africa">Africa</option>
                  <option value="Latin America">Latin America</option>
                </select>
              </div>

              <div>
                <label className="label">Country *</label>
                <input
                  type="text"
                  name="country"
                  className="input"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  className="input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Financial Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Estimated Value</label>
                <input
                  type="number"
                  name="contractValue"
                  className="input"
                  value={formData.contractValue}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="label">Currency</label>
                <select
                  name="currency"
                  className="input"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="AED">AED</option>
                  <option value="SAR">SAR</option>
                  <option value="JPY">JPY</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="input"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Completion Date</label>
                <input
                  type="date"
                  name="completionDate"
                  className="input"
                  value={formData.completionDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Project Status */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Project Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Stage</label>
                <select
                  name="stage"
                  className="input"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  <option value="LEAD_IDENTIFIED">Lead Identified</option>
                  <option value="GO_EVALUATION">Go Evaluation</option>
                  <option value="BID_SUBMITTED">Bid Submitted</option>
                  <option value="CONTRACT_SUBMITTED">Contract Submitted</option>
                  <option value="PROJECT_START_DATE_SET">Project Start Date Set</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  name="status"
                  className="input"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Link Client *</h2>
            
            {!selectedClient ? (
              <div>
                <label className="label">Select Client *</label>
                <select
                  className="input"
                  onChange={(e) => {
                    if (e.target.value) {
                      selectClient(e.target.value);
                    }
                  }}
                  value=""
                  required
                >
                  <option value="">Choose a client...</option>
                  {stakeholders.map(sh => (
                    <option key={sh.id} value={sh.id}>
                      {sh.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-lg">{selectedClient.name}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    className="input w-40"
                    placeholder="Role"
                    value={selectedClient.role}
                    onChange={(e) => updateClientRole(e.target.value)}
                  />
                  <label className="flex items-center text-sm font-medium">
                    <input
                      type="checkbox"
                      className="mr-2 w-4 h-4"
                      checked={selectedClient.isPrimary}
                      onChange={togglePrimary}
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={removeClient}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center space-x-2"
              disabled={saving}
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;
