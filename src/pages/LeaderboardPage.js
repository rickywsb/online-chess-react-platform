import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPuzzleLeaderboard, getBattleLeaderboard, getUserRank } from '../api/leaderboard';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('puzzle');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = activeTab === 'puzzle' 
        ? await getPuzzleLeaderboard(page, 50)
        : await getBattleLeaderboard(page, 50);
      
      setLeaderboard(data.leaderboard);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  const loadUserRank = useCallback(async () => {
    try {
      const data = await getUserRank();
      setUserRank(data);
    } catch (error) {
      console.error('Failed to load user rank:', error);
    }
  }, []);

  // Load leaderboard data
  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Load user rank
  useEffect(() => {
    if (user) {
      loadUserRank();
    }
  }, [user, loadUserRank]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    if (rank <= 10) return 'top10';
    return '';
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
          <p>Top players ranked by rating</p>
        </div>

        {/* Tab Buttons */}
        <div className="leaderboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'puzzle' ? 'active' : ''}`}
            onClick={() => { setActiveTab('puzzle'); setPage(1); }}
          >
            ♟️ Puzzle Rating
          </button>
          <button
            className={`tab-btn ${activeTab === 'battle' ? 'active' : ''}`}
            onClick={() => { setActiveTab('battle'); setPage(1); }}
          >
            ⚔️ Battle Rating
          </button>
        </div>

        {/* User's Rank Card */}
        {user && userRank && (
          <div className="user-rank-card">
            <div className="your-rank-label">Your Ranking</div>
            <div className="your-rank-content">
              <div className="rank-info">
                <span className="rank-number">
                  #{activeTab === 'puzzle' ? userRank.puzzle.rank || '—' : userRank.battle.rank || '—'}
                </span>
                <span className="rank-rating">
                  {activeTab === 'puzzle' ? userRank.puzzle.rating : userRank.battle.rating}
                </span>
              </div>
              <div className="rank-tier" style={{ 
                color: activeTab === 'puzzle' ? userRank.puzzle.tier?.color : userRank.battle.tier?.color 
              }}>
                {activeTab === 'puzzle' ? userRank.puzzle.tier?.title : userRank.battle.tier?.title}
              </div>
              {userRank[activeTab].percentile && (
                <div className="rank-percentile">
                  Top {100 - userRank[activeTab].percentile}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="leaderboard-table-container">
          {isLoading ? (
            <div className="loading">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <p>No players yet. Be the first!</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Rating</th>
                  <th>Tier</th>
                  {activeTab === 'puzzle' ? (
                    <>
                      <th>Solved</th>
                      <th>Accuracy</th>
                    </>
                  ) : (
                    <>
                      <th>Games</th>
                      <th>Win Rate</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player) => (
                  <tr 
                    key={player.oderId} 
                    className={`${getRankClass(player.rank)} ${user && player.oderId === user.id ? 'current-user' : ''}`}
                  >
                    <td className="rank-cell">
                      <span className={`rank ${getRankClass(player.rank)}`}>
                        {getRankIcon(player.rank)}
                      </span>
                    </td>
                    <td className="player-cell">
                      <div className="player-info">
                        <div className="player-avatar">
                          {player.profilePicture ? (
                            <img src={player.profilePicture} alt={player.username} />
                          ) : (
                            <span>{player.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <span className="player-name">{player.username}</span>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <span className="rating-value">{player.rating}</span>
                    </td>
                    <td className="tier-cell">
                      <span className="tier-badge" style={{ backgroundColor: player.tier?.color + '30', color: player.tier?.color }}>
                        {player.tier?.title}
                      </span>
                    </td>
                    {activeTab === 'puzzle' ? (
                      <>
                        <td className="stat-cell">{player.solved}</td>
                        <td className="stat-cell">{player.accuracy}%</td>
                      </>
                    ) : (
                      <>
                        <td className="stat-cell">{player.games}</td>
                        <td className="stat-cell">{player.winRate}%</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
