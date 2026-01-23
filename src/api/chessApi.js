import axios from 'axios';

// Base URL for Chess.com API
const CHESS_API_BASE_URL = 'https://api.chess.com/pub';

// Base URL for our backend API
const BACKEND_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Function to get player profile details
export const getPlayerProfile = async (username) => {
    try {
        const response = await axios.get(`${CHESS_API_BASE_URL}/player/${username}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching player profile:', error);
        throw error;
    }
};

// Add more functions here if needed for other Chess.com API endpoints
export const followPlayer = async (username) => {
    const token = localStorage.getItem('token');
    return axios.post('/api/follow-player', { chessPlayerUsername: username }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
  
export const unfollowPlayer = async (chessPlayerUsername) => {
    const token = localStorage.getItem('token');
    return axios.delete(`/api/unfollow-player/${chessPlayerUsername}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
};
  
  export const getFollowers = async (chessPlayerUsername) => {
    return axios.get(`/api/player/${chessPlayerUsername}/followers`);
};

// Added to chessApi.js

export const getPlayersByTitle = async (title) => {
    try {
        const response = await axios.get(`${CHESS_API_BASE_URL}/titled/${title}`);
        return response.data.players;
    } catch (error) {
        console.error('Error fetching players by title:', error);
        throw error;
    }
};


export const addComment = async (chessPlayerUsername, comment) => {
    const token = localStorage.getItem('token');
    return axios.post('/api/comment-player', { chessPlayerUsername, comment }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  
  export const getComments = async (chessPlayerUsername) => {
    return axios.get(`/api/comments/${chessPlayerUsername}`);
  };

// ==================== AI Chess Service API ====================

/**
 * AI service health check
 */
export const checkAIHealth = async () => {
  try {
    const response = await axios.get(`${BACKEND_API_BASE_URL}/chess/ai/health`);
    return response.data;
  } catch (error) {
    console.error('AI health check failed:', error);
    throw error;
  }
};

/**
 * Analyze chess position
 * @param {string} fen - FEN format chess position string
 */
export const analyzePosition = async (fen) => {
  try {
    const response = await axios.post(`${BACKEND_API_BASE_URL}/chess/ai/analyze`, { fen });
    return response.data;
  } catch (error) {
    console.error('Position analysis failed:', error);
    throw error;
  }
};

/**
 * Get AI recommended best move
 * @param {string} fen - FEN format chess position string
 */
export const getBestMove = async (fen) => {
  try {
    const response = await axios.post(`${BACKEND_API_BASE_URL}/chess/ai/best-move`, { fen });
    return response.data;
  } catch (error) {
    console.error('Get best move failed:', error);
    throw error;
  }
};