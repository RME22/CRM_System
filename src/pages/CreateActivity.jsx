import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPursuit, getProjects } from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ActivityChat from '../components/ActivityChat';
import { useAuth } from '../contexts/AuthContext';

const CreatePursuit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [chatComments, setChatComments] = useState([]);
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    revision: '',
    progressPercent: 0,
    comment: '',
    revenue: '',
    currency: 'USD',
    region: '',
    country: '',
    currentStage: 'Initial'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjects({ status: 'ACTIVE' });
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddComment = (commentText) => {
    const newComment = {
      text: commentText,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    };
    setChatComments(prev => [...prev, newComment]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pursuitData = {
        ...formData,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        progressPercent: parseInt(formData.progressPercent),
        comment: JSON.stringify(chatComments) // Save chat as JSON
      };

      const pursuit = await createPursuit(pursuitData);
      toast.success('Pursuit created successfully!');
      navigate(`/activities/${pursuit.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create pursuit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/activities" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Activities
      </Link>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Activity</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Association */}
          <div>
            <label className="label">Link to Project *</label>
            <select
              name="projectId"
              className="input"
              value={formData.projectId}
              onChange={handleChange}
              required
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.sector}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Details */}
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4">Activity Information</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Activity Title *</label>
                <input
                  type="text"
                  name="title"
                  className="input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter activity title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Region *</label>
                  <input
                    type="text"
                    name="region"
                    className="input"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="e.g., Middle East, Europe"
                    required
                  />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <input
                    type="text"
                    name="country"
                    className="input"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., UAE, Saudi Arabia"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Revision</label>
                <input
                  type="text"
                  name="revision"
                  className="input"
                  value={formData.revision}
                  onChange={handleChange}
                  placeholder="e.g., Rev 1.0, Rev A"
                />
              </div>

              <div>
                <label className="label">Progress (%)</label>
                <input
                  type="number"
                  name="progressPercent"
                  className="input"
                  value={formData.progressPercent}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Revenue</label>
                  <input
                    type="number"
                    name="revenue"
                    className="input"
                    value={formData.revenue}
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
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="pt-6 border-t">
            <ActivityChat 
              comments={chatComments} 
              onAddComment={handleAddComment}
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link to="/activities" className="btn btn-secondary">
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
                <span>Create Activity</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePursuit;
