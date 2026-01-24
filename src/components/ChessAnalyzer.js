import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { getBestMove, analyzePosition, checkAIHealth } from '../api/chessApi';
import './ChessAnalyzer.css';

const ChessAnalyzer = () => {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [message, setMessage] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking...');
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [gameMode, setGameMode] = useState('play'); // 'play', 'analyze', 'edit'
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenInput, setFenInput] = useState('');
  const [evaluation, setEvaluation] = useState({ score: 0, advantage: 'Equal' }); // Real-time evaluation
  const [showVariations, setShowVariations] = useState(false); // Collapsed by default

  // Check AI service status
  useEffect(() => {
    const checkAI = async () => {
      try {
        const health = await checkAIHealth();
        // Accept both 'ok' and 'healthy' status
        if (health.status === 'ok' || health.status === 'healthy') {
          setAiStatus('online');
        } else {
          setAiStatus('degraded');
        }
      } catch (error) {
        setAiStatus('offline');
      }
    };
    checkAI();
  }, []);

  // Auto-analyze when in analyze mode
  useEffect(() => {
    if (gameMode === 'analyze') {
      // Trigger analysis when position changes
      const doAnalysis = async () => {
        if (isAIThinking) return;
        setIsAIThinking(true);
        setMessage('🔍 Analyzing position...');
        try {
          const result = await analyzePosition(game.fen());
          setAnalysis(result);
          setShowAnalysis(true);
          setMessage('✅ Analysis complete!');
        } catch (error) {
          setMessage('❌ Analysis failed: ' + error.message);
        }
        setIsAIThinking(false);
      };
      doAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, gameMode]);

  // Update evaluation whenever position changes
  useEffect(() => {
    const updateEvaluation = async () => {
      try {
        const result = await analyzePosition(game.fen());
        if (result.evaluation) {
          setEvaluation(result.evaluation);
        }
        if (result.variations) {
          setAnalysis(prev => ({ ...prev, variations: result.variations }));
        }
      } catch (error) {
        // Fallback to simple material count
        const material = calculateMaterial(game);
        setEvaluation({ score: material, advantage: material > 0 ? 'White' : material < 0 ? 'Black' : 'Equal' });
      }
    };
    updateEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  // Simple material calculation fallback
  const calculateMaterial = (game) => {
    const fen = game.fen();
    const pieces = fen.split(' ')[0];
    let score = 0;
    const values = { 'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9 };
    for (const char of pieces) {
      if (values[char]) score += values[char];
    }
    return score;
  };

  // AI move logic
  const makeAIMove = async () => {
    if (game.isGameOver()) return;
    
    setIsAIThinking(true);
    setMessage('🤔 AI is thinking...');

    try {
      const result = await getBestMove(game.fen());
      
      if (result.best_move) {
        const move = game.move(result.best_move);
        
        if (move) {
          setFen(game.fen());
          setMoveHistory([...moveHistory, { move: move.san, color: move.color }]);
          setMessage(`🤖 AI played: ${result.best_move}`);
          
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
      console.error('AI service error:', error);
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

  // Handle piece drop in edit mode - allows free placement
  const onDropEditMode = (sourceSquare, targetSquare, piece) => {
    // Get current position as object
    const currentPosition = {};
    const fenParts = fen.split(' ')[0];
    let rank = 8;
    let file = 0;
    
    for (const char of fenParts) {
      if (char === '/') {
        rank--;
        file = 0;
      } else if ('12345678'.includes(char)) {
        file += parseInt(char);
      } else {
        const square = String.fromCharCode(97 + file) + rank;
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const pieceType = char.toUpperCase();
        currentPosition[square] = color + pieceType;
        file++;
      }
    }
    
    // Move piece from source to target
    if (sourceSquare !== targetSquare) {
      delete currentPosition[sourceSquare];
      currentPosition[targetSquare] = piece;
    }
    
    // Convert position back to FEN
    const newFen = positionToFen(currentPosition);
    
    // Try to create a valid chess position
    try {
      const testGame = new Chess(newFen);
      setGame(testGame);
      setFen(testGame.fen());
      setMessage('✅ Position updated');
      return true;
    } catch (e) {
      // If not a valid position, still update visually but warn
      setFen(newFen);
      setMessage('⚠️ Position may not be legal for play');
      return true;
    }
  };

  // Convert position object to FEN string
  const positionToFen = (position) => {
    let fen = '';
    for (let rank = 8; rank >= 1; rank--) {
      let emptyCount = 0;
      for (let fileNum = 0; fileNum < 8; fileNum++) {
        const file = String.fromCharCode(97 + fileNum);
        const square = file + rank;
        const piece = position[square];
        
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const pieceChar = piece[1]; // e.g., 'wP' -> 'P'
          fen += piece[0] === 'w' ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (rank > 1) fen += '/';
    }
    return fen + ' w KQkq - 0 1'; // Default: white to move, all castling rights
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    // In edit mode, allow free placement
    if (gameMode === 'edit') {
      return onDropEditMode(sourceSquare, targetSquare, piece);
    }

    if (isAIThinking) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) {
        setMessage('❌ Invalid move');
        return false;
      }

      setFen(game.fen());
      setMoveHistory([...moveHistory, { move: move.san, color: move.color }]);
      setMessage(`✅ You played: ${move.san}`);
      setAnalysis(null);

      if (game.isGameOver()) {
        if (game.isCheckmate()) {
          setMessage('🎉 Checkmate! You win!');
        } else if (game.isDraw()) {
          setMessage('🤝 Draw!');
        }
        return true;
      }

      if (gameMode === 'play') {
        setTimeout(() => makeAIMove(), 500);
      }

      return true;
    } catch (error) {
      setMessage('❌ Invalid move');
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (isAIThinking) return;
    
    setIsAIThinking(true);
    setMessage('🔍 Analyzing position...');
    
    try {
      const result = await analyzePosition(game.fen());
      setAnalysis(result);
      setShowAnalysis(true);
      setMessage('✅ Analysis complete!');
    } catch (error) {
      setMessage('❌ Analysis failed: ' + error.message);
    }
    
    setIsAIThinking(false);
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMessage('🆕 New game started!');
    setAnalysis(null);
    setShowAnalysis(false);
    setMoveHistory([]);
  };

  const handleUndo = () => {
    if (gameMode === 'play') {
      game.undo();
      game.undo();
    } else {
      game.undo();
    }
    setFen(game.fen());
    setMoveHistory(moveHistory.slice(0, -1));
    setMessage('↩️ Move undone');
    setAnalysis(null);
  };

  const handleSetFen = () => {
    try {
      const newGame = new Chess(fenInput);
      setGame(newGame);
      setFen(newGame.fen());
      setMoveHistory([]);
      setMessage('✅ Position loaded!');
      setAnalysis(null);
    } catch (error) {
      setMessage('❌ Invalid FEN string');
    }
  };

  const handleCopyFen = () => {
    navigator.clipboard.writeText(game.fen());
    setMessage('📋 FEN copied to clipboard!');
  };

  const switchMode = (mode) => {
    setGameMode(mode);
    if (mode === 'edit') {
      setMessage('✏️ Edit mode: Drag pieces to rearrange. Use buttons to add/remove pieces.');
    } else if (mode === 'play') {
      setMessage('♟️ Play mode: Make your move, AI will respond.');
    } else if (mode === 'analyze') {
      setMessage('🔬 Analyze mode: Moves will be analyzed automatically.');
    }
  };

  // Clear board (edit mode)
  const handleClearBoard = () => {
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    setFen(emptyFen);
    setMessage('🗑️ Board cleared');
  };

  // Reset to starting position (edit mode)
  const handleResetToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setMessage('🔄 Reset to starting position');
  };

  // Evaluation bar component - Always visible
  const EvaluationBar = () => {
    const score = evaluation?.score || 0;
    // Convert score to percentage (score range: -10 to +10)
    const whitePercent = Math.max(5, Math.min(95, 50 + (score * 4.5)));
    
    return (
      <div className="eval-bar-wrapper">
        <div className="eval-bar" onClick={() => setShowAnalysis(!showAnalysis)}>
          <div className="eval-bar-inner">
            <div 
              className="eval-white" 
              style={{ height: `${whitePercent}%` }}
            >
              {score > 0.5 && (
                <span className="eval-score-inside">+{score.toFixed(1)}</span>
              )}
            </div>
            <div 
              className="eval-black" 
              style={{ height: `${100 - whitePercent}%` }}
            >
              {score < -0.5 && (
                <span className="eval-score-inside">{score.toFixed(1)}</span>
              )}
            </div>
          </div>
          <div className="eval-marker" style={{ bottom: `${whitePercent}%` }} />
        </div>
        <div className="eval-labels">
          <span className="eval-label-top">♔</span>
          <span className={`eval-score-display ${score > 0 ? 'white-winning' : score < 0 ? 'black-winning' : ''}`}>
            {score > 0 ? '+' : ''}{score.toFixed(1)}
          </span>
          <span className="eval-label-bottom">♚</span>
        </div>
      </div>
    );
  };

  // Variations panel component - Collapsible
  const VariationsPanel = ({ variations }) => {
    if (!variations || variations.length === 0) return null;
    
    return (
      <div className={`variations-panel compact ${showVariations ? 'expanded' : ''}`}>
        <div 
          className="variations-header" 
          onClick={() => setShowVariations(!showVariations)}
        >
          <span className="variations-title">📊 Top Moves</span>
          <span className="variations-toggle">{showVariations ? '▼' : '▶'}</span>
        </div>
        {showVariations && (
          <div className="variations-content">
            {variations.map((variation, index) => (
              <div 
                key={index} 
                className={`variation-item compact ${index === 0 ? 'best' : ''}`}
                onClick={() => {
                  try {
                    game.move(variation.move);
                    setFen(game.fen());
                    setMoveHistory([...moveHistory, { move: variation.move, color: game.turn() === 'w' ? 'b' : 'w' }]);
                  } catch (e) {}
                }}
              >
                <span className="variation-rank">{index + 1}</span>
                <span className="variation-move">{variation.move}</span>
                <span className="variation-score">
                  {variation.score > 0 ? '+' : ''}{variation.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="chess-analyzer">
      {/* Header */}
      <div className="analyzer-header">
        <h2>🤖 AI Chess Analyzer</h2>
        <div className={`ai-status ${aiStatus}`}>
          <span className="status-dot"></span>
          AI: {aiStatus}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button 
          className={`mode-btn ${gameMode === 'play' ? 'active' : ''}`}
          onClick={() => switchMode('play')}
        >
          ♟️ Play
        </button>
        <button 
          className={`mode-btn ${gameMode === 'analyze' ? 'active' : ''}`}
          onClick={() => switchMode('analyze')}
        >
          🔬 Analyze
        </button>
        <button 
          className={`mode-btn ${gameMode === 'edit' ? 'active' : ''}`}
          onClick={() => switchMode('edit')}
        >
          ✏️ Edit
        </button>
      </div>

      {/* Main Content */}
      <div className="analyzer-content">
        {/* Left: Evaluation Bar + Chess Board */}
        <div className="board-with-eval">
          {/* Evaluation Bar - Always visible */}
          <EvaluationBar />
          
          <div className="board-column">
            <div className="board-wrapper">
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                areArrowsAllowed={true}
                boardOrientation="white"
                boardWidth={450}
                arePiecesDraggable={true}
                customBoardStyle={{
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
                customDarkSquareStyle={{ backgroundColor: '#779952' }}
                customLightSquareStyle={{ backgroundColor: '#edeed1' }}
              />
            </div>

            {/* Game Message */}
            <div className={`game-message ${isAIThinking ? 'thinking' : ''} ${gameMode === 'edit' ? 'edit-mode' : ''}`}>
              {message || 'Make your move!'}
            </div>

            {/* Control Buttons - Different for Edit mode */}
            {gameMode === 'edit' ? (
              <div className="control-buttons edit-controls">
                <button onClick={handleResetToStart} className="ctrl-btn new-game">
                  🔄 Reset
                </button>
                <button onClick={handleClearBoard} className="ctrl-btn clear">
                  🗑️ Clear
                </button>
                <button onClick={handleCopyFen} className="ctrl-btn copy">
                  📋 Copy FEN
                </button>
              </div>
            ) : (
              <div className="control-buttons">
                <button onClick={handleReset} className="ctrl-btn new-game">
                  🔄 New Game
                </button>
                <button onClick={handleUndo} disabled={moveHistory.length === 0} className="ctrl-btn undo">
                  ↩️ Undo
                </button>
                <button onClick={handleAnalyze} disabled={isAIThinking} className="ctrl-btn analyze">
                  🔍 Analyze
                </button>
                <button onClick={handleCopyFen} className="ctrl-btn copy">
                  📋 Copy FEN
                </button>
              </div>
            )}

            {/* FEN Input */}
            <div className="fen-input-section">
              <input
                type="text"
                placeholder="Paste FEN to load position..."
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                className="fen-input"
              />
              <button onClick={handleSetFen} className="fen-load-btn">
                Load
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="analysis-section">
          {/* Move History */}
          <div className="move-history">
            <h4>📜 Move History</h4>
            <div className="moves-list">
              {moveHistory.length === 0 ? (
                <span className="no-moves">No moves yet</span>
              ) : (
                moveHistory.map((item, index) => (
                  <span 
                    key={index} 
                    className={`move-item ${item.color === 'w' ? 'white' : 'black'}`}
                  >
                    {index % 2 === 0 && <span className="move-number">{Math.floor(index/2) + 1}.</span>}
                    {item.move}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Variations */}
          {analysis && analysis.variations && (
            <VariationsPanel variations={analysis.variations} />
          )}

          {/* Detailed Analysis */}
          {showAnalysis && analysis && (
            <div className="detailed-analysis">
              <h4>📈 Position Analysis</h4>
              
              <div className="analysis-row">
                <span className="label">Turn:</span>
                <span className="value">{analysis.turn}</span>
              </div>
              
              <div className="analysis-row">
                <span className="label">Legal Moves:</span>
                <span className="value">{analysis.legal_moves_count}</span>
              </div>
              
              <div className="analysis-row">
                <span className="label">In Check:</span>
                <span className={`value ${analysis.is_check ? 'warning' : ''}`}>
                  {analysis.is_check ? 'Yes ⚠️' : 'No'}
                </span>
              </div>

              {analysis.evaluation && (
                <>
                  <div className="analysis-row">
                    <span className="label">Evaluation:</span>
                    <span className={`value ${analysis.evaluation.score > 0 ? 'white-advantage' : analysis.evaluation.score < 0 ? 'black-advantage' : ''}`}>
                      {analysis.evaluation.score > 0 ? '+' : ''}{analysis.evaluation.score}
                    </span>
                  </div>
                  <div className="analysis-row">
                    <span className="label">Advantage:</span>
                    <span className="value">{analysis.evaluation.advantage}</span>
                  </div>
                </>
              )}

              {analysis.best_move && (
                <div className="analysis-row highlight">
                  <span className="label">Best Move:</span>
                  <span className="value best-move">{analysis.best_move}</span>
                </div>
              )}

              {analysis.explanation && (
                <div className="analysis-explanation">
                  <span className="label">Explanation:</span>
                  <p>{analysis.explanation}</p>
                </div>
              )}

              {analysis.material && (
                <div className="material-count">
                  <span className="label">Material:</span>
                  <div className="material-bar">
                    <span className="white-material">♔ {analysis.material.white}</span>
                    <span className="black-material">♚ {analysis.material.black}</span>
                  </div>
                </div>
              )}

              {analysis.threats && analysis.threats.length > 0 && (
                <div className="threats-section">
                  <span className="label">⚠️ Threats:</span>
                  <ul>
                    {analysis.threats.map((threat, i) => (
                      <li key={i}>{threat}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => setShowAnalysis(false)} className="close-analysis">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessAnalyzer;
