import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

/**
 * Get list of broadcasts
 */
export const getBroadcasts = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    throw error;
  }
};

/**
 * Get top/featured broadcasts
 */
export const getTopBroadcasts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts/top`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top broadcasts:', error);
    throw error;
  }
};

/**
 * Get a specific broadcast tournament
 */
export const getBroadcastTournament = async (tournamentId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts/${tournamentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching broadcast tournament:', error);
    throw error;
  }
};

/**
 * Get a specific broadcast round
 */
export const getBroadcastRound = async (tournamentId, roundId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts/${tournamentId}/${roundId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching broadcast round:', error);
    throw error;
  }
};

/**
 * Get parsed games of a broadcast round
 */
export const getBroadcastGames = async (tournamentId, roundId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts/${tournamentId}/${roundId}/games`);
    return response.data;
  } catch (error) {
    console.error('Error fetching broadcast games:', error);
    throw error;
  }
};

/**
 * Get PGN of a broadcast round
 */
export const getBroadcastPgn = async (tournamentId, roundId) => {
  try {
    const response = await axios.get(`${API_BASE}/api/broadcasts/${tournamentId}/${roundId}/pgn`);
    return response.data;
  } catch (error) {
    console.error('Error fetching broadcast PGN:', error);
    throw error;
  }
};
