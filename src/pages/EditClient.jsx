import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getStakeholderById, updateStakeholder, getProjects, linkStakeholderToProject } from '../services/api';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const countriesByRegion = {
  'Middle East': ['Bahrain', 'Egypt', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'United Arab Emirates', 'Yemen'],
  'Europe': ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'],
  'North America': ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'],
  'Asia Pacific': ['Afghanistan', 'Australia', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Fiji', 'India', 'Indonesia', 'Japan', 'Kazakhstan', 'Kiribati', 'Kyrgyzstan', 'Laos', 'Malaysia', 'Maldives', 'Marshall Islands', 'Micronesia', 'Mongolia', 'Myanmar', 'Nauru', 'Nepal', 'New Zealand', 'North Korea', 'Pakistan', 'Palau', 'Papua New Guinea', 'Philippines', 'Samoa', 'Singapore', 'Solomon Islands', 'South Korea', 'Sri Lanka', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Tonga', 'Turkmenistan', 'Tuvalu', 'Uzbekistan', 'Vanuatu', 'Vietnam'],
  'Africa': ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Djibouti', 'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
  'Latin America': ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela']
};

const EditStakeholder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [originalProjectIds, setOriginalProjectIds] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
    contactPhone: '',
    website: '',
    stakeholderType: 'CLIENT',
    primarySector: 'Energy',
    region: 'Middle East',
    country: '',
    city: ''
  });

  const availableCountries = countriesByRegion[formData.region] || [];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [stakeholderData, projectsData] = await Promise.all([
        getStakeholderById(id),
        getProjects()
      ]);
      setFormData({
        name: stakeholderData.name || '',
        email: stakeholderData.email || '',
        phone: stakeholderData.phone || '',
        contactPerson: stakeholderData.contactPerson || '',
        contactPhone: stakeholderData.contactPhone || '',
        website: stakeholderData.website || '',
        stakeholderType: 'CLIENT',
        primarySector: stakeholderData.primarySector || 'Energy',
        region: stakeholderData.region || 'Middle East',
        country: stakeholderData.country || '',
        city: stakeholderData.city || ''
      });
      
      setProjects(projectsData);
      
      // Load existing linked projects
      if (stakeholderData.projects && stakeholderData.projects.length > 0) {
        const linkedProjects = stakeholderData.projects.map(link => ({
          ...link.project,
          role: link.role,
          isPrimary: link.isPrimary
        }));
        setSelectedProjects(linkedProjects);
        setOriginalProjectIds(linkedProjects.map(p => p.id));
      }
    } catch (error) {
      console.error('Failed to load stakeholder:', error);
      toast.error('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const addProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project && !selectedProjects.find(p => p.id === projectId)) {
      setSelectedProjects([...selectedProjects, { ...project, role: 'Client', isPrimary: false }]);
    }
  };

  const removeProject = (projectId) => {
    setSelectedProjects(selectedProjects.filter(p => p.id !== projectId));
  };

  const updateProjectRole = (projectId, role) => {
    setSelectedProjects(selectedProjects.map(p => 
      p.id === projectId ? { ...p, role } : p
    ));
  };

  const togglePrimary = (projectId) => {
    setSelectedProjects(selectedProjects.map(p => 
      p.id === projectId ? { ...p, isPrimary: !p.isPrimary } : p
    ));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      // Reset country when region changes
      setFormData(prev => ({
        ...prev,
        region: value,
        country: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate project selection
    if (selectedProjects.length === 0) {
      toast.error('Please link at least one project to the client');
      return;
    }
    
    setSaving(true);
    
    try {
      await updateStakeholder(id, formData);
      
      // Link new projects that weren't previously linked
      const newProjects = selectedProjects.filter(p => !originalProjectIds.includes(p.id));
      if (newProjects.length > 0) {
        await Promise.all(
          newProjects.map(project =>
            linkStakeholderToProject(
              id,
              project.id,
              project.role,
              project.isPrimary
            )
          )
        );
      }
      
      toast.success('Client updated successfully');
      navigate(`/clients/${id}`);
    } catch (error) {
      console.error('Failed to update stakeholder:', error);
      toast.error(error.response?.data?.error || 'Failed to update client');
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
      <Link to={`/clients/${id}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Client
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Client</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label">Organization/Person Name *</label>
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
                <label className="label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Contact Person *</label>
                <input
                  type="text"
                  name="contactPerson"
                  className="input"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Primary contact name"
                  required
                />
              </div>

              <div>
                <label className="label">Contact Phone *</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="input"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Contact person phone"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Website</label>
                <input
                  type="url"
                  name="website"
                  className="input"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Primary Sector *</label>
                <select
                  name="primarySector"
                  className="input"
                  value={formData.primarySector}
                  onChange={handleChange}
                  required
                >
                  <option value="Energy">Energy</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Data Center">Data Center</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Construction">Construction</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Water">Water</option>
                  <option value="Education">Education</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <option value="">Select Country</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
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

          {/* Linked Projects */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Link Projects *</h2>
            
            <div className="mb-4">
              <label className="label">Select Project *</label>
              <select
                className="input"
                onChange={(e) => {
                  if (e.target.value) {
                    addProject(e.target.value);
                    e.target.value = '';
                  }
                }}
                value=""
              >
                <option value="">Choose a project to link...</option>
                {projects
                  .filter(proj => !selectedProjects.find(sp => sp.id === proj.id))
                  .map(proj => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} - {proj.region}
                    </option>
                  ))}
              </select>
            </div>

            {selectedProjects.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">Linked Projects:</p>
                {selectedProjects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.region} • {project.sector}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        className="input w-32 text-sm"
                        placeholder="Role"
                        value={project.role}
                        onChange={(e) => updateProjectRole(project.id, e.target.value)}
                      />
                      <label className="flex items-center text-sm font-medium">
                        <input
                          type="checkbox"
                          className="mr-2 w-4 h-4"
                          checked={project.isPrimary}
                          onChange={() => togglePrimary(project.id)}
                        />
                        Primary
                      </label>
                      <button
                        type="button"
                        onClick={() => removeProject(project.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedProjects.length === 0 && (
              <p className="text-sm text-gray-500 italic">No projects linked yet. Please select at least one project.</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/clients/${id}`)}
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

export default EditStakeholder;
