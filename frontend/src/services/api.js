import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Email Analysis
export const analyzeEmail = async (emailData) => {
  const response = await api.post('/api/analysis/analyze', emailData);
  return response.data;
};

export const getAnalysis = async (analysisId) => {
  const response = await api.get(`/api/analysis/analysis/${analysisId}`);
  return response.data;
};

export const getRecentAnalyses = async (limit = 10) => {
  const response = await api.get(`/api/analysis/recent?limit=${limit}`);
  return response.data;
};

// Sandbox Analysis
export const analyzeSandbox = async (url, emailAnalysisId = null) => {
  const response = await api.post('/api/sandbox/analyze', {
    url,
    email_analysis_id: emailAnalysisId,
  });
  return response.data;
};

export const batchAnalyzeSandbox = async (urls, emailAnalysisId = null) => {
  const response = await api.post('/api/sandbox/batch-analyze', {
    urls,
    email_analysis_id: emailAnalysisId,
  });
  return response.data;
};

export const getSandboxReport = async (reportId) => {
  const response = await api.get(`/api/sandbox/report/${reportId}`);
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};

export const getWeeklyActivity = async () => {
  const response = await api.get('/api/dashboard/weekly-activity');
  return response.data;
};

export const getRecentThreats = async (limit = 10) => {
  const response = await api.get(`/api/dashboard/recent-threats?limit=${limit}`);
  return response.data;
};

export const getTopThreats = async () => {
  const response = await api.get('/api/dashboard/top-threats');
  return response.data;
};

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
