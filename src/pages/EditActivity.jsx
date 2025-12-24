import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPursuitById, updatePursuit, getProjects } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import ActivityChat from '../components/ActivityChat';
import { useAuth } from '../contexts/AuthContext';

const EditPursuit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [chatComments, setChatComments] = useState([]);
  const [originalValues, setOriginalValues] = useState({
    revision: '',
    progressPercent: 0,
    comment: ''
  });
  
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    revision: '',
    progressPercent: 0,
    comment: '',
    revenue: '',
    currency: 'USD'
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [pursuitData, projectsData] = await Promise.all([
        getPursuitById(id),
        getProjects()
      ]);
      
      const initialData = {
        projectId: pursuitData.projectId || '',
        title: pursuitData.clientName || pursuitData.title || '',
        revision: pursuitData.projectSize || '',
        progressPercent: pursuitData.progressPercent || 0,
        comment: pursuitData.comment || '',
        revenue: pursuitData.contractValue || '',
        currency: pursuitData.currency || 'USD'
      };
      
      setFormData(initialData);
      
      // Store original values for change tracking
      setOriginalValues({
        revision: initialData.revision,
        progressPercent: initialData.progressPercent,
        comment: initialData.comment,
        revenue: initialData.revenue
      });
      
      // Load existing chat comments from the comment field
      if (pursuitData.comment) {
        try {
          const parsed = JSON.parse(pursuitData.comment);
          if (Array.isArray(parsed)) {
            setChatComments(parsed);
          } else {
            // Legacy single comment - convert to array
            setChatComments([{
              text: pursuitData.comment,
              userName: 'Previous User',
              timestamp: pursuitData.updatedAt
            }]);
          }
        } catch {
          // Not JSON, treat as single comment
          setChatComments([{
            text: pursuitData.comment,
            userName: 'Previous User',
            timestamp: pursuitData.updatedAt
          }]);
        }
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load pursuit:', error);
      toast.error('Failed to load pursuit');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddComment = async (commentText) => {
    const newComment = {
      text: commentText,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    };
    const updatedComments = [...chatComments, newComment];
    setChatComments(updatedComments);
    
    // Auto-save comment to database immediately
    try {
      await updatePursuit(id, {
        comment: JSON.stringify(updatedComments)
      });
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to save comment:', error);
      toast.error('Failed to save comment');
      // Revert the comment if save failed
      setChatComments(chatComments);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Auto-generate chat messages for field changes
      const updatedComments = [...chatComments];
      const timestamp = new Date().toISOString();
      const userName = `${user.firstName} ${user.lastName}`;
      
      // Check for revision change
      if (formData.revision !== originalValues.revision) {
        updatedComments.push({
          text: `📝 Changed Revision: "${originalValues.revision || 'None'}" → "${formData.revision}"`,
          userName,
          timestamp,
          isSystemMessage: true
        });
      }
      
      // Check for progress change
      if (parseInt(formData.progressPercent) !== parseInt(originalValues.progressPercent)) {
        updatedComments.push({
          text: `📊 Updated Progress: ${originalValues.progressPercent}% → ${formData.progressPercent}%`,
          userName,
          timestamp,
          isSystemMessage: true
        });
      }
      
      // Check for revenue change
      if (parseFloat(formData.revenue || 0) !== parseFloat(originalValues.revenue || 0)) {
        updatedComments.push({
          text: `💰 Updated Revenue: ${formData.currency} ${(originalValues.revenue || 0).toLocaleString()} → ${formData.currency} ${parseFloat(formData.revenue || 0).toLocaleString()}`,
          userName,
          timestamp,
          isSystemMessage: true
        });
      }
      
      const submitData = {
        ...formData,
        revenue: formData.revenue ? parseFloat(formData.revenue) : null,
        progressPercent: parseInt(formData.progressPercent),
        comment: JSON.stringify(updatedComments) // Save chat as JSON
      };
      
      await updatePursuit(id, submitData);
      toast.success('Pursuit updated successfully');
      navigate(`/activities/${id}`);
    } catch (error) {
      console.error('Failed to update pursuit:', error);
      toast.error(error.response?.data?.error || 'Failed to update pursuit');
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
      <Link to={`/activities/${id}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Activity
      </Link>

      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Activity</h1>

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
              disabled={saving}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/activities/${id}`)}
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

export default EditPursuit;
