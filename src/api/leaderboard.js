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
 * Get puzzle leaderboard
 */
export const getPuzzleLeaderboard = async (page = 1, limit = 100) => {
  const response = await apiClient.get(`/leaderboard/puzzle?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Get battle leaderboard
 */
export const getBattleLeaderboard = async (page = 1, limit = 100) => {
  const response = await apiClient.get(`/leaderboard/battle?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Get current user's rank
 */
export const getUserRank = async () => {
  const response = await apiClient.get('/leaderboard/user/rank');
  return response.data;
};

/**
 * Get top players for homepage
 */
export const getTopPlayers = async (limit = 10) => {
  const response = await apiClient.get(`/leaderboard/top?limit=${limit}`);
  return response.data;
};

const leaderboardApi = {
  getPuzzleLeaderboard,
  getBattleLeaderboard,
  getUserRank,
  getTopPlayers
};

export default leaderboardApi;
