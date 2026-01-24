import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get daily puzzle
 */
export const getDailyPuzzle = async () => {
  const response = await apiClient.get('/puzzles/daily');
  return response.data;
};

/**
 * Get random puzzle (no auth required)
 */
export const getRandomPuzzle = async (rating = 1200) => {
  const response = await apiClient.get(`/puzzles/random?rating=${rating}`);
  return response.data;
};

/**
 * Get next puzzle based on user rating
 */
export const getNextPuzzle = async (lastPuzzleId = null) => {
  const url = lastPuzzleId 
    ? `/puzzles/next?lastPuzzleId=${lastPuzzleId}`
    : '/puzzles/next';
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get available themes
 */
export const getThemes = async () => {
  const response = await apiClient.get('/puzzles/themes');
  return response.data.themes;
};

/**
 * Get puzzle by ID
 */
export const getPuzzleById = async (puzzleId) => {
  const response = await apiClient.get(`/puzzles/${puzzleId}`);
  return response.data;
};

/**
 * Submit puzzle solution
 */
export const solvePuzzle = async (puzzleId, data) => {
  const response = await apiClient.post(`/puzzles/${puzzleId}/solve`, data);
  return response.data;
};

/**
 * Get user's puzzle statistics
 */
export const getPuzzleStats = async () => {
  const response = await apiClient.get('/puzzles/user/stats');
  return response.data;
};

/**
 * Get user's puzzle history
 */
export const getPuzzleHistory = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/puzzles/user/history?page=${page}&limit=${limit}`);
  return response.data;
};

const puzzleApi = {
  getDailyPuzzle,
  getNextPuzzle,
  getPuzzleById,
  solvePuzzle,
  getPuzzleStats,
  getPuzzleHistory
};

export default puzzleApi;