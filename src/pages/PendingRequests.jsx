import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getG0Assessments, approveG0Assessment } from '../services/api';
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle, Building2, Users, DollarSign, Calendar, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const PendingRequests = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending' or 'approved'
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState('GO');
  const [approvalComments, setApprovalComments] = useState('');
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    loadPendingAssessments();

    // Reload data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPendingAssessments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadPendingAssessments = async () => {
    try {
      setLoading(true);
      const data = await getG0Assessments();
      setAssessments(data);
      filterAssessments(data, activeFilter);
    } catch (error) {
      console.error('Failed to load assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filterAssessments = (data, filter) => {
    if (filter === 'pending') {
      const pending = data.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status));
      setFilteredAssessments(pending);
    } else {
      const approved = data.filter(a => ['APPROVED', 'CONDITIONAL', 'REJECTED'].includes(a.status));
      setFilteredAssessments(approved);
    }
  };

  useEffect(() => {
    filterAssessments(assessments, activeFilter);
  }, [activeFilter, assessments]);

  const handleOpenApprovalModal = (assessment) => {
    setSelectedAssessment(assessment);
    setShowApprovalModal(true);
    setApprovalDecision('GO');
    setApprovalComments('');
    setConditions([]);
  };

  const handleOpenDetailModal = (assessment) => {
    setSelectedAssessment(assessment);
    setShowDetailModal(true);
  };

  const handleApprove = async () => {
    try {
      await approveG0Assessment(
        selectedAssessment.projectId,
        approvalDecision,
        approvalComments,
        conditions
      );
      toast.success('Assessment approved successfully');
      setShowApprovalModal(false);
      setSelectedAssessment(null);
      loadPendingAssessments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve assessment');
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { condition: '', responsibleId: null, dueDate: '', notes: '' }]);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index, field, value) => {
    const updated = [...conditions];
    updated[index][field] = value;
    setConditions(updated);
  };

  const getDecisionColor = (score) => {
    if (score >= 2.5) return 'text-green-600';
    if (score >= 1.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 2.5) return 'GO';
    if (score >= 1.8) return 'CONDITIONAL';
    return 'NO-GO';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Pending G0 Assessment Approvals
          </h1>
          <p className="text-gray-600 text-lg">Review and approve submitted G0 assessments</p>
        </div>
        <button
          onClick={loadPendingAssessments}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-primary hover:shadow-glow text-white rounded-lg transition-all duration-300 font-semibold disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeFilter === 'pending'
              ? 'bg-gradient-primary text-white shadow-medium'
              : 'bg-white/95 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Pending ({assessments.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length})
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeFilter === 'approved'
              ? 'bg-gradient-primary text-white shadow-medium'
              : 'bg-white/95 text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Reviewed ({assessments.filter(a => ['APPROVED', 'CONDITIONAL', 'REJECTED'].includes(a.status)).length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
              <ClipboardCheck size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {activeFilter === 'pending' 
                  ? assessments.filter(a => ['SUBMITTED', 'UNDER_REVIEW'].includes(a.status)).length
                  : assessments.filter(a => ['APPROVED', 'CONDITIONAL', 'REJECTED'].includes(a.status)).length
                }
              </p>
              <p className="text-sm text-gray-600">{activeFilter === 'pending' ? 'Pending Approvals' : 'Reviewed'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {assessments.filter(a => a.totalScore >= 2.5).length}
              </p>
              <p className="text-sm text-gray-600">Recommended GO</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
              <AlertCircle size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {assessments.filter(a => a.totalScore >= 1.8 && a.totalScore < 2.5).length}
              </p>
              <p className="text-sm text-gray-600">Conditional</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-large border border-gray-200/50 p-12 text-center">
          <ClipboardCheck size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeFilter === 'pending' ? 'No Pending Approvals' : 'No Reviewed Assessments'}
          </h3>
          <p className="text-gray-600">
            {activeFilter === 'pending' 
              ? 'All G0 assessments have been reviewed'
              : 'No assessments have been reviewed yet'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssessments.map((assessment) => {
            const score = (assessment.totalScore / assessment.maxScore) * 3;
            return (
              <div
                key={assessment.id}
                className="bg-white/95 backdrop-blur-lg rounded-xl shadow-medium hover:shadow-large border border-gray-200/50 p-6 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Project Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                        <Building2 size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {assessment.project?.name || 'Unknown Project'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {assessment.project?.region}, {assessment.project?.country}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                            {assessment.project?.stage}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Client Info */}
                    {assessment.project?.stakeholders && assessment.project.stakeholders.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4 text-sm text-gray-700">
                        <Users size={16} className="text-gray-500" />
                        <span className="font-medium">Clients:</span>
                        <span>
                          {assessment.project.stakeholders
                            .map(s => s.stakeholder?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Project Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Contract Value</p>
                          <p className="font-semibold text-gray-900">
                            {assessment.project?.currency} {(assessment.project?.contractValue || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Building2 size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Sector</p>
                          <p className="font-semibold text-gray-900">{assessment.project?.sector}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Submitted</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(assessment.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users size={16} className="text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Owner</p>
                          <p className="font-semibold text-gray-900">
                            {assessment.project?.owner?.firstName} {assessment.project?.owner?.lastName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submission Comments */}
                    {assessment.comments && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
                          Submission Comments
                        </p>
                        <p className="text-sm text-gray-700 italic">"{assessment.comments}"</p>
                        {assessment.submittedBy && (
                          <p className="text-xs text-gray-600 mt-2">
                            — {assessment.submittedBy.firstName} {assessment.submittedBy.lastName}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Score & Actions */}
                  <div className="ml-6 flex flex-col items-end space-y-4">
                    <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-4 rounded-xl border border-blue-200">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                        Score
                      </p>
                      <p className={`text-4xl font-bold ${getDecisionColor(score)}`}>
                        {score.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">/ 3.00</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        score >= 2.5 ? 'bg-green-100 text-green-800' :
                        score >= 1.8 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {getScoreLabel(score)}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                      <button
                        onClick={() => handleOpenDetailModal(assessment)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:shadow-soft text-gray-700 rounded-lg transition-all duration-200 font-medium border border-gray-300"
                      >
                        <Eye size={16} />
                        <span>View Details</span>
                      </button>
                      {activeFilter === 'pending' && (
                        <button
                          onClick={() => handleOpenApprovalModal(assessment)}
                          className="px-4 py-2 bg-gradient-primary hover:shadow-glow text-white rounded-lg transition-all duration-300 font-semibold"
                        >
                          Review & Approve
                        </button>
                      )}
                      {activeFilter === 'approved' && assessment.approvedBy && (
                        <div className="text-xs text-gray-600 text-center mt-2">
                          <p>Approved by {assessment.approvedBy.firstName} {assessment.approvedBy.lastName}</p>
                          <p>{new Date(assessment.approvedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail View Modal */}
      {showDetailModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">G0 Assessment Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={28} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Project Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Project Name</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Region / Country</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.region}, {selectedAssessment.project?.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sector</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.sector}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contract Value</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.currency} {(selectedAssessment.project?.contractValue || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.owner?.firstName} {selectedAssessment.project?.owner?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Stage</p>
                    <p className="font-semibold text-gray-900">{selectedAssessment.project?.stage}</p>
                  </div>
                </div>
              </div>

              {/* Overall Score */}
              <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Overall Assessment Score</p>
                <p className="text-6xl font-bold text-blue-600">
                  {((selectedAssessment.totalScore / selectedAssessment.maxScore) * 3).toFixed(2)}
                </p>
                <p className="text-lg text-gray-600 mt-2">out of 3.00</p>
                <p className="text-sm text-gray-600 mt-2">
                  ({selectedAssessment.totalScore.toFixed(2)} / {selectedAssessment.maxScore.toFixed(2)} weighted)
                </p>
              </div>

              {/* Individual Criteria Scores */}
              {selectedAssessment.scores && selectedAssessment.scores.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Detailed Scores by Criteria</h4>
                  <div className="space-y-3">
                    {selectedAssessment.scores.map((score) => (
                      <div key={score.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{score.criteria?.name}</p>
                          {score.criteria?.description && (
                            <p className="text-sm text-gray-600 mt-1">{score.criteria.description}</p>
                          )}
                          {score.comment && (
                            <p className="text-sm text-blue-600 italic mt-2">Comment: {score.comment}</p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-blue-600">{score.score}</p>
                          <p className="text-xs text-gray-500">/ {score.criteria?.maxScore}</p>
                          <p className="text-xs text-gray-600 mt-1">Weight: {score.criteria?.weight}x</p>
                          <p className="text-sm font-semibold text-gray-700 mt-1">
                            Weighted: {score.weightedScore.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Comments */}
              {selectedAssessment.comments && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-2">Submission Comments</p>
                  <p className="text-sm text-gray-700 italic">"{selectedAssessment.comments}"</p>
                  {selectedAssessment.submittedBy && (
                    <p className="text-xs text-gray-600 mt-2">
                      — {selectedAssessment.submittedBy.firstName} {selectedAssessment.submittedBy.lastName}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Approve G0 Assessment</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedAssessment.project?.name}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Region:</span>
                    <span className="ml-2 font-medium">{selectedAssessment.project?.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Country:</span>
                    <span className="ml-2 font-medium">{selectedAssessment.project?.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sector:</span>
                    <span className="ml-2 font-medium">{selectedAssessment.project?.sector}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Score:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      {((selectedAssessment.totalScore / selectedAssessment.maxScore) * 3).toFixed(2)} / 3.00
                    </span>
                  </div>
                </div>
                {selectedAssessment.project?.stakeholders && selectedAssessment.project.stakeholders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-gray-600 text-sm">Clients:</span>
                    <span className="ml-2 font-medium text-sm">
                      {selectedAssessment.project.stakeholders
                        .map(s => s.stakeholder?.name)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Decision */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Decision *</label>
                <select
                  className="input w-full"
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                >
                  <option value="GO">GO - Proceed with full pursuit</option>
                  <option value="CONDITIONAL_GO">CONDITIONAL GO - Proceed with conditions</option>
                  <option value="NO_GO">NO-GO - Do not pursue</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
                <textarea
                  className="input w-full"
                  rows="4"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add decision rationale..."
                />
              </div>

              {/* Conditions (if Conditional GO) */}
              {approvalDecision === 'CONDITIONAL_GO' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">Conditions *</label>
                    <button
                      onClick={addCondition}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      + Add Condition
                    </button>
                  </div>
                  {conditions.map((cond, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg mb-3 bg-gray-50">
                      <input
                        type="text"
                        className="input w-full mb-2"
                        placeholder="Condition description"
                        value={cond.condition}
                        onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <input
                          type="date"
                          className="input flex-1"
                          value={cond.dueDate}
                          onChange={(e) => updateCondition(index, 'dueDate', e.target.value)}
                        />
                        <button
                          onClick={() => removeCondition(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {conditions.length === 0 && (
                    <p className="text-sm text-red-600">At least one condition is required for Conditional Go</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approvalDecision === 'CONDITIONAL_GO' && conditions.length === 0}
                  className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
