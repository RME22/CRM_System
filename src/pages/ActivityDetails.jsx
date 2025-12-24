import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPursuitById, updatePursuit } from '../services/api';
import { ArrowLeft, TrendingUp, Users, FileText, DollarSign, Edit, MessageCircle, Edit3, XCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PursuitDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [pursuit, setPursuit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [chatComments, setChatComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [quickEditData, setQuickEditData] = useState({
    revision: '',
    progressPercent: 0,
    revenue: '',
    currency: 'USD'
  });

  useEffect(() => {
    loadPursuit();
  }, [id]);

  const loadPursuit = async () => {
    try {
      const data = await getPursuitById(id);
      setPursuit(data);
      
      // Load chat comments
      if (data.comment) {
        try {
          const parsed = JSON.parse(data.comment);
          setChatComments(Array.isArray(parsed) ? parsed : []);
        } catch {
          setChatComments([]);
        }
      }
      
      // Set quick edit data
      setQuickEditData({
        revision: data.projectSize || '',
        progressPercent: data.progressPercent || 0,
        revenue: data.contractValue || '',
        currency: data.currency || 'USD'
      });
    } catch (error) {
      console.error('Failed to load pursuit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const comment = {
      text: newComment,
      userName: `${user.firstName} ${user.lastName}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedComments = [...chatComments, comment];
    
    try {
      await updatePursuit(id, {
        comment: JSON.stringify(updatedComments)
      });
      setChatComments(updatedComments);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleQuickEdit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedComments = [...chatComments];
      
      // Add system messages for changes
      if (quickEditData.revision !== (pursuit.projectSize || '')) {
        updatedComments.push({
          text: `📝 Changed Revision: "${pursuit.projectSize || 'None'}" → "${quickEditData.revision}"`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      if (parseInt(quickEditData.progressPercent) !== parseInt(pursuit.progressPercent)) {
        updatedComments.push({
          text: `📊 Updated Progress: ${pursuit.progressPercent}% → ${quickEditData.progressPercent}%`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      if (parseFloat(quickEditData.revenue || 0) !== parseFloat(pursuit.contractValue || 0)) {
        updatedComments.push({
          text: `💰 Updated Revenue: ${pursuit.currency || 'USD'} ${(pursuit.contractValue || 0).toLocaleString()} → ${quickEditData.currency} ${parseFloat(quickEditData.revenue || 0).toLocaleString()}`,
          userName: `${user.firstName} ${user.lastName}`,
          timestamp: new Date().toISOString(),
          isSystemMessage: true
        });
      }
      
      await updatePursuit(id, {
        revision: quickEditData.revision,
        progressPercent: parseInt(quickEditData.progressPercent),
        revenue: quickEditData.revenue ? parseFloat(quickEditData.revenue) : null,
        currency: quickEditData.currency,
        comment: JSON.stringify(updatedComments)
      });
      
      toast.success('Activity updated');
      setShowQuickEditModal(false);
      loadPursuit();
    } catch (error) {
      toast.error('Failed to update activity');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pursuit) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">Pursuit not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link to="/activities" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Activities
      </Link>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{pursuit.clientName || pursuit.title}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowChatModal(true)}
                  className="btn btn-primary btn-sm flex items-center space-x-2"
                  title="Add Comment"
                >
                  <MessageCircle size={16} />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setShowQuickEditModal(true)}
                  className="btn btn-secondary btn-sm flex items-center space-x-2"
                  title="Quick Edit"
                >
                  <Edit3 size={16} />
                  <span>Quick Edit</span>
                </button>
                <Link 
                  to={`/activities/${pursuit.id}/edit`}
                  className="btn btn-secondary btn-sm flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Full Edit</span>
                </Link>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{pursuit.region}, {pursuit.country}</p>
            <div className="flex items-center space-x-3">
              <span className={`badge ${
                pursuit.status === 'EXCELLENT' ? 'badge-success' :
                pursuit.status === 'POOR' ? 'badge-danger' : 'badge-warning'
              }`}>
                {pursuit.status}
              </span>
              <span className="badge badge-info">{pursuit.currentStage}</span>
              {pursuit.projectSize && (
                <span className="badge badge-gray">{pursuit.projectSize}</span>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Progress</p>
            <p className="text-4xl font-bold text-primary-600">{pursuit.progressPercent}%</p>
            <div className="w-32 bg-gray-200 rounded-full h-3 mt-2">
              <div
                className="bg-primary-600 h-3 rounded-full"
                style={{ width: `${pursuit.progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'overview'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('stakeholders')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'stakeholders'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Stakeholders ({pursuit.stakeholders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'documents'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Documents ({pursuit.documents?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`pb-4 border-b-2 font-medium ${
                activeTab === 'financials'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Financials
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Owner</p>
                  <p className="font-medium">
                    {pursuit.owner.firstName} {pursuit.owner.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium">
                    {new Date(pursuit.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                {pursuit.bidSubmissionDate && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bid Submission</p>
                    <p className="font-medium">
                      {new Date(pursuit.bidSubmissionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Engagements */}
              {pursuit.engagements && pursuit.engagements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Engagements</h3>
                  <div className="space-y-3">
                    {pursuit.engagements.slice(0, 5).map((engagement) => (
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
                        {engagement.notes && (
                          <p className="text-sm text-gray-600 mb-2">{engagement.notes}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(engagement.engagementDate).toLocaleDateString()} - 
                          {engagement.user.firstName} {engagement.user.lastName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Go Score */}
              {pursuit.goScores && pursuit.goScores.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Latest Go Score</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold">{pursuit.goScores[0].score}/100</span>
                      <span className="badge badge-info">{pursuit.goScores[0].recommendation}</span>
                    </div>
                    {pursuit.goScores[0].topPositiveFactors.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-700 mb-1">Strengths:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {pursuit.goScores[0].topPositiveFactors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pursuit.goScores[0].topRiskFactors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-700 mb-1">Risks:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {pursuit.goScores[0].topRiskFactors.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stakeholders Tab */}
          {activeTab === 'stakeholders' && (
            <div>
              {pursuit.stakeholders && pursuit.stakeholders.length > 0 ? (
                <div className="space-y-3">
                  {pursuit.stakeholders.map((ps) => (
                    <div key={ps.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{ps.stakeholder.name}</h4>
                          <p className="text-sm text-gray-600">{ps.role || ps.stakeholderType}</p>
                          {ps.contactName && (
                            <p className="text-sm text-gray-600 mt-1">Contact: {ps.contactName}</p>
                          )}
                          {ps.contactEmail && (
                            <p className="text-sm text-gray-600">Email: {ps.contactEmail}</p>
                          )}
                        </div>
                        <span className="badge badge-info">{ps.stakeholderType}</span>
                      </div>
                      {ps.notes && (
                        <p className="text-sm text-gray-600 mt-2">{ps.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No stakeholders added yet</p>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              {pursuit.documents && pursuit.documents.length > 0 ? (
                <div className="space-y-3">
                  {pursuit.documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText size={24} className="text-gray-400" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-gray-600">
                            {doc.folder && `${doc.folder} • `}
                            {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
              )}
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === 'financials' && (
            <div>
              {pursuit.financials && pursuit.financials.length > 0 ? (
                <div className="space-y-4">
                  {pursuit.financials.map((financial) => (
                    <div key={financial.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Contract Value</p>
                        <p className="text-2xl font-bold">
                          {financial.currency} {financial.contractValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Payment Reliability</p>
                        <p className="text-lg font-semibold">{financial.paymentReliability || 'N/A'}</p>
                      </div>
                      {financial.marginEstimate && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Margin Estimate</p>
                          <p className="text-lg font-semibold">{financial.marginEstimate}%</p>
                        </div>
                      )}
                      {financial.currencyInflationRisk && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Currency Risk</p>
                          <p className="text-lg font-semibold">{financial.currencyInflationRisk}</p>
                        </div>
                      )}
                      {financial.paymentTerms && (
                        <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <p className="text-sm text-gray-600 mb-1">Payment Terms</p>
                          <p className="text-sm">{financial.paymentTerms}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No financial information available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Activity Chat</h3>
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
      {showQuickEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Edit3 className="text-primary-600" size={24} />
                  <h3 className="text-xl font-bold text-gray-900">Quick Edit</h3>
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
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Revenue</label>
                    <input
                      type="number"
                      value={quickEditData.revenue}
                      onChange={(e) => setQuickEditData({ ...quickEditData, revenue: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={quickEditData.currency}
                      onChange={(e) => setQuickEditData({ ...quickEditData, currency: e.target.value })}
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

export default PursuitDetails;
