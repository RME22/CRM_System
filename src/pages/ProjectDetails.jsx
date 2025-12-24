import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getG0Assessment, linkStakeholderToProject, createPursuit, uploadDocument, getStakeholders, createMilestone, reassignProjectOwner, getUsers, updatePursuit } from '../services/api';
import { ArrowLeft, Calendar, DollarSign, Users, FileText, Target, ClipboardCheck, CheckCircle, XCircle, AlertCircle, Edit, Clock, Flag, Plus, UserCheck, ChevronDown, ChevronUp, Edit3, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [g0Assessment, setG0Assessment] = useState(null);
  
  // Modal states
  const [showStakeholderModal, setShowStakeholderModal] = useState(false);
  const [showPursuitModal, setShowPursuitModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  
  // Activity expand/collapse and edit states
  const [expandedActivityId, setExpandedActivityId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityEditForm, setActivityEditForm] = useState({ title: '', revision: '', progressPercent: 0, comment: '', revenue: '', currency: 'USD' });
  
  // Chat/Comments states
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedActivityForChat, setSelectedActivityForChat] = useState(null);
  const [chatComments, setChatComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // Form data states
  const [stakeholderForm, setStakeholderForm] = useState({ stakeholderId: '', role: '', isPrimary: false });
  const [pursuitForm, setPursuitForm] = useState({ title: '', revision: '', progressPercent: 0, comment: '', revenue: '', currency: 'USD' });
  const [documentForm, setDocumentForm] = useState({ file: null, description: '', folder: '' });
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', notes: '' });
  
  // Available stakeholders list
  const [availableStakeholders, setAvailableStakeholders] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newOwnerId, setNewOwnerId] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadProject();
    loadStakeholders();
    if (user?.role === 'C_LEVEL') {
      loadUsers();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await getProjectById(id);
      setProject(data);
      // Load G0 assessment if exists
      try {
        const g0Data = await getG0Assessment(id);
        setG0Assessment(g0Data);
      } catch (error) {
        // G0 assessment doesn't exist yet
        setG0Assessment(null);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStakeholders = async () => {
    try {
      const data = await getStakeholders();
      setAvailableStakeholders(data);
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
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

  const handleReassignOwner = async (e) => {
    e.preventDefault();
    try {
      await reassignProjectOwner(id, newOwnerId);
      toast.success('Project owner reassigned successfully');
      setShowReassignModal(false);
      setNewOwnerId('');
      loadProject();
    } catch (error) {
      console.error('Failed to reassign owner:', error);
      toast.error('Failed to reassign project owner');
    }
  };

  const handleAddStakeholder = async (e) => {
    e.preventDefault();
    try {
      await linkStakeholderToProject(
        stakeholderForm.stakeholderId,
        id,
        stakeholderForm.role,
        stakeholderForm.isPrimary
      );
      setShowStakeholderModal(false);
      setStakeholderForm({ stakeholderId: '', role: '', isPrimary: false });
      loadProject(); // Reload project to get updated stakeholders
    } catch (error) {
      console.error('Failed to add stakeholder:', error);
      alert('Failed to add stakeholder. Please try again.');
    }
  };

  const handleAddPursuit = async (e) => {
    e.preventDefault();
    try {
      await createPursuit({
        ...pursuitForm,
        projectId: id,
        region: project.region,
        country: project.country,
        revenue: pursuitForm.revenue ? parseFloat(pursuitForm.revenue) : null,
        progressPercent: parseInt(pursuitForm.progressPercent)
      });
      toast.success('Activity added successfully');
      setShowPursuitModal(false);
      setPursuitForm({ title: '', revision: '', progressPercent: 0, comment: '', revenue: '', currency: 'USD' });
      loadProject(); // Reload project to get updated pursuits
    } catch (error) {
      console.error('Failed to add activity:', error);
      toast.error(error.response?.data?.error || 'Failed to add activity. Please try again.');
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('file', documentForm.file);
      formData.append('projectId', id);
      formData.append('description', documentForm.description);
      formData.append('folder', documentForm.folder);
      
      await uploadDocument(formData);
      setShowDocumentModal(false);
      setDocumentForm({ file: null, description: '', folder: '' });
      loadProject(); // Reload project to get updated documents
    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await createMilestone({
        ...milestoneForm,
        projectId: id
      });
      setShowMilestoneModal(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', notes: '' });
      loadProject(); // Reload project to get updated milestones
    } catch (error) {
      console.error('Failed to add milestone:', error);
      alert('Failed to add milestone. Please try again.');
    }
  };

  const handleOpenEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityEditForm({
      title: activity.clientName || activity.title || '',
      revision: activity.projectSize || '',
      progressPercent: activity.progressPercent || 0,
      comment: activity.comment || '',
      revenue: activity.contractValue || '',
      currency: activity.currency || 'USD'
    });
    setShowEditActivityModal(true);
  };

  const handleUpdateActivity = async (e) => {
    e.preventDefault();
    try {
      // Parse existing comments
      let existingComments = [];
      if (editingActivity.comment) {
        try {
          const parsed = JSON.parse(editingActivity.comment);
          existingComments = Array.isArray(parsed) ? parsed : [];
        } catch {
          existingComments = [];
        }
      }
      
      const updatedComments = [...existingComments];
      
      // Add system messages for changes
      if (activityEditForm.revision !== (editingActivity.projectSize || '')) {
        updatedComments.push({
          text: `📝 Changed Revision: "${editingActivity.projectSize || 'None'}" → "${activityEditForm.revision}"`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      if (parseInt(activityEditForm.progressPercent) !== parseInt(editingActivity.progressPercent)) {
        updatedComments.push({
          text: `📊 Updated Progress: ${editingActivity.progressPercent}% → ${activityEditForm.progressPercent}%`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      if (parseFloat(activityEditForm.revenue || 0) !== parseFloat(editingActivity.contractValue || 0)) {
        updatedComments.push({
          text: `💰 Updated Revenue: ${editingActivity.currency || 'USD'} ${(editingActivity.contractValue || 0).toLocaleString()} → ${activityEditForm.currency} ${parseFloat(activityEditForm.revenue || 0).toLocaleString()}`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      await updatePursuit(editingActivity.id, {
        title: activityEditForm.title,
        revision: activityEditForm.revision,
        progressPercent: parseInt(activityEditForm.progressPercent),
        revenue: activityEditForm.revenue ? parseFloat(activityEditForm.revenue) : null,
        currency: activityEditForm.currency,
        comment: JSON.stringify(updatedComments)
      });
      
      toast.success('Activity updated successfully');
      setShowEditActivityModal(false);
      setEditingActivity(null);
      loadProject(); // Reload project to get updated activities
    } catch (error) {
      console.error('Failed to update activity:', error);
      toast.error('Failed to update activity. Please try again.');
    }
  };

  const toggleActivityExpand = (activityId) => {
    setExpandedActivityId(expandedActivityId === activityId ? null : activityId);
  };

  const handleOpenChat = (activity) => {
    setSelectedActivityForChat(activity);
    
    // Parse existing comments
    if (activity.comment) {
      try {
        const parsed = JSON.parse(activity.comment);
        setChatComments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setChatComments([]);
      }
    } else {
      setChatComments([]);
    }
    
    setShowChatModal(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedActivityForChat) return;
    
    const comment = {
      text: newComment,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedComments = [...chatComments, comment];
    
    try {
      await updatePursuit(selectedActivityForChat.id, {
        comment: JSON.stringify(updatedComments)
      });
      setChatComments(updatedComments);
      setNewComment('');
      toast.success('Comment added');
      loadProject(); // Reload to update the chat icon
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  // Check if activities can be added based on G0 assessment score
  const canAddActivity = () => {
    // If no G0 assessment exists, activities CANNOT be added
    if (!g0Assessment) {
      return {
        allowed: false,
        reason: 'G0 assessment has not been completed'
      };
    }

    // Calculate weighted score from G0 assessment (score is on 1-3 scale)
    if (g0Assessment.totalScore !== null && g0Assessment.totalScore !== undefined && g0Assessment.maxScore) {
      const weightedScore = (g0Assessment.totalScore / g0Assessment.maxScore) * 3;
      
      // If weighted score is less than 1.8, activities CANNOT be added
      if (weightedScore < 1.8) {
        return {
          allowed: false,
          reason: `G0 assessment score is too low (${weightedScore.toFixed(2)}/3.0 - minimum 1.8 required)`
        };
      }

      // Score is >= 1.8, activities CAN be added regardless of approval status
      const statusText = g0Assessment.status === 'APPROVED' || g0Assessment.status === 'CONDITIONAL' 
        ? 'approved' 
        : g0Assessment.status === 'SUBMITTED' || g0Assessment.status === 'UNDER_REVIEW'
        ? 'under review'
        : 'updated';
      
      return {
        allowed: true,
        reason: `G0 assessment ${statusText} with score ${weightedScore.toFixed(2)}/3.0`
      };
    }

    // Assessment exists but no scores, cannot add activities
    return {
      allowed: false,
      reason: 'G0 assessment has not been scored yet'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Back Button */}
      <Link to="/projects" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-large border border-gray-200/50 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">{project.name}</h1>
            <p className="text-gray-600 text-lg">{project.description}</p>
            <div className="flex items-center space-x-4 mt-6">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-semibold border border-blue-200">{project.stage}</span>
              <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-green-800 rounded-full text-sm font-semibold border border-green-200">{project.status}</span>
              <Link 
                to={`/projects/${project.id}/edit`}
                className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:shadow-soft text-gray-700 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium border border-gray-300"
              >
                <Edit size={16} />
                <span>Edit Project</span>
              </Link>
              <Link 
                to={`/projects/${project.id}/g0`}
                className="px-4 py-2 bg-gradient-primary hover:shadow-glow text-white rounded-lg transition-all duration-300 flex items-center space-x-2 font-semibold"
              >
                <ClipboardCheck size={16} />
                <span>G0 Assessment</span>
              </Link>
              {user?.role === 'C_LEVEL' && (
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-glow text-white rounded-lg transition-all duration-300 flex items-center space-x-2 font-semibold"
                >
                  <UserCheck size={16} />
                  <span>Reassign Owner</span>
                </button>
              )}
            </div>
          </div>
          {project.goScore && (
            <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-4 rounded-xl border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Go Score</p>
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent my-2">{project.goScore}</p>
              <p className="text-sm font-medium text-gray-600">/100</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium hover:shadow-large border border-gray-200/50 p-6 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Financial</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Value</span>
              <span className="font-medium">
                {project.currency} {(project.contractValue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sector</span>
              <span className="font-medium">{project.sector}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium hover:shadow-large border border-gray-200/50 p-6 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Timeline</h3>
          </div>
          <div className="space-y-2">
            {project.startDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium">
                  {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.completionDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completion</span>
                <span className="font-medium">
                  {new Date(project.completionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium hover:shadow-large border border-gray-200/50 p-6 transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Team</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Owner</span>
              <span className="font-medium">
                {project.owner.firstName} {project.owner.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clients</span>
              <span className="font-medium">{project.stakeholders?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-large border border-gray-200/50 p-6">
        <div className="border-b-2 border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-4 border-b-4 transition-all duration-200 font-semibold ${
                activeTab === 'overview' 
                  ? 'border-primary-600 text-primary-600 scale-105' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('stakeholders')}
              className={`pb-4 border-b-4 transition-all duration-200 font-semibold ${
                activeTab === 'stakeholders' 
                  ? 'border-primary-600 text-primary-600 scale-105' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Clients ({project.stakeholders?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('pursuits')}
              className={`pb-4 border-b-4 transition-all duration-200 font-semibold ${
                activeTab === 'pursuits' 
                  ? 'border-primary-600 text-primary-600 scale-105' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Activities ({project.pursuits?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`pb-4 border-b-4 transition-all duration-200 font-semibold ${
                activeTab === 'documents' 
                  ? 'border-primary-600 text-primary-600 scale-105' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Documents ({project.documents?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('milestones')}
              className={`pb-4 border-b-4 transition-all duration-200 font-semibold ${
                activeTab === 'milestones' 
                  ? 'border-primary-600 text-primary-600 scale-105' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Milestones ({project.milestones?.length || 0})
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h3 className="font-semibold mb-4">Project Overview</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Sector</p>
                <p className="font-medium">{project.sector}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Region</p>
                <p className="font-medium">{project.region}, {project.country}</p>
              </div>

              {/* G0 Assessment Summary */}
              {g0Assessment && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <ClipboardCheck className="text-blue-600" size={20} />
                      <span>G0 Assessment Result</span>
                    </h4>
                    <Link 
                      to={`/projects/${project.id}/g0`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Full Assessment →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Status</p>
                      <span className={`badge ${
                        g0Assessment.status === 'APPROVED' ? 'badge-success' :
                        g0Assessment.status === 'CONDITIONAL' ? 'badge-warning' :
                        g0Assessment.status === 'REJECTED' ? 'badge-error' :
                        g0Assessment.status === 'SUBMITTED' ? 'badge-info' : 'badge-gray'
                      }`}>
                        {g0Assessment.status}
                      </span>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Decision</p>
                      {g0Assessment.decision === 'GO' && (
                        <span className="badge badge-success flex items-center space-x-1 w-fit">
                          <CheckCircle size={14} />
                          <span>GO</span>
                        </span>
                      )}
                      {g0Assessment.decision === 'CONDITIONAL_GO' && (
                        <span className="badge badge-warning flex items-center space-x-1 w-fit">
                          <AlertCircle size={14} />
                          <span>CONDITIONAL</span>
                        </span>
                      )}
                      {g0Assessment.decision === 'NO_GO' && (
                        <span className="badge badge-error flex items-center space-x-1 w-fit">
                          <XCircle size={14} />
                          <span>NO-GO</span>
                        </span>
                      )}
                      {g0Assessment.decision === 'PENDING' && (
                        <span className="badge badge-gray">PENDING</span>
                      )}
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Score</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {g0Assessment.totalScore !== null && g0Assessment.totalScore !== undefined && g0Assessment.maxScore
                          ? ((g0Assessment.totalScore / g0Assessment.maxScore) * 3).toFixed(2)
                          : 'N/A'
                        } / 3.00
                      </p>
                    </div>
                  </div>

                  {g0Assessment.conditions && g0Assessment.conditions.length > 0 && (
                    <div className="mt-3 bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-2">Conditions:</p>
                      <ul className="text-sm space-y-1">
                        {g0Assessment.conditions.map((cond) => (
                          <li key={cond.id} className="flex items-start space-x-2">
                            <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              cond.status === 'MET' ? 'bg-green-500' :
                              cond.status === 'NOT_MET' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></span>
                            <span>{cond.condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {g0Assessment.approvedBy && (
                    <p className="text-xs text-gray-600 mt-3">
                      Approved by {g0Assessment.approvedBy.firstName} {g0Assessment.approvedBy.lastName} on{' '}
                      {new Date(g0Assessment.approvedAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {/* Activity Addition Status */}
                  {canAddActivity().allowed ? (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <p className="text-xs font-medium text-green-800">
                          ✓ Activities can be added: {canAddActivity().reason}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle size={16} className="text-amber-600" />
                        <p className="text-xs font-medium text-amber-800">
                          ⚠ Activity creation restricted: {canAddActivity().reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {project.goScores && project.goScores.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 mt-6">Go Score History</h4>
                  <div className="space-y-3">
                    {project.goScores.map((score) => (
                      <div key={score.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg">{score.score}/100</span>
                          <span className="badge badge-info">{score.recommendation}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {new Date(score.calculatedAt).toLocaleDateString()}
                        </p>
                        {score.topPositiveFactors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-green-700">Strengths:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {score.topPositiveFactors.map((factor, idx) => (
                                <li key={idx}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Project Clients</h3>
              <button 
                onClick={() => setShowStakeholderModal(true)}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Client</span>
              </button>
            </div>
            <div className="space-y-3">
              {project.stakeholders.map((ps) => (
                <div key={ps.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{ps.stakeholder.name}</p>
                    <p className="text-sm text-gray-600">{ps.role}</p>
                  </div>
                  <span className="badge badge-info">{ps.stakeholder.stakeholderType}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stakeholders' && (!project.stakeholders || project.stakeholders.length === 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Project Clients</h3>
              <button 
                onClick={() => setShowStakeholderModal(true)}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Client</span>
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              No clients linked to this project yet.
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'pursuits' && (
          <div>
            {project.pursuits && project.pursuits.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Active Activities</h3>
                  <div className="flex items-center space-x-3">
                    {canAddActivity().allowed ? (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-xs text-green-700 font-medium">{canAddActivity().reason}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg">
                        <AlertCircle size={16} className="text-amber-600" />
                        <span className="text-xs text-amber-800 font-medium">{canAddActivity().reason}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => canAddActivity().allowed && setShowPursuitModal(true)}
                      disabled={!canAddActivity().allowed}
                      className="btn btn-primary btn-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canAddActivity().allowed ? 'Cannot add activities: ' + canAddActivity().reason : 'Add new activity'}
                    >
                      <Plus size={16} />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {project.pursuits.map((pursuit) => (
                    <div key={pursuit.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <h4 className="font-semibold text-lg text-gray-900">{pursuit.clientName || pursuit.title}</h4>
                            <span className={`badge ${
                              pursuit.status === 'EXCELLENT' ? 'badge-success' :
                              pursuit.status === 'AVERAGE' ? 'badge-warning' : 'badge-error'
                            }`}>
                              {pursuit.status}
                            </span>
                            <button
                              onClick={() => handleOpenChat(pursuit)}
                              className="flex items-center space-x-1 hover:bg-gray-100 rounded p-1 transition-colors"
                              title={pursuit.comment ? "View comments" : "Add comments"}
                            >
                              <MessageCircle size={18} className={pursuit.comment ? "text-primary-600" : "text-gray-400"} />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditActivity(pursuit)}
                              className="btn btn-secondary btn-sm flex items-center space-x-1"
                              title="Edit Activity"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => toggleActivityExpand(pursuit.id)}
                              className="btn btn-primary btn-sm flex items-center space-x-1"
                              title={expandedActivityId === pursuit.id ? "Collapse" : "Expand Details"}
                            >
                              {expandedActivityId === pursuit.id ? (
                                <>
                                  <ChevronUp size={14} />
                                  <span>Collapse</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={14} />
                                  <span>Details</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users size={16} className="text-gray-400" />
                            <div>
                              <span className="text-gray-600">Region: </span>
                              <span className="font-medium">{pursuit.region}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target size={16} className="text-gray-400" />
                            <div>
                              <span className="text-gray-600">Progress: </span>
                              <span className="font-medium">{pursuit.progressPercent}%</span>
                            </div>
                          </div>
                          {pursuit.projectSize && (
                            <div className="flex items-center space-x-2">
                              <Edit size={16} className="text-gray-400" />
                              <div>
                                <span className="text-gray-600">Revision: </span>
                                <span className="font-medium">{pursuit.projectSize}</span>
                              </div>
                            </div>
                          )}
                          {pursuit.contractValue && (
                            <div className="flex items-center space-x-2">
                              <DollarSign size={16} className="text-gray-400" />
                              <div>
                                <span className="text-gray-600">Value: </span>
                                <span className="font-medium">
                                  {pursuit.currency} {pursuit.contractValue.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${pursuit.progressPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {expandedActivityId === pursuit.id && (
                        <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Owner</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {pursuit.owner?.firstName} {pursuit.owner?.lastName}
                                </p>
                              </div>
                              {pursuit.projectSize && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Revision</p>
                                  <p className="text-sm font-medium text-gray-900">{pursuit.projectSize}</p>
                                </div>
                              )}
                              {pursuit.bidSubmissionDate && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bid Submission</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(pursuit.bidSubmissionDate).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Updated</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {new Date(pursuit.lastUpdated).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-3">
                              {pursuit.stakeholders && pursuit.stakeholders.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Stakeholders</p>
                                  <div className="space-y-2">
                                    {pursuit.stakeholders.slice(0, 3).map((ps) => (
                                      <div key={ps.id} className="flex items-center justify-between text-sm bg-white rounded p-2">
                                        <span className="font-medium text-gray-900">{ps.stakeholder?.name}</span>
                                        <span className="badge badge-info text-xs">{ps.stakeholderType || ps.role}</span>
                                      </div>
                                    ))}
                                    {pursuit.stakeholders.length > 3 && (
                                      <p className="text-xs text-gray-500">+{pursuit.stakeholders.length - 3} more</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              {pursuit.goScores && pursuit.goScores.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Go Score</p>
                                  <div className="bg-white rounded p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-2xl font-bold text-primary-600">{pursuit.goScores[0].score}/100</span>
                                      <span className="badge badge-info">{pursuit.goScores[0].recommendation}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Full Page Link */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <Link 
                              to={`/activities/${pursuit.id}`}
                              className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1"
                            >
                              <span>View Full Details Page</span>
                              <ArrowLeft size={14} className="rotate-180" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col space-y-4 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Active Activities</h3>
                    <button 
                      onClick={() => canAddActivity().allowed && setShowPursuitModal(true)}
                      disabled={!canAddActivity().allowed}
                      className="btn btn-primary btn-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canAddActivity().allowed ? 'Cannot add activities: ' + canAddActivity().reason : 'Add new activity'}
                    >
                      <Plus size={16} />
                      <span>Add Activity</span>
                    </button>
                  </div>
                  {canAddActivity().allowed ? (
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Activities can be added</p>
                        <p className="text-xs text-green-700 mt-1">{canAddActivity().reason}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg">
                      <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Activity creation restricted</p>
                        <p className="text-xs text-amber-800 mt-1">{canAddActivity().reason}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-center py-8 text-gray-500">
                  No activities for this project yet.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Project Documents</h3>
              <button 
                onClick={() => setShowDocumentModal(true)}
                className="btn btn-primary btn-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Document</span>
              </button>
            </div>
            {project.documents && project.documents.length > 0 ? (
              <div className="space-y-3">
                {project.documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <FileText className="text-primary-600 mt-1" size={24} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{doc.fileName}</h4>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {doc.folder && (
                              <span className="badge badge-info text-xs">{doc.folder}</span>
                            )}
                            <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://10.10.11.245:3000'}/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm ml-4"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded yet.
              </div>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div>
            {project.milestones && project.milestones.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Project Milestones</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="text-gray-600">
                          {project.milestones.filter(m => m.isCompleted).length} Completed
                        </span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Clock size={16} className="text-yellow-600" />
                        <span className="text-gray-600">
                          {project.milestones.filter(m => !m.isCompleted).length} Pending
                        </span>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMilestoneModal(true)}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {/* Timeline View */}
                <div className="space-y-4">
                  {project.milestones
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map((milestone, index) => {
                      const isOverdue = !milestone.isCompleted && new Date(milestone.dueDate) < new Date();
                      const isUpcoming = !milestone.isCompleted && new Date(milestone.dueDate) >= new Date();
                      
                      return (
                        <div 
                          key={milestone.id} 
                          className={`relative pl-8 pb-8 ${
                            index !== project.milestones.length - 1 ? 'border-l-2 border-gray-200' : ''
                          }`}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-4 ${
                            milestone.isCompleted 
                              ? 'bg-green-500 border-green-200' 
                              : isOverdue 
                                ? 'bg-red-500 border-red-200' 
                                : 'bg-yellow-500 border-yellow-200'
                          } -translate-x-[9px]`}></div>

                          {/* Milestone Card */}
                          <div className={`card ${
                            milestone.isCompleted 
                              ? 'bg-green-50 border border-green-200' 
                              : isOverdue 
                                ? 'bg-red-50 border border-red-200' 
                                : 'bg-white'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className={`font-semibold text-lg ${
                                    milestone.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {milestone.title}
                                  </h4>
                                  {milestone.isCompleted && (
                                    <CheckCircle size={20} className="text-green-600" />
                                  )}
                                  {isOverdue && (
                                    <span className="badge badge-error flex items-center space-x-1">
                                      <AlertCircle size={14} />
                                      <span>Overdue</span>
                                    </span>
                                  )}
                                  {isUpcoming && (
                                    <span className="badge badge-warning flex items-center space-x-1">
                                      <Clock size={14} />
                                      <span>Upcoming</span>
                                    </span>
                                  )}
                                </div>
                                {milestone.description && (
                                  <p className="text-gray-600 text-sm mb-3">{milestone.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Flag size={16} className="text-gray-400" />
                                <div>
                                  <p className="text-xs text-gray-500">Due Date</p>
                                  <p className={`font-medium ${
                                    isOverdue ? 'text-red-600' : 'text-gray-900'
                                  }`}>
                                    {new Date(milestone.dueDate).toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              {milestone.completedDate && (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle size={16} className="text-green-600" />
                                  <div>
                                    <p className="text-xs text-gray-500">Completed On</p>
                                    <p className="font-medium text-gray-900">
                                      {new Date(milestone.completedDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {milestone.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                <p className="text-sm text-gray-700">{milestone.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Project Milestones</h3>
                  <button 
                    onClick={() => setShowMilestoneModal(true)}
                    className="btn btn-primary btn-sm flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add Milestone</span>
                  </button>
                </div>
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Flag size={32} className="text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No milestones yet</h3>
                      <p className="text-gray-500">Track important deadlines and achievements for this project.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Stakeholder Modal */}
      {showStakeholderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Client</h3>
                <button 
                  onClick={() => setShowStakeholderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleAddStakeholder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    required
                    value={stakeholderForm.stakeholderId}
                    onChange={(e) => setStakeholderForm({ ...stakeholderForm, stakeholderId: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select a client</option>
                    {availableStakeholders.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.stakeholderType}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={stakeholderForm.role}
                    onChange={(e) => setStakeholderForm({ ...stakeholderForm, role: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Technical Lead, Project Sponsor"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={stakeholderForm.isPrimary}
                    onChange={(e) => setStakeholderForm({ ...stakeholderForm, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">
                    Primary Client
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStakeholderModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showPursuitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Activity</h3>
                <button 
                  onClick={() => setShowPursuitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleAddPursuit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pursuitForm.title}
                    onChange={(e) => setPursuitForm({ ...pursuitForm, title: e.target.value })}
                    className="input w-full"
                    placeholder="Enter activity title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revision
                  </label>
                  <input
                    type="text"
                    value={pursuitForm.revision}
                    onChange={(e) => setPursuitForm({ ...pursuitForm, revision: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Rev 1.0, Rev A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    value={pursuitForm.progressPercent}
                    onChange={(e) => setPursuitForm({ ...pursuitForm, progressPercent: e.target.value })}
                    className="input w-full"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={pursuitForm.comment}
                    onChange={(e) => setPursuitForm({ ...pursuitForm, comment: e.target.value })}
                    className="input w-full"
                    rows="3"
                    placeholder="Add any comments or notes..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Revenue
                    </label>
                    <input
                      type="number"
                      value={pursuitForm.revenue}
                      onChange={(e) => setPursuitForm({ ...pursuitForm, revenue: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={pursuitForm.currency}
                      onChange={(e) => setPursuitForm({ ...pursuitForm, currency: e.target.value })}
                      className="input w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPursuitModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document File *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files[0] })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folder
                  </label>
                  <select
                    value={documentForm.folder}
                    onChange={(e) => setDocumentForm({ ...documentForm, folder: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select folder (optional)</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="REPORT">Report</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="FINANCIAL">Financial</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                    className="input w-full"
                    rows="3"
                    placeholder="Brief description of the document"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDocumentModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Upload Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add Milestone</h3>
                <button 
                  onClick={() => setShowMilestoneModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={milestoneForm.title}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    className="input w-full"
                    placeholder="Milestone title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={milestoneForm.description}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    className="input w-full"
                    rows="2"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={milestoneForm.notes}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, notes: e.target.value })}
                    className="input w-full"
                    rows="2"
                    placeholder="Additional notes"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMilestoneModal(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    Add Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedActivityForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="text-primary-600" size={24} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Activity Comments</h3>
                    <p className="text-sm text-gray-600">{selectedActivityForChat.clientName || selectedActivityForChat.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedActivityForChat(null);
                    setNewComment('');
                  }}
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
                  <MessageCircle size={18} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {showEditActivityModal && editingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Edit Activity</h3>
                </div>
                <button 
                  onClick={() => {
                    setShowEditActivityModal(false);
                    setEditingActivity(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={activityEditForm.title}
                    onChange={(e) => setActivityEditForm({ ...activityEditForm, title: e.target.value })}
                    className="input w-full"
                    placeholder="Enter activity title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Revision
                  </label>
                  <input
                    type="text"
                    value={activityEditForm.revision}
                    onChange={(e) => setActivityEditForm({ ...activityEditForm, revision: e.target.value })}
                    className="input w-full"
                    placeholder="e.g., Rev 1.0, Rev A"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    value={activityEditForm.progressPercent}
                    onChange={(e) => setActivityEditForm({ ...activityEditForm, progressPercent: e.target.value })}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${activityEditForm.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Revenue
                    </label>
                    <input
                      type="number"
                      value={activityEditForm.revenue}
                      onChange={(e) => setActivityEditForm({ ...activityEditForm, revenue: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={activityEditForm.currency}
                      onChange={(e) => setActivityEditForm({ ...activityEditForm, currency: e.target.value })}
                      className="input w-full"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditActivityModal(false);
                      setEditingActivity(null);
                    }}
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

      {/* Reassign Owner Modal */}
      {showReassignModal && (
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
                    Current Owner
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {project.owner?.firstName} {project.owner?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{project.owner?.email}</p>
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
                    {availableUsers.filter(u => u.id !== project.ownerId).map((user) => (
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

export default ProjectDetails;
