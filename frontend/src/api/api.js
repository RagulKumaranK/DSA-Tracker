import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Problems
export const getProblems = (params = {}) => api.get('/problems', { params });
export const getProblem = (id) => api.get(`/problems/${id}`);
export const createProblem = (data) => api.post('/problems', data);
export const updateProblem = (id, data) => api.put(`/problems/${id}`, data);
export const deleteProblem = (id) => api.delete(`/problems/${id}`);
export const getTopics = () => api.get('/problems/topics');

// Revisions
export const getTodayRevisions = () => api.get('/revisions/today');
export const getUpcomingRevisions = () => api.get('/revisions/upcoming');
export const getPendingRevisions = () => api.get('/revisions/pending');
export const getRevisionsByProblem = (problemId) => api.get(`/revisions/problem/${problemId}`);
export const markRevisionDone = (id) => api.put(`/revisions/${id}/done`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
