'use client';

import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';

interface InteractivePuzzleProps {
  fen: string;
  onSolved?: () => void;
  width?: number;
}

export default function InteractivePuzzle({
  fen,
  onSolved,
  width = 480,
}: InteractivePuzzleProps) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [position, setPosition] = useState(fen);
  const [moveCount, setMoveCount] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect' | 'solved'>('none');
  const [message, setMessage] = useState('');
  const [key, setKey] = useState(0);

  useEffect(() => {
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setPosition(fen);
      setKey(prev => prev + 1);
    } catch (error) {
      console.error('Invalid FEN:', error);
    }
  }, [fen]);

  const onDrop = ({ piece, sourceSquare, targetSquare }: { 
    piece: { isSparePiece: boolean; position: string; pieceType: string }; 
    sourceSquare: string; 
    targetSquare: string | null 
  }) => {
    if (!targetSquare) return false;
    
    try {
      const newGame = new Chess(game.fen());
      
      // Try to make the move
      const move = newGame.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q', // Always promote to queen for simplicity
      });

      if (move === null) {
        setFeedback('incorrect');
        setMessage('❌ Illegal move! Try again.');
        setTimeout(() => {
          setFeedback('none');
          setMessage('');
        }, 2000);
        return false;
      }

      // Move was legal
      setGame(newGame);
      setPosition(newGame.fen());
      setMoveCount(prev => prev + 1);
      setKey(prev => prev + 1);

      // Check if puzzle is solved (checkmate or specific winning position)
      if (newGame.isCheckmate()) {
        setFeedback('solved');
        setMessage('🎉 Checkmate! Puzzle solved!');
        if (onSolved) {
          setTimeout(() => onSolved(), 1500);
        }
      } else if (newGame.isCheck()) {
        setFeedback('correct');
        setMessage('✓ Check! Good move!');
        setTimeout(() => {
          setFeedback('none');
          setMessage('');
        }, 2000);
      } else {
        setFeedback('correct');
        setMessage('✓ Good move! Continue...');
        setTimeout(() => {
          setFeedback('none');
          setMessage('');
        }, 2000);
      }

      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  };

  const resetPuzzle = () => {
    try {
      const newGame = new Chess(fen);
      setGame(newGame);
      setPosition(fen);
      setMoveCount(0);
      setFeedback('none');
      setMessage('');
      setKey(prev => prev + 1);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-gray-600/30 rounded-2xl overflow-hidden shadow-2xl" style={{ width: `${width}px` }}>
        <Chessboard
          key={key}
          options={{
            position: position,
            allowDragging: true,
            showNotation: true,
            animationDurationInMs: 300,
            onPieceDrop: onDrop,
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-300 font-medium bg-white/5 px-4 py-2 rounded-xl border border-gray-600/30">
          Moves: {moveCount}
        </div>
        <button
          onClick={resetPuzzle}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-gray-600/30 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>

      {/* Feedback Messages */}
      {message && (
        <div
          className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${
            feedback === 'solved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
              : feedback === 'correct'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : feedback === 'incorrect'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
          }`}
        >
          {message}
        </div>
      )}

      {/* Game Status */}
      <div className="text-sm text-gray-300 space-y-1">
        {game.isCheckmate() && feedback !== 'solved' && (
          <div className="text-emerald-400 font-bold bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30">
            Checkmate!
          </div>
        )}
        {game.isCheck() && !game.isCheckmate() && (
          <div className="text-orange-400 font-bold bg-orange-500/20 px-4 py-2 rounded-xl border border-orange-500/30">
            Check!
          </div>
        )}
        {game.isDraw() && (
          <div className="text-gray-300 font-bold bg-gray-500/20 px-4 py-2 rounded-xl border border-gray-500/30">
            Draw
          </div>
        )}
        {game.isStalemate() && (
          <div className="text-gray-300 bg-gray-500/20 px-4 py-2 rounded-xl border border-gray-500/30">
            Stalemate
          </div>
        )}
      </div>
    </div>
  );
}
