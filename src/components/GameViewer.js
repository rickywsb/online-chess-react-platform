import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getBroadcastPgn } from '../api/broadcast';
import './GameViewer.css';

const GameViewer = ({ game, tournamentId, roundId, autoRefresh, getResultDisplay }) => {
  const [chess] = useState(() => new Chess());
  const [position, setPosition] = useState('start');
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [pgnLoaded, setPgnLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef(null);
  const gameIdRef = useRef(null);

  // Parse moves from PGN text
  const parseMovesFromPgn = useCallback((pgn) => {
    try {
      const tempChess = new Chess();
      
      // Try to load PGN directly first
      try {
        tempChess.loadPgn(pgn);
        const history = tempChess.history({ verbose: true });
        
        // Build positions array
        const positions = [{ fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', san: null, moveNumber: 0, color: null }];
        const replayChess = new Chess();
        
        for (let i = 0; i < history.length; i++) {
          const move = history[i];
          replayChess.move(move.san);
          positions.push({
            fen: replayChess.fen(),
            san: move.san,
            moveNumber: Math.floor(i / 2) + 1,
            color: move.color
          });
        }
        
        if (positions.length > 1) {
          return positions;
        }
      } catch (loadError) {
        console.log('loadPgn failed, trying manual parsing:', loadError.message);
      }
      
      // Fallback: Manual parsing
      let cleanPgn = pgn
        .replace(/\{[^}]*\}/g, '')  // Remove comments
        .replace(/\$\d+/g, '')       // Remove NAGs
        .replace(/\([^)]*\)/g, '')   // Remove variations
        .trim();
      
      // Extract just the moves (after headers)
      const movesMatch = cleanPgn.match(/\d+\.\s*\S+/);
      if (movesMatch) {
        const movesStartIndex = cleanPgn.indexOf(movesMatch[0]);
        cleanPgn = cleanPgn.substring(movesStartIndex);
      }
      
      // Remove result at the end
      cleanPgn = cleanPgn.replace(/\s*(1-0|0-1|1\/2-1\/2|\*)\s*$/, '');
      
      // Parse moves - include more move patterns
      const moveTokens = cleanPgn.match(/[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?[+#]?|O-O-O|O-O/gi);
      
      if (!moveTokens) return [];
      
      const manualChess = new Chess();
      const positions = [{ fen: manualChess.fen(), san: null, moveNumber: 0, color: null }];
      
      for (let i = 0; i < moveTokens.length; i++) {
        const move = moveTokens[i];
        try {
          const result = manualChess.move(move);
          if (result) {
            positions.push({
              fen: manualChess.fen(),
              san: result.san,
              moveNumber: Math.floor(i / 2) + 1,
              color: result.color
            });
          }
        } catch (e) {
          console.warn(`Invalid move: ${move}`, e);
          break;
        }
      }
      
      return positions;
    } catch (e) {
      console.error('Error parsing PGN:', e);
      return [];
    }
  }, []);

  // Fetch PGN for the game
  useEffect(() => {
    const fetchPgn = async () => {
      if (!game || !roundId || !tournamentId) return;
      
      // Reset if game changed
      if (gameIdRef.current !== game.id) {
        gameIdRef.current = game.id;
        setMoveHistory([]);
        setCurrentMoveIndex(-1);
        setPosition('start');
        setPgnLoaded(false);
        setIsPlaying(false);
      }
      
      setIsLoading(true);
      
      try {
        const pgnData = await getBroadcastPgn(tournamentId, roundId);
        
        // Split PGN into individual games
        const games = pgnData.split(/\n\n(?=\[Event)/);
        
        // Find game by multiple matching strategies
        let gamePgn = null;
        const gameId = game.id;
        const whiteName = game.players?.[0]?.name;
        const blackName = game.players?.[1]?.name;
        
        for (const g of games) {
          // Try to match by game ID in URL
          if (gameId && g.includes(gameId)) {
            gamePgn = g;
            break;
          }
          // Try to match by both player names
          if (whiteName && blackName) {
            const hasWhite = g.includes(`[White "${whiteName}"]`) || g.includes(whiteName);
            const hasBlack = g.includes(`[Black "${blackName}"]`) || g.includes(blackName);
            if (hasWhite && hasBlack) {
              gamePgn = g;
              break;
            }
          }
        }
        
        if (gamePgn) {
          console.log('Found PGN for game:', gameId);
          const positions = parseMovesFromPgn(gamePgn);
          console.log('Parsed positions:', positions.length);
          setMoveHistory(positions);
          
          // Go to last position
          if (positions.length > 0) {
            const lastIndex = positions.length - 1;
            setCurrentMoveIndex(lastIndex);
            setPosition(positions[lastIndex].fen);
          }
          setPgnLoaded(true);
        } else {
          console.log('No matching PGN found for game:', gameId);
          // Fallback to current position from API
          if (game.fen) {
            setPosition(game.fen);
            setMoveHistory([{ fen: game.fen, san: null, moveNumber: 0, color: null }]);
            setCurrentMoveIndex(0);
          }
          setPgnLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching PGN:', error);
        // Fallback to current position
        if (game.fen) {
          setPosition(game.fen);
          setMoveHistory([{ fen: game.fen, san: null, moveNumber: 0, color: null }]);
          setCurrentMoveIndex(0);
        }
        setPgnLoaded(true);
      }
      
      setIsLoading(false);
    };
    
    fetchPgn();
  }, [game, tournamentId, roundId, parseMovesFromPgn]);

  // Update to latest position when auto-refresh is on and game is live
  useEffect(() => {
    if (autoRefresh && game?.fen && pgnLoaded && !game.status) {
      // Only update if we're at the last move
      if (currentMoveIndex === moveHistory.length - 1) {
        setPosition(game.fen);
      }
    }
  }, [game?.fen, autoRefresh, pgnLoaded, currentMoveIndex, moveHistory.length, game?.status]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentMoveIndex < moveHistory.length - 1) {
      playIntervalRef.current = setTimeout(() => {
        goToMove(currentMoveIndex + 1);
      }, 800);
    } else if (isPlaying && currentMoveIndex >= moveHistory.length - 1) {
      setIsPlaying(false);
    }
    
    return () => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current);
      }
    };
  }, [isPlaying, currentMoveIndex, moveHistory.length]);

  // Navigation functions
  const goToMove = useCallback((index) => {
    if (index >= 0 && index < moveHistory.length) {
      setCurrentMoveIndex(index);
      setPosition(moveHistory[index].fen);
      setIsPlaying(false);
    }
  }, [moveHistory]);

  const goToStart = () => {
    goToMove(0);
  };

  const goBack = () => {
    goToMove(currentMoveIndex - 1);
  };

  const goForward = () => {
    goToMove(currentMoveIndex + 1);
  };

  const goToEnd = () => {
    goToMove(moveHistory.length - 1);
  };

  const togglePlay = () => {
    if (currentMoveIndex >= moveHistory.length - 1) {
      // Start from beginning if at end
      setCurrentMoveIndex(0);
      setPosition(moveHistory[0].fen);
    }
    setIsPlaying(!isPlaying);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goBack();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goForward();
          break;
        case 'Home':
          e.preventDefault();
          goToStart();
          break;
        case 'End':
          e.preventDefault();
          goToEnd();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMoveIndex, moveHistory.length, isPlaying]);

  if (!game) {
    return (
      <div className="game-viewer no-game">
        <p>Select a game from the sidebar</p>
      </div>
    );
  }

  const result = getResultDisplay(game.status);
  const totalMoves = moveHistory.length > 0 ? moveHistory.length - 1 : 0;

  return (
    <div className="game-viewer">
      {/* Black Player (top) */}
      <div className="player-bar black">
        <span className="player-name">
          {game.players?.[1]?.title && (
            <span className="title">{game.players[1].title} </span>
          )}
          {game.players?.[1]?.name || 'Black'}
        </span>
        <span className="player-rating">
          {game.players?.[1]?.rating || ''}
        </span>
      </div>

      {/* Chess Board */}
      <div className="board-container">
        {isLoading && (
          <div className="board-loading">
            <div className="loading-spinner small"></div>
          </div>
        )}
        <Chessboard 
          key={game.id}
          position={position}
          boardWidth={500}
          arePiecesDraggable={false}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        />
      </div>

      {/* White Player (bottom) */}
      <div className="player-bar white">
        <span className="player-name">
          {game.players?.[0]?.title && (
            <span className="title">{game.players[0].title} </span>
          )}
          {game.players?.[0]?.name || 'White'}
        </span>
        <span className="player-rating">
          {game.players?.[0]?.rating || ''}
        </span>
      </div>

      {/* Move Controls */}
      <div className="move-controls">
        <div className="control-buttons">
          <button 
            onClick={goToStart} 
            disabled={currentMoveIndex <= 0}
            title="Go to start (Home)"
            className="control-btn"
          >
            ⏮
          </button>
          <button 
            onClick={goBack} 
            disabled={currentMoveIndex <= 0}
            title="Previous move (←)"
            className="control-btn"
          >
            ◀
          </button>
          <button 
            onClick={togglePlay}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            className="control-btn play-btn"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button 
            onClick={goForward} 
            disabled={currentMoveIndex >= moveHistory.length - 1}
            title="Next move (→)"
            className="control-btn"
          >
            ▶
          </button>
          <button 
            onClick={goToEnd} 
            disabled={currentMoveIndex >= moveHistory.length - 1}
            title="Go to end (End)"
            className="control-btn"
          >
            ⏭
          </button>
        </div>
        
        <div className="move-info">
          <span className="move-counter">
            Move {currentMoveIndex > 0 ? Math.ceil(currentMoveIndex / 2) : 0} / {Math.ceil(totalMoves / 2)}
          </span>
          {moveHistory[currentMoveIndex]?.san && (
            <span className="current-move">
              {moveHistory[currentMoveIndex].color === 'w' ? '○' : '●'} {moveHistory[currentMoveIndex].san}
            </span>
          )}
        </div>
      </div>

      {/* Game Status */}
      <div className="game-status">
        {!game.fen && !pgnLoaded ? (
          <span className="result-badge waiting">⏳ Upcoming - Waiting for game to start</span>
        ) : game.status && game.status !== '*' ? (
          <span className={`result-badge ${result.className}`}>
            Result: {game.status}
          </span>
        ) : moveHistory.length <= 1 ? (
          <span className="result-badge upcoming">📅 Upcoming</span>
        ) : (
          <span className="result-badge ongoing">● LIVE - Game in progress</span>
        )}
        {game.lastMove && currentMoveIndex === moveHistory.length - 1 && (
          <span className="last-move">Latest: {game.lastMove}</span>
        )}
      </div>

      {/* Move List */}
      {moveHistory.length > 1 && (
        <div className="move-list">
          <h4>Moves</h4>
          <div className="moves-scroll">
            {moveHistory.slice(1).map((move, index) => (
              <span 
                key={index}
                className={`move-item ${index + 1 === currentMoveIndex ? 'active' : ''}`}
                onClick={() => goToMove(index + 1)}
              >
                {index % 2 === 0 && <span className="move-number">{Math.floor(index / 2) + 1}.</span>}
                {move.san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameViewer;
