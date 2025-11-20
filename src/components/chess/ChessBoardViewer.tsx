'use client';

import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

interface ChessBoardViewerProps {
  pgn?: string;
  fen?: string;
  orientation?: 'white' | 'black';
  showControls?: boolean;
  width?: number;
  allowExploration?: boolean; // New prop to allow moving pieces freely
}

export default function ChessBoardViewer({
  pgn,
  fen,
  orientation = 'white',
  showControls = true,
  width = 400,
  allowExploration = false,
}: ChessBoardViewerProps) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentMove, setCurrentMove] = useState(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [position, setPosition] = useState(game.fen());
  const [key, setKey] = useState(0); // Force re-render
  const [isExploring, setIsExploring] = useState(false);
  const [mainLinePosition, setMainLinePosition] = useState(game.fen());

  useEffect(() => {
    const newGame = new Chess();
    
    try {
      if (pgn) {
        console.log('ChessBoardViewer: Loading PGN:', pgn);
        // Load PGN and extract all moves
        newGame.loadPgn(pgn);
        const history = newGame.history();
        console.log('ChessBoardViewer: Extracted moves:', history.length, history);
        setMoves(history);
        
        // Reset to starting position
        newGame.reset();
        setGame(newGame);
        setPosition(newGame.fen());
        setCurrentMove(0);
        setMainLinePosition(newGame.fen());
        setKey(prev => prev + 1); // Force re-render
      } else if (fen) {
        console.log('ChessBoardViewer: Loading FEN:', fen);
        // Load just the FEN position
        newGame.load(fen);
        setGame(newGame);
        setPosition(newGame.fen());
        setMoves([]);
        setCurrentMove(0);
        setMainLinePosition(newGame.fen());
        setKey(prev => prev + 1); // Force re-render
      } else {
        console.log('ChessBoardViewer: No PGN or FEN provided, using starting position');
        setGame(newGame);
        setPosition(newGame.fen());
        setMoves([]);
        setCurrentMove(0);
        setMainLinePosition(newGame.fen());
        setKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('ChessBoardViewer: Invalid PGN or FEN:', error);
      // Fallback to starting position
      setGame(newGame);
      setPosition(newGame.fen());
      setMoves([]);
      setCurrentMove(0);
      setMainLinePosition(newGame.fen());
      setKey(prev => prev + 1);
    }
  }, [pgn, fen]);

  const goToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setPosition(newGame.fen());
    setCurrentMove(0);
    setKey(prev => prev + 1);
    setIsExploring(false);
    setMainLinePosition(newGame.fen());
  };

  const goToPrevious = () => {
    if (currentMove > 0) {
      const newGame = new Chess();
      
      // Replay moves up to current - 1
      for (let i = 0; i < currentMove - 1; i++) {
        try {
          newGame.move(moves[i]);
        } catch (error) {
          console.error('Error moving:', error);
        }
      }
      
      setGame(newGame);
      setPosition(newGame.fen());
      setCurrentMove(currentMove - 1);
      setKey(prev => prev + 1);
      setIsExploring(false);
      setMainLinePosition(newGame.fen());
    }
  };

  const goToNext = () => {
    if (currentMove < moves.length) {
      console.log('Going to next move:', moves[currentMove], 'from position:', game.fen());
      const newGame = new Chess(game.fen());
      try {
        newGame.move(moves[currentMove]);
        console.log('New position:', newGame.fen());
        setGame(newGame);
        setPosition(newGame.fen());
        setCurrentMove(currentMove + 1);
        setKey(prev => prev + 1);
        setIsExploring(false);
        setMainLinePosition(newGame.fen());
      } catch (error) {
        console.error('Error moving:', error);
      }
    }
  };

  const goToEnd = () => {
    const newGame = new Chess();
    
    // Replay all moves
    moves.forEach(move => {
      try {
        newGame.move(move);
      } catch (error) {
        console.error('Error moving:', error);
      }
    });
    
    setGame(newGame);
    setPosition(newGame.fen());
    setCurrentMove(moves.length);
    setKey(prev => prev + 1);
    setIsExploring(false);
    setMainLinePosition(newGame.fen());
  };

  const handlePieceDrop = ({ piece, sourceSquare, targetSquare }: {
    piece: { isSparePiece: boolean; position: string; pieceType: string };
    sourceSquare: string;
    targetSquare: string | null;
  }) => {
    if (!allowExploration || !targetSquare) return false;

    try {
      const newGame = new Chess(game.fen());
      const move = newGame.move({
        from: sourceSquare as any,
        to: targetSquare as any,
        promotion: 'q',
      });

      if (move) {
        setGame(newGame);
        setPosition(newGame.fen());
        setKey(prev => prev + 1);
        setIsExploring(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToMainLine = () => {
    const newGame = new Chess(mainLinePosition);
    setGame(newGame);
    setPosition(mainLinePosition);
    setKey(prev => prev + 1);
    setIsExploring(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Exploration Mode Indicator */}
      {isExploring && allowExploration && (
        <div className="bg-purple-500/20 border border-purple-500/40 rounded-xl px-4 py-2 flex items-center gap-3">
          <span className="text-purple-300 text-sm font-medium">
            🔍 Exploring variations
          </span>
          <button
            onClick={resetToMainLine}
            className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-xs rounded-lg transition-all border border-purple-400/30"
          >
            Return to main line
          </button>
        </div>
      )}

      <div className="border-2 border-gray-600/30 rounded-2xl overflow-hidden shadow-2xl" style={{ width: `${width}px` }}>
        <Chessboard
          key={key}
          options={{
            position: position,
            boardOrientation: orientation,
            allowDragging: allowExploration,
            showNotation: true,
            animationDurationInMs: 300,
            onPieceDrop: allowExploration ? handlePieceDrop : undefined,
          }}
        />
      </div>

      {showControls && moves.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-center">
          <p className="text-amber-400 text-sm font-medium">
            ℹ️ No moves to navigate - This lesson needs PGN data
          </p>
          {allowExploration && (
            <p className="text-gray-400 text-xs mt-1">
              You can still drag pieces to explore positions
            </p>
          )}
        </div>
      )}

      {showControls && moves.length > 0 && (
        <div className="flex flex-col items-center space-y-3 w-full">
          {/* Move counter */}
          <div className="text-sm text-gray-300 font-medium bg-white/5 px-4 py-2 rounded-xl border border-gray-600/30">
            Move {currentMove} of {moves.length}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToStart}
              disabled={currentMove === 0}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-gray-600 text-gray-300 rounded-xl transition-all border border-gray-600/30"
              title="Go to start"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToPrevious}
              disabled={currentMove === 0}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-gray-600 text-gray-300 rounded-xl transition-all border border-gray-600/30"
              title="Previous move"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              disabled={currentMove === moves.length}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl transition-all shadow-lg shadow-amber-500/25"
              title="Next move"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={goToEnd}
              disabled={currentMove === moves.length}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:text-gray-600 text-gray-300 rounded-xl transition-all border border-gray-600/30"
              title="Go to end"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Current move display */}
          {currentMove > 0 && (
            <div className="text-sm bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/30">
              <span className="font-semibold">
                {Math.ceil(currentMove / 2)}.{currentMove % 2 === 1 ? '' : '..'} {moves[currentMove - 1]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game info */}
      <div className="text-sm text-gray-300 space-y-1">
        {game.isCheckmate() && <div className="text-red-400 font-bold bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30">Checkmate!</div>}
        {game.isCheck() && <div className="text-orange-400 font-bold bg-orange-500/20 px-4 py-2 rounded-xl border border-orange-500/30">Check!</div>}
        {game.isDraw() && <div className="text-gray-300 font-bold bg-gray-500/20 px-4 py-2 rounded-xl border border-gray-500/30">Draw</div>}
        {game.isStalemate() && <div className="text-gray-300 bg-gray-500/20 px-4 py-2 rounded-xl border border-gray-500/30">Stalemate</div>}
      </div>
    </div>
  );
}
