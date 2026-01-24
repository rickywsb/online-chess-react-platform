import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useAuth } from '../contexts/AuthContext';
import { getRandomPuzzle, solvePuzzle, getPuzzleStats } from '../api/puzzle';
import './PuzzlePage.css';

const PuzzlePage = () => {
  const { user } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [puzzle, setPuzzle] = useState(null);
  const [userMoves, setUserMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [status, setStatus] = useState('loading'); // loading, playing, correct, wrong, complete
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [showHint, setShowHint] = useState(false);
  const [ratingChange, setRatingChange] = useState(null);
  const [lastPuzzleId, setLastPuzzleId] = useState(null);

  // Load puzzle
  const loadPuzzle = useCallback(async (isNew = false) => {
    console.log('Loading puzzle...');
    setIsLoading(true);
    setStatus('loading');
    setMessage('Loading puzzle...');
    setUserMoves([]);
    setCurrentMoveIndex(0);
    setShowHint(false);
    setRatingChange(null);

    try {
      // Always get random puzzle from local database
      const userRating = stats?.rating || 1200;
      const puzzleData = await getRandomPuzzle(userRating);
      console.log('Got puzzle:', puzzleData.id, 'Rating:', puzzleData.rating);

      setLastPuzzleId(puzzleData.id);
      setPuzzle(puzzleData);
      
      // Set up the board with the puzzle position
      const newGame = new Chess();
      if (puzzleData.fen) {
        newGame.load(puzzleData.fen);
        console.log('Loaded FEN:', puzzleData.fen);
      }
      
      setGame(newGame);
      
      // Determine board orientation based on who's to move
      const toMove = puzzleData.toMove || (newGame.turn() === 'w' ? 'white' : 'black');
      setBoardOrientation(toMove);
      
      console.log('Setting status to playing, toMove:', toMove);
      setStatus('playing');
      setMessage(`🎯 ${toMove === 'white' ? 'White' : 'Black'} to move - Find the best move!`);
      setStartTime(Date.now());
      
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setStatus('error');
      setMessage('Failed to load puzzle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [stats?.rating]);

  // Load stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const statsData = await getPuzzleStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [user]);

  useEffect(() => {
    loadPuzzle(false); // Load daily puzzle on first load
    loadStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle piece drop
  const onDrop = (sourceSquare, targetSquare) => {
    console.log('onDrop called:', sourceSquare, targetSquare, 'status:', status);
    if (status !== 'playing') {
      console.log('Not in playing status, ignoring');
      return false;
    }

    const gameCopy = new Chess(game.fen());
    
    try {
      // Try to make the move
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (!move) {
        console.log('Invalid move');
        return false;
      }

      // Get the move in UCI format
      const uciMove = sourceSquare + targetSquare + (move.promotion || '');
      console.log('User move (UCI):', uciMove);
      console.log('Expected move:', puzzle.moves[currentMoveIndex]);
      
      // Check if this move is correct (compare UCI format)
      const expectedMove = puzzle.moves[currentMoveIndex];
      const expectedUci = expectedMove?.toLowerCase();
      const userUci = uciMove.toLowerCase();
      
      // Match either exact UCI or without promotion suffix
      const isCorrect = userUci === expectedUci || 
                        userUci.substring(0, 4) === expectedUci?.substring(0, 4);

      console.log('Move correct:', isCorrect);

      if (isCorrect) {
        setGame(gameCopy);
        setUserMoves([...userMoves, uciMove]);
        
        // Check if puzzle is complete
        if (currentMoveIndex >= puzzle.moves.length - 1) {
          // Puzzle solved!
          handlePuzzleComplete(true);
        } else {
          // Make opponent's response
          setCurrentMoveIndex(currentMoveIndex + 1);
          setStatus('correct');
          setMessage('Correct! Keep going...');
          
          // Make opponent's move after a short delay
          setTimeout(() => {
            makeOpponentMove(gameCopy, currentMoveIndex + 1);
          }, 500);
        }
      } else {
        // Wrong move
        setStatus('wrong');
        setMessage('Not quite right. Try again!');
        handlePuzzleComplete(false);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // Make opponent's response move
  const makeOpponentMove = (currentGame, moveIndex) => {
    if (moveIndex >= puzzle.moves.length) return;
    
    const opponentMove = puzzle.moves[moveIndex];
    const gameCopy = new Chess(currentGame.fen());
    
    try {
      // Parse UCI move
      const from = opponentMove.substring(0, 2);
      const to = opponentMove.substring(2, 4);
      const promotion = opponentMove.length > 4 ? opponentMove[4] : undefined;
      
      gameCopy.move({ from, to, promotion });
      setGame(gameCopy);
      setCurrentMoveIndex(moveIndex + 1);
      
      // Check if puzzle is now complete (opponent made last move)
      if (moveIndex >= puzzle.moves.length - 1) {
        handlePuzzleComplete(true);
      } else {
        setStatus('playing');
        setMessage('Your turn! Find the best move.');
      }
    } catch (error) {
      console.error('Error making opponent move:', error);
    }
  };

  // Handle puzzle completion
  const handlePuzzleComplete = async (solved) => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    if (solved) {
      setStatus('complete');
      setMessage('🎉 Puzzle solved!');
    } else {
      setStatus('wrong');
      setMessage('❌ Puzzle failed');
    }

    // Submit result if logged in
    if (user && puzzle) {
      try {
        const result = await solvePuzzle(puzzle.id, {
          solved,
          timeSpent,
          puzzleRating: puzzle.rating,
          themes: puzzle.themes
        });
        
        setRatingChange(result.ratingChange);
        loadStats(); // Refresh stats
      } catch (error) {
        console.error('Failed to submit puzzle result:', error);
      }
    }
  };

  // Show hint
  const handleShowHint = () => {
    if (!puzzle || currentMoveIndex >= puzzle.moves.length) return;
    
    const nextMove = puzzle.moves[currentMoveIndex];
    const from = nextMove.substring(0, 2);
    setShowHint(true);
    setMessage(`Hint: Try moving from ${from}`);
  };

  // Get square styles for hints
  const getSquareStyles = () => {
    if (!showHint || !puzzle || currentMoveIndex >= puzzle.moves.length) return {};
    
    const nextMove = puzzle.moves[currentMoveIndex];
    const from = nextMove.substring(0, 2);
    
    return {
      [from]: {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      }
    };
  };

  return (
    <div className="puzzle-page">
      <div className="puzzle-container">
        {/* Stats Panel */}
        <div className="puzzle-stats-panel">
          <h2>📊 Your Stats</h2>
          {user ? (
            stats ? (
              <>
                <div className="stat-item">
                  <span className="stat-label">Rating</span>
                  <span className="stat-value rating">{stats.rating}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tier</span>
                  <span className="stat-value tier" style={{ color: stats.tier?.color }}>
                    {stats.tier?.title}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Solved</span>
                  <span className="stat-value">{stats.solved}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Accuracy</span>
                  <span className="stat-value">{stats.accuracy}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value streak">🔥 {stats.streak}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Best Streak</span>
                  <span className="stat-value">{stats.bestStreak}</span>
                </div>
              </>
            ) : (
              <p>Loading stats...</p>
            )
          ) : (
            <p className="login-prompt">
              <a href="/login">Log in</a> to track your progress!
            </p>
          )}
        </div>

        {/* Main Puzzle Area */}
        <div className="puzzle-main">
          <div className="puzzle-info">
            <h1>♟️ Daily Puzzle</h1>
            {puzzle && (
              <div className="puzzle-meta">
                <span className="puzzle-rating">Rating: {puzzle.rating}</span>
                {puzzle.themes?.length > 0 && (
                  <span className="puzzle-themes">
                    {puzzle.themes.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="puzzle-board-container">
            {/* Turn indicator */}
            {puzzle && status === 'playing' && (
              <div className={`turn-indicator ${boardOrientation}`}>
                <span className="turn-icon">{boardOrientation === 'white' ? '⚪' : '⚫'}</span>
                <span className="turn-text">{boardOrientation === 'white' ? 'White' : 'Black'} to move</span>
              </div>
            )}
            <div className="puzzle-board">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                customSquareStyles={getSquareStyles()}
                boardWidth={Math.min(500, window.innerWidth - 40)}
                arePiecesDraggable={status === 'playing'}
                isDraggablePiece={({ piece }) => {
                  // Only allow dragging pieces of the side to move
                  const pieceColor = piece[0] === 'w' ? 'white' : 'black';
                  return status === 'playing' && pieceColor === boardOrientation;
                }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className={`puzzle-status ${status}`}>
            <p className="status-message">{message}</p>
            {ratingChange !== null && (
              <p className={`rating-change ${ratingChange >= 0 ? 'positive' : 'negative'}`}>
                {ratingChange >= 0 ? '+' : ''}{ratingChange} rating
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="puzzle-controls">
            {status === 'playing' && (
              <button 
                className="btn btn-hint"
                onClick={handleShowHint}
                disabled={showHint}
              >
                💡 Hint
              </button>
            )}
            
            {(status === 'complete' || status === 'wrong') && (
              <button 
                className="btn btn-next"
                onClick={() => loadPuzzle(true)}
              >
                Next Puzzle →
              </button>
            )}
            
            <button 
              className="btn btn-retry"
              onClick={() => loadPuzzle(true)}
              disabled={isLoading}
            >
              🔄 New Puzzle
            </button>
          </div>

          {/* Puzzle Source */}
          {puzzle && (
            <div className="puzzle-source">
              <small>Source: {puzzle.source === 'local' ? '📦 Local Database' : '🌐 Lichess'}</small>
            </div>
          )}

          {/* Solution (show when failed) */}
          {status === 'wrong' && puzzle && (
            <div className="puzzle-solution">
              <h3>Solution:</h3>
              <p>{puzzle.moves.join(' → ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;
