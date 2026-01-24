import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBroadcastRound, getBroadcastTournament } from '../api/broadcast';
import GameViewer from '../components/GameViewer';
import './BroadcastViewPage.css';

const BroadcastViewPage = () => {
  const { tournamentId, roundId } = useParams();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const initialLoadDone = useRef(false);
  const currentRoundId = useRef(roundId);

  // Fetch tournament data once (for rounds list)
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getBroadcastTournament(tournamentId);
        setTournament(data);
      } catch (err) {
        console.error('Error fetching tournament:', err);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  // Reset when round changes
  useEffect(() => {
    if (roundId !== currentRoundId.current) {
      currentRoundId.current = roundId;
      initialLoadDone.current = false;
      setSelectedGameId(null);
      setLoading(true);
    }
  }, [roundId]);

  // Fetch round data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBroadcastRound(tournamentId, roundId);
        
        setRoundData(data);
        const gamesList = data.games || [];
        setGames(gamesList);
        
        // Only auto-select first game on initial load
        if (!initialLoadDone.current && gamesList.length > 0) {
          setSelectedGameId(gamesList[0].id);
          initialLoadDone.current = true;
        }
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching broadcast data:', err);
        setError('Failed to load broadcast');
        setLoading(false);
      }
    };

    fetchData();
    
    // Auto-refresh every 5 seconds for live updates
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tournamentId, roundId, autoRefresh]);

  // Handle round selection
  const handleRoundChange = (newRoundId) => {
    navigate(`/chess-tv/${tournamentId}/${newRoundId}`);
  };

  // Get the selected game object from the games array
  const selectedGame = games.find(g => g.id === selectedGameId);

  // Handle game selection
  const handleGameSelect = (game) => {
    setSelectedGameId(game.id);
  };

  // Get result display
  const getResultDisplay = (status) => {
    if (!status || status === '*') return { text: 'Live', className: 'ongoing' };
    if (status === '1-0') return { text: '1-0', className: 'white-win' };
    if (status === '0-1') return { text: '0-1', className: 'black-win' };
    if (status === '½-½' || status === '1/2-1/2') return { text: '½-½', className: 'draw' };
    return { text: status, className: '' };
  };

  // Check if game is ongoing
  const isGameOngoing = (game) => {
    return !game.status || game.status === '*';
  };

  if (loading) {
    return (
      <div className="broadcast-view loading">
        <div className="loading-spinner"></div>
        <p>Loading broadcast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="broadcast-view error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={{ margin: '10px', padding: '8px 16px' }}>Retry</button>
        <Link to="/chess-tv" className="back-link">← Back to Chess TV</Link>
      </div>
    );
  }

  return (
    <div className="broadcast-view">
      {/* Header */}
      <div className="broadcast-header">
        <Link to="/chess-tv" className="back-link">← Back to Chess TV</Link>
        <div className="broadcast-info">
          <h1>{roundData?.tour?.name || tournament?.tour?.name || 'Tournament'}</h1>
          <div className="round-selector">
            {tournament?.rounds && tournament.rounds.length > 0 ? (
              <select 
                value={roundId} 
                onChange={(e) => handleRoundChange(e.target.value)}
                className="round-dropdown"
              >
                {tournament.rounds.map(round => (
                  <option key={round.id} value={round.id}>
                    {round.name} {round.ongoing ? '● LIVE' : round.finished ? '✓' : '○'}
                  </option>
                ))}
              </select>
            ) : (
              <p>{roundData?.round?.name || 'Round'}</p>
            )}
          </div>
        </div>
        <div className="refresh-toggle">
          <label>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="broadcast-content">
        {/* Games Sidebar */}
        <div className="games-sidebar">
          <h3>Games ({games.length})</h3>
          <div className="games-list">
            {games.length === 0 ? (
              <div className="no-games-message">
                <span className="icon">📅</span>
                <p>No games available yet</p>
                <p className="sub-text">
                  {roundData?.round?.startsAt 
                    ? `Round starts: ${new Date(roundData.round.startsAt).toLocaleString()}`
                    : 'Games will appear when the round begins'}
                </p>
              </div>
            ) : games.map((game) => {
              const result = getResultDisplay(game.status);
              const white = game.players?.[0] || {};
              const black = game.players?.[1] || {};
              
              return (
                <div 
                  key={game.id}
                  className={`game-card ${selectedGame?.id === game.id ? 'selected' : ''} ${isGameOngoing(game) ? 'ongoing' : ''}`}
                  onClick={() => handleGameSelect(game)}
                >
                  <div className="game-players">
                    <div className="player">
                      <span className="color-indicator white"></span>
                      <span className="name">{white.name || 'White'}</span>
                      {white.rating && <span className="elo">{white.rating}</span>}
                    </div>
                    <div className="player">
                      <span className="color-indicator black"></span>
                      <span className="name">{black.name || 'Black'}</span>
                      {black.rating && <span className="elo">{black.rating}</span>}
                    </div>
                  </div>
                  <div className={`game-result ${result.className}`}>
                    {result.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Board Area */}
        <div className="main-board-area">
          <GameViewer 
            game={selectedGame}
            tournamentId={tournamentId}
            roundId={roundId}
            autoRefresh={autoRefresh}
            getResultDisplay={getResultDisplay}
          />
        </div>
      </div>
    </div>
  );
};

export default BroadcastViewPage;
