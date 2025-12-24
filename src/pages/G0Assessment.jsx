import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getG0Criteria, 
  getG0Assessment, 
  createG0Assessment, 
  updateG0Scores,
  submitG0Assessment,
  approveG0Assessment
} from '../services/api';
import { ArrowLeft, Save, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Fixed weights and score options based on criterion
const criterionConfig = {
  'Alignment with ROWAD strategy / visibility': { weight: 4.4, scores: [1, 3], comment: '1 = No alignment, 3 = Strong alignment' },
  'Client relationship & repeat potential': { weight: 4.4, scores: [1, 3], comment: '1 = Weak relationship/brand, 3 = Strong relationship/brand' },
  'Existing market / Operated Market / New market': { weight: 4.4, scores: [1, 2, 3], comment: '1 = New Market, 2 = market operated in since long, 3 = existing & operating market' },
  'Client financial strength & payment reliability': { weight: 4.4, scores: [1, 3], comment: '1 = Weak finances, 3 = Strong financials' },
  'Contract type & risk allocation': { weight: 4.4, scores: [1, 3], comment: '1 = Very unfavorable, 3 = Favorable terms' },
  'Project Estimated value / above ceiling or below ceiling': { weight: 12.0, scores: [1, 2, 3], comment: '1 = Below threshold, 2 = within threshold, 3 = High value' },
  'Payment terms & guarantees': { weight: 4.4, scores: [1, 3], comment: '1 = Very unfavorable, 3 = Favorable terms' },
  'Currency inflation exposure': { weight: 12.0, scores: [1, 3], comment: '1 = High exposure, 3 = Low exposure' },
  'Scope fit & technical capability': { weight: 12.0, scores: [1, 3], comment: '1 = No track record, 3 = Strong track record' },
  'Bid timeline feasibility': { weight: 12.0, scores: [1, 2, 3], comment: '1 = Impossible, 2 = within agreed time frame, 3 = Fully feasible' },
  'Political / Country risk / ease of doing business': { weight: 12.0, scores: [1, 3], comment: '1 = Very high risk, 3 = Very stable' },
  'Logistics / distance from HQ & regional offices': { weight: 4.4, scores: [1, 3], comment: '1 = Major logistical barriers, 3 = Easy access' },
  'Competition level & win probability': { weight: 4.4, scores: [1, 3], comment: '1 = RME being not competitive, 3 = RME being highly competitive' },
  'Impact on existing projects & management bandwidth': { weight: 4.4, scores: [1, 2, 3], comment: '1 = Negative impact, 2 = neutral, 3 = positive impact' }
};

const G0Assessment = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [criteria, setCriteria] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [scores, setScores] = useState({});
  const [weights, setWeights] = useState({}); // Store fixed weights
  const [comments, setComments] = useState({});
  const [submissionComment, setSubmissionComment] = useState('');
  const [approvalModal, setApprovalModal] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState('GO');
  const [approvalComments, setApprovalComments] = useState('');
  const [conditions, setConditions] = useState([]);
  const [goThreshold, setGoThreshold] = useState(2.5);
  const [conditionalThreshold, setConditionalThreshold] = useState(1.8);
  const [editingThresholds, setEditingThresholds] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      console.log('Loading G0 data for project:', projectId);
      
      // Load criteria first
      console.log('Fetching G0 criteria...');
      const criteriaData = await getG0Criteria();
      console.log('Criteria loaded:', criteriaData?.length, 'items');
      
      if (!criteriaData || criteriaData.length === 0) {
        throw new Error('No G0 criteria found. Please seed the database.');
      }
      
      setCriteria(criteriaData);
      
      // Initialize fixed weights based on criterion name
      const initialWeights = {};
      const defaultComments = {};
      criteriaData.forEach(c => {
        const config = criterionConfig[c.name];
        initialWeights[c.id] = config ? config.weight : 0;
        if (config && config.comment) {
          defaultComments[c.id] = config.comment;
        }
      });
      setWeights(initialWeights);
      console.log('Fixed weights initialized');

      // Load or create assessment
      console.log('Fetching G0 assessment...');
      let assessmentData = await getG0Assessment(projectId).catch((err) => {
        console.log('No existing assessment found, will create new one');
        return null;
      });

      if (assessmentData) {
        console.log('Existing assessment found:', assessmentData.id);
        setAssessment(assessmentData);
        // Populate scores from existing assessment
        const existingScores = {};
        const existingComments = {};
        const existingWeights = {};
        
        if (assessmentData.scores && assessmentData.scores.length > 0) {
          assessmentData.scores.forEach(s => {
            existingScores[s.criteriaId] = s.score;
            // Load user's custom comments if they exist
            if (s.comment) {
              existingComments[s.criteriaId] = s.comment;
            }
          });
          console.log('Loaded', assessmentData.scores.length, 'scores');
        }
        
        // Merge default comments with existing comments
        const mergedComments = { ...defaultComments, ...existingComments };
        
        setScores(existingScores);
        setComments(mergedComments);
      } else {
        // Create new assessment
        console.log('Creating new assessment...');
        const newAssessment = await createG0Assessment(projectId);
        console.log('New assessment created:', newAssessment.id);
        setAssessment(newAssessment);
        // Set default comments for new assessment
        setComments(defaultComments);
      }
      
      console.log('G0 data loaded successfully');
    } catch (error) {
      console.error('Failed to load G0 data:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.message || 'Failed to load G0 assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criteriaId, score) => {
    setScores(prev => ({ ...prev, [criteriaId]: score }));
  };

  const handleCommentChange = (criteriaId, comment) => {
    // Allow users to add additional notes to the default comment
    setComments(prev => ({ ...prev, [criteriaId]: comment }));
  };

  const getAvailableScores = (criterionName) => {
    const config = criterionConfig[criterionName];
    return config ? config.scores : [1, 2, 3];
  };

  // Weights are now fixed, no need for this function
  // const handleWeightChange = (criteriaId, weight) => {
  //   const numWeight = parseFloat(weight) || 0;
  //   setWeights(prev => ({ ...prev, [criteriaId]: numWeight }));
  // };

  const getTotalWeightPercentage = () => {
    return Object.values(weights).reduce((sum, w) => sum + w, 0);
  };

  const getTotalWeightedScore = () => {
    let total = 0;
    Object.entries(scores).forEach(([criteriaId, score]) => {
      const weight = weights[criteriaId] || 0;
      total += score * (weight / 100);
    });
    return total;
  };

  const getDecisionFromScore = (score) => {
    if (score >= goThreshold) return 'GO';
    if (score >= conditionalThreshold) return 'CONDITIONAL_GO';
    return 'NO_GO';
  };

  const getDecisionColor = (score) => {
    if (score >= goThreshold) return 'bg-green-600';
    if (score >= conditionalThreshold) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const handleSave = async (revertToDraft = false, redirect = false) => {
    setSaving(true);
    try {
      const scoreArray = Object.entries(scores).map(([criteriaId, score]) => ({
        criteriaId,
        score,
        comment: comments[criteriaId] || ''
      }));

      const updated = await updateG0Scores(projectId, scoreArray, revertToDraft);
      setAssessment(updated);
      if (revertToDraft) {
        toast.success('Assessment reverted to draft and saved');
      } else {
        toast.success('Scores saved successfully');
      }
      
      if (redirect) {
        navigate(`/projects/${projectId}`);
      } else {
        loadData(); // Reload to get fresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save scores');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await handleSave(false); // Save without reverting to draft
      await submitG0Assessment(projectId, submissionComment);
      const resubmit = assessment.status === 'SUBMITTED';
      toast.success(resubmit ? 'Assessment re-submitted for review' : 'Assessment submitted for review');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assessment');
    }
  };

  const handleApprove = async () => {
    try {
      await approveG0Assessment(projectId, approvalDecision, approvalComments, conditions);
      toast.success('Assessment approved successfully');
      setApprovalModal(false);
      navigate(`/projects/${projectId}`);
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

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'GO':
        return <span className="badge badge-success flex items-center space-x-1"><CheckCircle size={16} /><span>GO</span></span>;
      case 'CONDITIONAL_GO':
        return <span className="badge badge-warning flex items-center space-x-1"><AlertCircle size={16} /><span>CONDITIONAL GO</span></span>;
      case 'NO_GO':
        return <span className="badge badge-error flex items-center space-x-1"><XCircle size={16} /><span>NO-GO</span></span>;
      default:
        return <span className="badge badge-gray">PENDING</span>;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'badge-gray',
      SUBMITTED: 'badge-info',
      UNDER_REVIEW: 'badge-warning',
      APPROVED: 'badge-success',
      CONDITIONAL: 'badge-warning',
      REJECTED: 'badge-error'
    };
    return <span className={`badge ${badges[status] || 'badge-gray'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  console.log('Rendering G0Assessment:', {
    criteriaCount: criteria.length,
    assessmentId: assessment?.id,
    scoresCount: Object.keys(scores).length,
    weightsCount: Object.keys(weights).length
  });

  if (!assessment) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">Failed to load assessment. Please try again.</p>
        </div>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">No evaluation criteria found.</p>
          <p className="text-sm text-gray-400 mt-2">Please run: node prisma/seed-g0-criteria.js</p>
        </div>
      </div>
    );
  }

  // Allow editing for all statuses - users can update answers anytime
  const isEditable = assessment !== null;
  const isDraft = assessment && assessment.status === 'DRAFT';
  const isSubmitted = assessment && assessment.status === 'SUBMITTED';
  const isApproved = assessment && ['APPROVED', 'CONDITIONAL', 'REJECTED'].includes(assessment.status);
  const canApprove = user?.role === 'C_LEVEL' && assessment && ['SUBMITTED', 'UNDER_REVIEW'].includes(assessment.status);
  const allScored = criteria.every(c => scores[c.id]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Link to={`/projects/${projectId}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Project
        </Link>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">G0 Opportunity Assessment</h1>
                  <p className="text-gray-600">Evaluate whether to pursue this opportunity</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(assessment?.status)}
                  {assessment && assessment.decision !== 'PENDING' && (
                    <div className="mt-2">{getDecisionBadge(assessment.decision)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Criteria */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Evaluation Criteria</h2>
                  <p className="text-sm text-gray-600 mt-1">Score each criterion from 1 (Weak) to 3 (Strong)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Weighted Score</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {getTotalWeightedScore().toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Weight Sum: {getTotalWeightPercentage().toFixed(1)}%
                    {Math.abs(getTotalWeightPercentage() - 100) >= 0.1 && (
                      <span className="text-red-600"> (Should be 100%)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Group criteria by category */}
                {[...new Set(criteria.map(c => c.category))].map(category => (
                  <div key={category} className="border-l-4 border-primary-600 pl-4">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{category}</h3>
                    <div className="space-y-3">
                      {criteria.filter(c => c.category === category).map((criterion) => (
                        <div key={criterion.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{criterion.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{criterion.description}</p>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              {/* Weight Display (Fixed) */}
                              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded">
                                <span className="text-sm font-semibold text-gray-700">{weights[criterion.id] !== undefined ? weights[criterion.id].toFixed(1) : '0.0'}</span>
                                <span className="text-xs text-gray-500">%</span>
                              </div>
                              {/* Score Buttons - Dynamic based on criterion */}
                              <div className="flex space-x-2">
                                {getAvailableScores(criterion.name).map((score) => (
                                  <button
                                    key={score}
                                    onClick={() => isEditable && handleScoreChange(criterion.id, score)}
                                    disabled={!isEditable}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                      scores[criterion.id] === score
                                        ? 'border-primary-600 bg-primary-600 text-white font-semibold'
                                        : 'border-gray-300 hover:border-primary-400'
                                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  >
                                    {score}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Show weighted score if scored */}
                          {scores[criterion.id] && (
                            <p className="text-xs text-gray-600 mt-2">
                              Weighted Score: {(scores[criterion.id] * ((weights[criterion.id] || 0) / 100)).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions for DRAFT assessments */}
            {isDraft && (
              <div className="card">
                <h3 className="font-semibold mb-4">Submit Assessment</h3>
                <textarea
                  className="input mb-4"
                  rows="3"
                  placeholder="Add overall comments (optional)..."
                  value={submissionComment}
                  onChange={(e) => setSubmissionComment(e.target.value)}
                />
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || !allScored}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!allScored}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Send size={18} />
                    <span>Submit for Review</span>
                  </button>
                </div>
                {!allScored && (
                  <p className="text-sm text-red-600 mt-2">Please score all criteria before submitting</p>
                )}
              </div>
            )}

            {/* Actions for SUBMITTED assessments */}
            {isSubmitted && (
              <div className="card">
                <h3 className="font-semibold mb-4">Save Changes</h3>
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Assessment submitted for review</p>
                      <p className="text-sm text-amber-800 mt-1">
                        You can still make changes and either save them or revert to draft status for more extensive edits.
                      </p>
                    </div>
                  </div>
                </div>
                <textarea
                  className="input mb-4"
                  rows="3"
                  placeholder="Add overall comments (optional)..."
                  value={submissionComment}
                  onChange={(e) => setSubmissionComment(e.target.value)}
                />
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSave(false, true)}
                    disabled={saving || !allScored}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                {!allScored && (
                  <p className="text-sm text-red-600 mt-2">Please score all criteria before re-submitting</p>
                )}
              </div>
            )}

            {/* Actions for APPROVED/CONDITIONAL/REJECTED assessments */}
            {isApproved && (
              <div className="card">
                <h3 className="font-semibold mb-4">Update Approved Assessment</h3>
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Assessment has been approved</p>
                      <p className="text-sm text-blue-800 mt-1">
                        You can update the answers and revert this assessment to draft status. This will clear the current approval and require re-submission.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || !allScored}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <AlertCircle size={18} />
                    <span>{saving ? 'Reverting...' : 'Revert to Draft & Clear Approval'}</span>
                  </button>
                </div>
                {!allScored && (
                  <p className="text-sm text-red-600 mt-2">Please score all criteria before saving</p>
                )}
              </div>
            )}

            {/* Approval Section for C-Level */}
            {canApprove && (
              <div className="card">
                <h3 className="font-semibold mb-4">Approve Assessment</h3>
                <button
                  onClick={() => setApprovalModal(true)}
                  className="btn btn-primary"
                >
                  Make Decision
                </button>
              </div>
            )}
          </div>

          {/* Sticky Right Sidebar */}
          <div className="w-80">
            <div className="sticky top-6">
              <div className="card bg-gradient-primary text-white">
                <h3 className="text-lg font-semibold mb-4">Current Score</h3>
                
                {assessment && scores && Object.keys(scores).length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold mb-2">{getTotalWeightedScore().toFixed(2)}</div>
                      <div className="text-sm opacity-90">out of 3.00</div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Decision</span>
                        <span className={`badge ${
                          getTotalWeightedScore() >= goThreshold ? 'badge-success' :
                          getTotalWeightedScore() >= conditionalThreshold ? 'badge-warning' : 'badge-error'
                        }`}>
                          {getDecisionFromScore(getTotalWeightedScore())}
                        </span>
                      </div>
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-3 relative">
                        <div
                          className="h-3 rounded-full transition-all bg-white"
                          style={{ width: `${Math.min((getTotalWeightedScore() / 3) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span>No-Go</span>
                        <span>&lt; {conditionalThreshold}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span>Conditional</span>
                        <span>{conditionalThreshold} - {goThreshold}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Go</span>
                        <span>≥ {goThreshold}</span>
                      </div>
                    </div>

                    <div className="border-t border-white border-opacity-30 pt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Scored Criteria</span>
                        <span className="font-semibold">{Object.keys(scores).length} / {criteria.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Weight</span>
                        <span className="font-semibold">{getTotalWeightPercentage().toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Threshold Editor */}
                    <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                      <button
                        onClick={() => setEditingThresholds(!editingThresholds)}
                        className="text-sm text-white hover:text-gray-100 underline"
                      >
                        {editingThresholds ? 'Hide' : 'Edit'} Decision Thresholds
                      </button>
                      {editingThresholds && (
                        <div className="mt-3 space-y-2">
                          <div>
                            <label className="text-xs">Go Threshold (≥)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="3"
                              className="input text-sm mt-1 text-gray-900"
                              value={goThreshold}
                              onChange={(e) => setGoThreshold(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="text-xs">Conditional Threshold (≥)</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="3"
                              className="input text-sm mt-1 text-gray-900"
                              value={conditionalThreshold}
                              onChange={(e) => setConditionalThreshold(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm opacity-90">Start scoring criteria to see your results</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Approve G0 Assessment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Decision *</label>
                <select
                  className="input"
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                >
                  <option value="GO">GO - Proceed with full pursuit</option>
                  <option value="CONDITIONAL_GO">CONDITIONAL GO - Proceed with conditions</option>
                  <option value="NO_GO">NO-GO - Do not pursue</option>
                </select>
              </div>

              <div>
                <label className="label">Comments</label>
                <textarea
                  className="input"
                  rows="3"
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Add decision rationale..."
                />
              </div>

              {approvalDecision === 'CONDITIONAL_GO' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">Conditions *</label>
                    <button onClick={addCondition} className="text-sm text-primary-600 hover:text-primary-800">
                      + Add Condition
                    </button>
                  </div>
                  {conditions.map((cond, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg mb-2">
                      <input
                        type="text"
                        className="input mb-2"
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
                          className="text-red-600 hover:text-red-800"
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

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setApprovalModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approvalDecision === 'CONDITIONAL_GO' && conditions.length === 0}
                  className="btn btn-primary"
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

export default G0Assessment;
