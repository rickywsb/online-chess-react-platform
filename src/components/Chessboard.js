import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getBestMove, analyzePosition, checkAIHealth } from '../api/chessApi';
import './ChessBoard.css'; // Import the CSS file

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [message, setMessage] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking...');
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Check AI service status
  useEffect(() => {
    const checkAI = async () => {
      try {
        const health = await checkAIHealth();
        // Accept both 'ok' and 'healthy' status
        if (health.status === 'ok' || health.status === 'healthy') {
          setAiStatus('🟢 Online');
        } else {
          setAiStatus('🟡 Degraded');
        }
      } catch (error) {
        setAiStatus('🔴 Offline (using random moves)');
      }
    };
    checkAI();
  }, []);

  // AI move logic
  const makeAIMove = async () => {
    if (game.isGameOver()) return;
    
    setIsAIThinking(true);
    setMessage('🤔 AI is thinking...');

    try {
      // Call AI service to get best move
      const result = await getBestMove(game.fen());
      
      if (result.best_move) {
        // AI returns SAN format (e.g., "e4", "Nf3")
        const move = game.move(result.best_move);
        
        if (move) {
          setFen(game.fen());
          setMessage(`🤖 AI played: ${result.best_move}${result.explanation ? ` (${result.explanation})` : ''}`);
          
          if (game.isGameOver()) {
            if (game.isCheckmate()) {
              setMessage('💀 Checkmate! AI wins!');
            } else if (game.isDraw()) {
              setMessage('🤝 Draw!');
            }
          }
        }
      }
    } catch (error) {
      console.error('AI service error, using random move:', error);
      // Fallback to random move
      const moves = game.moves();
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        game.move(randomMove);
        setFen(game.fen());
        setMessage(`🎲 AI played: ${randomMove} (random)`);
      }
    }
    
    setIsAIThinking(false);
  };

  const onDrop = ({ sourceSquare, targetSquare }) => {
    if (isAIThinking) {
      setMessage('⏳ Please wait for AI to finish thinking...');
      return false;
    }

    try {
      // Validate the move
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // always promote to a queen for simplicity
      });

      // Illegal move
      if (move === null) {
        setMessage('❌ Invalid move');
        return false;
      }

      setFen(game.fen());
      setMessage(`✅ You played: ${move.san}`);
      setAnalysis(null); // Clear previous analysis

      // Check if game is over after player's move
      if (game.isGameOver()) {
        if (game.isCheckmate()) {
          setMessage('🎉 Checkmate! You win!');
        } else if (game.isDraw()) {
          setMessage('🤝 Draw!');
        }
        return true;
      }

      // AI move
      setTimeout(() => {
        makeAIMove();
      }, 500);

      return true;
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Invalid move');
      return false;
    }
  };

  // Analyze current position
  const handleAnalyze = async () => {
    setMessage('🔍 Analyzing position...');
    try {
      const result = await analyzePosition(game.fen());
      setAnalysis(result);
      setShowAnalysis(true);
      setMessage('✅ Analysis complete!');
    } catch (error) {
      setMessage('❌ Analysis failed: ' + error.message);
    }
  };

  // Reset game
  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMessage('🆕 New game started!');
    setAnalysis(null);
    setShowAnalysis(false);
  };

  // Undo move
  const handleUndo = () => {
    // Undo two moves (player and AI)
    game.undo();
    game.undo();
    setFen(game.fen());
    setMessage('↩️ Move undone');
    setAnalysis(null);
  };

  return (
    <div className="chessboard-container">
      <div className="player-labels">
        <span>👤 Player: {localStorage.getItem('username') || 'Anonymous'}</span>
        <span>🤖 AI: SmartChessAI ({aiStatus})</span>
      </div>
      
      <div className="chessboard-wrapper">
        <Chessboard
          position={fen}
          onPieceDrop={(sourceSquare, targetSquare) => onDrop({ sourceSquare, targetSquare })}
          areArrowsAllowed={true}
          boardOrientation="white"
          customBoardStyle={{
            borderRadius: '5px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
        />
      </div>

      <div className="game-controls">
        <button onClick={handleReset} className="control-btn reset-btn">
          🔄 New Game
        </button>
        <button onClick={handleUndo} disabled={game.history().length < 2} className="control-btn undo-btn">
          ↩️ Undo
        </button>
        <button onClick={handleAnalyze} disabled={isAIThinking} className="control-btn analyze-btn">
          🔍 Analyze
        </button>
      </div>

      <p className={`game-message ${isAIThinking ? 'thinking' : ''}`}>{message}</p>

      {showAnalysis && analysis && (
        <div className="analysis-panel">
          <h4>📊 Position Analysis</h4>
          <p><strong>Current Turn:</strong> {analysis.turn}</p>
          <p><strong>Legal Moves:</strong> {analysis.legal_moves_count}</p>
          <p><strong>In Check:</strong> {analysis.is_check ? 'Yes ⚠️' : 'No'}</p>
          {analysis.best_move && (
            <p><strong>Best Move:</strong> {analysis.best_move}</p>
          )}
          {analysis.explanation && (
            <p><strong>Explanation:</strong> {analysis.explanation}</p>
          )}
          {analysis.material && (
            <p><strong>Material:</strong> White {analysis.material.white} vs Black {analysis.material.black}</p>
          )}
          <button onClick={() => setShowAnalysis(false)} className="close-btn">Close</button>
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
