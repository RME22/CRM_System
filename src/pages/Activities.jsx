import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPursuits, updatePursuit, getProjects } from '../services/api';
import { Search, Plus, TrendingUp, TrendingDown, Edit2, Target, MessageCircle, Edit3, XCircle, Send } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PursuitTracker = () => {
  const { user } = useAuth();
  const [pursuits, setPursuits] = useState([]);
  const [filteredPursuits, setFilteredPursuits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [selectedPursuit, setSelectedPursuit] = useState(null);
  const [chatComments, setChatComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [quickEditData, setQuickEditData] = useState({
    revision: '',
    progressPercent: 0
  });

  useEffect(() => {
    loadPursuits();
    loadProjects();
  }, []);

  useEffect(() => {
    filterPursuits();
  }, [pursuits, searchTerm, selectedStatus, selectedProject]);

  const loadPursuits = async () => {
    try {
      const data = await getPursuits();
      setPursuits(data);
    } catch (error) {
      console.error('Failed to load pursuits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const filterPursuits = () => {
    let filtered = pursuits;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (selectedProject) {
      filtered = filtered.filter(p => p.projectId === selectedProject);
    }

    setFilteredPursuits(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      EXCELLENT: 'bg-green-100 text-green-800',
      AVERAGE: 'bg-yellow-100 text-yellow-800',
      POOR: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const openChatModal = (pursuit, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPursuit(pursuit);
    
    // Load chat comments
    if (pursuit.comment) {
      try {
        const parsed = JSON.parse(pursuit.comment);
        setChatComments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setChatComments([]);
      }
    } else {
      setChatComments([]);
    }
    
    setShowChatModal(true);
  };

  const openQuickEditModal = (pursuit, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPursuit(pursuit);
    setQuickEditData({
      revision: pursuit.projectSize || '',
      progressPercent: pursuit.progressPercent || 0
    });
    setShowQuickEditModal(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPursuit) return;
    
    const comment = {
      text: newComment,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedComments = [...chatComments, comment];
    
    try {
      await updatePursuit(selectedPursuit.id, {
        comment: JSON.stringify(updatedComments)
      });
      setChatComments(updatedComments);
      setNewComment('');
      toast.success('Comment added');
      loadPursuits();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleQuickEdit = async (e) => {
    e.preventDefault();
    if (!selectedPursuit) return;
    
    try {
      const updatedComments = [...chatComments];
      
      // Add system messages for changes
      if (quickEditData.revision !== (selectedPursuit.projectSize || '')) {
        updatedComments.push({
          text: `📝 Changed Revision: "${selectedPursuit.projectSize || 'None'}" → "${quickEditData.revision}"`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      if (parseInt(quickEditData.progressPercent) !== parseInt(selectedPursuit.progressPercent)) {
        updatedComments.push({
          text: `📊 Updated Progress: ${selectedPursuit.progressPercent}% → ${quickEditData.progressPercent}%`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      await updatePursuit(selectedPursuit.id, {
        revision: quickEditData.revision,
        progressPercent: parseInt(quickEditData.progressPercent),
        comment: JSON.stringify(updatedComments)
      });
      
      toast.success('Activity updated');
      setShowQuickEditModal(false);
      loadPursuits();
    } catch (error) {
      toast.error('Failed to update activity');
    }
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
        <div className="grid grid-cols-1 gap-4">
          <LoadingSkeleton type="list" count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Tracker</h1>
          <p className="text-gray-600 mt-1">Real-time visibility into ongoing activities</p>
        </div>
        <Link to="/activities/create" className="btn btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Activity</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search activities..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="AVERAGE">Average</option>
            <option value="POOR">Poor</option>
          </select>
        </div>
      </div>

      {/* Pursuits Grid */}
      {filteredPursuits.length === 0 ? (
        <EmptyState
          icon={Target}
          title={searchTerm || selectedStatus ? 'No pursuits match your filters' : 'No pursuits yet'}
          description={searchTerm || selectedStatus ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Start tracking business opportunities and manage your pursuit pipeline.'}
          actionLabel="Add Activity"
          actionLink="/activities/create"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPursuits.map((pursuit, index) => (
            <div 
              key={pursuit.id} 
              className="card hover:shadow-lg transition-shadow relative animate-slide-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex items-center space-x-1 z-10">
                <button
                  onClick={(e) => openChatModal(pursuit, e)}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Chat"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={(e) => openQuickEditModal(pursuit, e)}
                  className="p-2 text-gray-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-lg transition-colors"
                  title="Quick Edit"
                >
                  <Edit3 size={18} />
                </button>
                <Link
                  to={`/activities/${pursuit.id}/edit`}
                  className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="Full Edit"
                >
                  <Edit2 size={18} />
                </Link>
              </div>

              {/* Card Content - Clickable */}
              <Link to={`/activities/${pursuit.id}`} className="block">
              <div className="flex items-center justify-between pr-32">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{pursuit.clientName}</h3>
                    <span className={`badge ${getStatusColor(pursuit.status)}`}>
                      {pursuit.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Owner: {pursuit.owner.firstName} {pursuit.owner.lastName} • 
                    Last updated: {new Date(pursuit.lastUpdated).toLocaleDateString()}
                  </div>
                </div>

                <div className="ml-6 text-center">
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-primary-600">
                      {pursuit.progressPercent}%
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${pursuit.progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Progress</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">

                  <span className="text-gray-600">
                    {pursuit._count?.documents || 0} documents
                  </span>
                  {/* <span className="text-gray-600">
                    {pursuit._count?.engagements || 0} engagements
                  </span> */}
                </div>
                {pursuit.project?.goScore && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Go Score:</span>
                    <span className="font-semibold text-primary-600">
                      {pursuit.project.goScore}/100
                    </span>
                  </div>
                )}
              </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{pursuits.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Pursuits</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {pursuits.filter(p => p.status === 'EXCELLENT').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Excellent</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-600">
            {pursuits.filter(p => p.status === 'AVERAGE').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Average</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">
            {pursuits.filter(p => p.status === 'POOR').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Poor</p>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedPursuit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Activity Chat - {selectedPursuit.clientName}</h3>
                </div>
                <button 
                  onClick={() => setShowChatModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              {/* Chat History */}
              {chatComments && chatComments.length > 0 ? (
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {chatComments.map((comment, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 shadow-sm border ${
                        comment.isSystemMessage
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-primary-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          comment.isSystemMessage
                            ? 'bg-primary-500'
                            : 'bg-primary-100'
                        }`}>
                          <MessageCircle size={16} className={comment.isSystemMessage ? 'text-white' : 'text-primary-600'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${
                              comment.isSystemMessage ? 'text-primary-700' : 'text-gray-900'
                            }`}>
                              {comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            comment.isSystemMessage ? 'text-gray-800 font-medium' : 'text-gray-700'
                          }`}>{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 mb-4 bg-gray-50 rounded-lg">
                  <MessageCircle size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No comments yet. Start the conversation!</p>
                </div>
              )}
              
              {/* Comment Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Type a comment..."
                  className="input flex-1"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {showQuickEditModal && selectedPursuit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Quick Edit - {selectedPursuit.clientName}</h3>
                </div>
                <button 
                  onClick={() => setShowQuickEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleQuickEdit} className="space-y-4">
                <div>
                  <label className="label">Revision</label>
                  <input
                    type="text"
                    value={quickEditData.revision}
                    onChange={(e) => setQuickEditData({ ...quickEditData, revision: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Rev 1.0, Rev A"
                  />
                </div>
                
                <div>
                  <label className="label">Progress (%)</label>
                  <input
                    type="number"
                    value={quickEditData.progressPercent}
                    onChange={(e) => setQuickEditData({ ...quickEditData, progressPercent: e.target.value })}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickEditModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Save Changes
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

export default PursuitTracker;
