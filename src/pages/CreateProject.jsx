import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProject, getStakeholders, linkStakeholderToProject } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2, X } from 'lucide-react';

const countriesByRegion = {
  'Middle East': [
    'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman',
    'Iraq', 'Jordan', 'Lebanon', 'Palestine', 'Syria', 'Yemen', 'Egypt'
  ],
  'Europe': [
    'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
    'Belgium', 'Switzerland', 'Austria', 'Poland', 'Sweden', 'Norway',
    'Denmark', 'Finland', 'Portugal', 'Greece', 'Ireland', 'Czech Republic'
  ],
  'North America': [
    'United States', 'Canada', 'Mexico'
  ],
  'Asia Pacific': [
    'China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia',
    'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'Australia',
    'New Zealand', 'Pakistan', 'Bangladesh'
  ],
  'Africa': [
    'South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Ghana', 'Ethiopia',
    'Morocco', 'Tanzania', 'Uganda', 'Algeria', 'Tunisia', 'Senegal'
  ],
  'Latin America': [
    'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia', 'Peru',
    'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay'
  ]
};

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sector: 'Energy',
    region: 'Middle East',
    country: '',
    city: '',
    contractValue: '',
    currency: 'USD',
    startDate: '',
    completionDate: ''
  });

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      const data = await getStakeholders();
      setStakeholders(data);
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Reset country when region changes
      if (name === 'region') {
        updated.country = '';
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate client selection
    if (!selectedClient) {
      toast.error('Please select a client before creating the project');
      return;
    }
    
    setLoading(true);

    try {
      const projectData = {
        ...formData,
        contractValue: formData.contractValue ? parseFloat(formData.contractValue) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        completionDate: formData.completionDate ? new Date(formData.completionDate).toISOString() : null
      };

      const project = await createProject(projectData);
      
      // Link client to the project
      await linkStakeholderToProject(
        selectedClient.id, 
        project.id, 
        selectedClient.role, 
        selectedClient.isPrimary
      );
      
      toast.success('Project created successfully!');
      navigate(`/projects/${project.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/projects" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Projects
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
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

              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Sector *</label>
                <select
                  name="sector"
                  className="input"
                  value={formData.sector}
                  onChange={handleChange}
                  required
                >
                  <option value="Energy">Energy</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Construction">Construction</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Data Center">Data Center</option>
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
                <select
                  name="country"
                  className="input"
                  value={formData.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a country...</option>
                  {countriesByRegion[formData.region]?.map(country => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
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

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link to="/projects" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
