import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.10.11.245:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get('/auth/users');
  return data.data;
};

// Project APIs
export const getProjects = async (filters = {}) => {
  const { data } = await api.get('/projects', { params: filters });
  return data.data;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data.data;
};

export const createProject = async (projectData) => {
  const { data } = await api.post('/projects', projectData);
  return data.data;
};

export const updateProject = async (id, projectData) => {
  const { data } = await api.put(`/projects/${id}`, projectData);
  return data.data;
};

export const reassignProjectOwner = async (id, newOwnerId) => {
  const { data } = await api.patch(`/projects/${id}/reassign`, { newOwnerId });
  return data.data;
};

export const updateProjectStage = async (id, stage) => {
  const { data } = await api.patch(`/projects/${id}/stage`, { stage });
  return data.data;
};

export const recordGoDecision = async (id, decisionData) => {
  const { data } = await api.post(`/projects/${id}/go-decision`, decisionData);
  return data.data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};

// Stakeholder APIs
export const getStakeholders = async (filters = {}) => {
  const { data } = await api.get('/stakeholders', { params: filters });
  return data.data;
};

export const getStakeholderById = async (id) => {
  const { data } = await api.get(`/stakeholders/${id}`);
  return data.data;
};

export const createStakeholder = async (stakeholderData) => {
  const { data } = await api.post('/stakeholders', stakeholderData);
  return data.data;
};

export const updateStakeholder = async (id, stakeholderData) => {
  const { data } = await api.put(`/stakeholders/${id}`, stakeholderData);
  return data.data;
};

export const deleteStakeholder = async (id) => {
  const { data } = await api.delete(`/stakeholders/${id}`);
  return data;
};

export const linkStakeholderToProject = async (stakeholderId, projectId, role, isPrimary = false) => {
  const { data } = await api.post(`/stakeholders/${stakeholderId}/link-project`, {
    projectId,
    role,
    isPrimary
  });
  return data.data;
};

// Pursuit APIs
export const getPursuits = async (filters = {}) => {
  const { data } = await api.get('/pursuits', { params: filters });
  return data.data;
};

export const getPursuitById = async (id) => {
  const { data } = await api.get(`/pursuits/${id}`);
  return data.data;
};

export const createPursuit = async (pursuitData) => {
  const { data } = await api.post('/pursuits', pursuitData);
  return data.data;
};

export const updatePursuit = async (id, pursuitData) => {
  const { data } = await api.put(`/pursuits/${id}`, pursuitData);
  return data.data;
};

export const updatePursuitProgress = async (id, progressData) => {
  const { data } = await api.patch(`/pursuits/${id}/progress`, progressData);
  return data.data;
};

export const calculateGoScore = async (id) => {
  const { data } = await api.post(`/pursuits/${id}/calculate-score`);
  return data.data;
};

export const updatePursuitFinancials = async (id, financialData) => {
  const { data } = await api.put(`/pursuits/${id}/financials`, financialData);
  return data.data;
};

// Report APIs
export const getBDPerformance = async (filters = {}) => {
  const { data } = await api.get('/reports/bd-performance', { params: filters });
  return data.data;
};

export const getWinRate = async (filters = {}) => {
  const { data } = await api.get('/reports/win-rate', { params: filters });
  return data.data;
};

export const getPipelineAnalytics = async () => {
  const { data } = await api.get('/reports/pipeline');
  return data.data;
};

export const getSectorBreakdown = async (filters = {}) => {
  const { data } = await api.get('/reports/sector-breakdown', { params: filters });
  return data.data;
};

export const getRegionBreakdown = async (filters = {}) => {
  const { data } = await api.get('/reports/region-breakdown', { params: filters });
  return data.data;
};

export const getBidHistory = async (filters = {}) => {
  const { data } = await api.get('/reports/bid-history', { params: filters });
  return data.data;
};

// Analytics APIs
export const getDashboardMetrics = async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data.data;
};

export const getWinProbability = async (pursuitId) => {
  const { data } = await api.get(`/analytics/win-probability/${pursuitId}`);
  return data.data;
};

export const getRevenueForecast = async (period = 90) => {
  const { data } = await api.get('/analytics/revenue-forecast', { params: { period } });
  return data.data;
};

// Document APIs
export const uploadDocument = async (formData) => {
  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.data;
};

export const getDocuments = async (filters = {}) => {
  const { data } = await api.get('/documents', { params: filters });
  return data.data;
};

export const deleteDocument = async (id) => {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
};

// Engagement APIs
export const getEngagements = async (filters = {}) => {
  const { data } = await api.get('/engagements', { params: filters });
  return data.data;
};

export const createEngagement = async (engagementData) => {
  const { data } = await api.post('/engagements', engagementData);
  return data.data;
};

export const updateEngagement = async (id, engagementData) => {
  const { data } = await api.put(`/engagements/${id}`, engagementData);
  return data.data;
};

// Event APIs
export const getEvents = async (filters = {}) => {
  const { data } = await api.get('/events', { params: filters });
  return data.data;
};

export const getUpcomingEvents = async (days = 30) => {
  const { data } = await api.get('/events/upcoming', { params: { days } });
  return data.data;
};

export const createEvent = async (eventData) => {
  const { data } = await api.post('/events', eventData);
  return data.data;
};

export const updateEvent = async (id, eventData) => {
  const { data } = await api.put(`/events/${id}`, eventData);
  return data.data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

// Search API
export const globalSearch = async (query, type = null) => {
  const { data } = await api.get('/search', { params: { q: query, type } });
  return data.data;
};

// G0 Assessment APIs
export const getG0Criteria = async () => {
  const { data } = await api.get('/g0/criteria');
  return data.data.all; // Return the array of criteria, not the object
};

export const getG0Assessment = async (projectId) => {
  const { data } = await api.get(`/g0/project/${projectId}`);
  return data.data;
};

export const getG0Assessments = async () => {
  const { data } = await api.get('/g0/assessments');
  return data.data;
};

export const createG0Assessment = async (projectId) => {
  const { data } = await api.post(`/g0/project/${projectId}`);
  return data.data;
};

export const updateG0Scores = async (projectId, scores, revertToDraft = false) => {
  const { data } = await api.put(`/g0/project/${projectId}/scores`, { scores, revertToDraft });
  return data.data;
};

export const submitG0Assessment = async (projectId, comments) => {
  const { data } = await api.post(`/g0/project/${projectId}/submit`, { comments });
  return data.data;
};

export const approveG0Assessment = async (projectId, decision, comments, conditions = []) => {
  const { data } = await api.post(`/g0/project/${projectId}/approve`, {
    decision,
    comments,
    conditions
  });
  return data.data;
};

export const updateConditionStatus = async (conditionId, status, notes) => {
  const { data } = await api.patch(`/g0/conditions/${conditionId}`, { status, notes });
  return data.data;
};

// Team Workload APIs
export const getTeamWorkload = async () => {
  const { data } = await api.get('/team/workload');
  return data.data;
};

export const getUserWorkload = async (userId) => {
  const { data } = await api.get(`/team/workload/${userId}`);
  return data.data;
};

// Profile APIs
export const updateProfile = async (profileData) => {
  const { data } = await api.put('/auth/profile', profileData);
  return data.data;
};

export const changePassword = async (passwordData) => {
  const { data } = await api.put('/auth/password', passwordData);
  return data;
};

// Milestone APIs
export const getMilestones = async (filters = {}) => {
  const { data } = await api.get('/milestones', { params: filters });
  return data.data;
};

export const getMilestoneById = async (id) => {
  const { data } = await api.get(`/milestones/${id}`);
  return data.data;
};

export const createMilestone = async (milestoneData) => {
  const { data } = await api.post('/milestones', milestoneData);
  return data.data;
};

export const updateMilestone = async (id, milestoneData) => {
  const { data } = await api.put(`/milestones/${id}`, milestoneData);
  return data.data;
};

export const deleteMilestone = async (id) => {
  const { data } = await api.delete(`/milestones/${id}`);
  return data;
};

export default api;
