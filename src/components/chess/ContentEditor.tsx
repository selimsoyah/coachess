'use client';

import { useState } from 'react';
import { Chess } from 'chess.js';
import ChessBoardViewer from './ChessBoardViewer';

interface ContentEditorProps {
  initialTitle?: string;
  initialType?: 'lesson' | 'puzzle';
  initialPgn?: string;
  initialFen?: string;
  onSave?: (data: ContentData) => void;
  onCancel?: () => void;
}

export interface ContentData {
  title: string;
  type: 'lesson' | 'puzzle';
  pgn?: string;
  fen?: string;
}

export default function ContentEditor({
  initialTitle = '',
  initialType = 'lesson',
  initialPgn = '',
  initialFen = '',
  onSave,
  onCancel,
}: ContentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState<'lesson' | 'puzzle'>(initialType);
  const [pgn, setPgn] = useState(initialPgn);
  const [fen, setFen] = useState(initialFen);
  const [validationError, setValidationError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Validate PGN or FEN
  const validateContent = (contentType: 'lesson' | 'puzzle', pgnValue: string, fenValue: string) => {
    setValidationError('');
    
    try {
      if (contentType === 'lesson' && pgnValue) {
        // Validate PGN
        const game = new Chess();
        game.loadPgn(pgnValue);
        setIsValid(true);
        return true;
      } else if (contentType === 'puzzle' && fenValue) {
        // Validate FEN
        const game = new Chess();
        game.load(fenValue);
        setIsValid(true);
        return true;
      } else {
        setValidationError('Please provide content');
        setIsValid(false);
        return false;
      }
    } catch (error: any) {
      setValidationError(error.message || 'Invalid chess notation');
      setIsValid(false);
      return false;
    }
  };

  const handlePgnChange = (value: string) => {
    setPgn(value);
    if (type === 'lesson') {
      validateContent('lesson', value, fen);
    }
  };

  const handleFenChange = (value: string) => {
    setFen(value);
    if (type === 'puzzle') {
      validateContent('puzzle', pgn, value);
    }
  };

  const handleTypeChange = (newType: 'lesson' | 'puzzle') => {
    setType(newType);
    validateContent(newType, pgn, fen);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setValidationError('Title is required');
      return;
    }

    if (validateContent(type, pgn, fen)) {
      const game = new Chess();
      
      // For lessons, include both PGN and starting FEN
      // For puzzles, include FEN (and optionally PGN if provided)
      const data: ContentData = {
        title: title.trim(),
        type,
      };

      if (type === 'lesson') {
        if (pgn) {
          data.pgn = pgn;
          // Also include the starting FEN for lessons
          data.fen = game.fen(); // Starting position
        }
      } else {
        // Puzzle
        if (fen) {
          data.fen = fen;
        }
      }

      onSave?.(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Scholar's Mate, Endgame Puzzle #42"
          className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/30 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Content Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeChange('lesson')}
            className={`p-4 border-2 rounded-xl text-center transition-all ${
              type === 'lesson'
                ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-300 shadow-lg shadow-amber-500/20'
                : 'border-gray-600/30 bg-gray-800/30 hover:border-gray-500/50 hover:bg-gray-800/50 text-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Lesson</div>
            <div className="text-xs text-gray-400">Full game with moves (PGN)</div>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('puzzle')}
            className={`p-4 border-2 rounded-xl text-center transition-all ${
              type === 'puzzle'
                ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-300 shadow-lg shadow-cyan-500/20'
                : 'border-gray-600/30 bg-gray-800/30 hover:border-gray-500/50 hover:bg-gray-800/50 text-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🧩</div>
            <div className="font-semibold">Puzzle</div>
            <div className="text-xs text-gray-400">Position to solve (FEN)</div>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Area */}
        <div>
          {type === 'lesson' ? (
            <div>
              <label htmlFor="pgn" className="block text-sm font-medium text-gray-200 mb-2">
                PGN (Portable Game Notation) *
              </label>
              <textarea
                id="pgn"
                value={pgn}
                onChange={(e) => handlePgnChange(e.target.value)}
                placeholder={`[Event "Casual Game"]
[Site "?"]
[Date "2025.10.25"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5`}
                rows={12}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/30 rounded-lg text-gray-100 placeholder-gray-500 font-mono text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="fen" className="block text-sm font-medium text-gray-200 mb-2">
                FEN (Forsyth-Edwards Notation) *
              </label>
              <textarea
                id="fen"
                value={fen}
                onChange={(e) => handleFenChange(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
                rows={4}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/30 rounded-lg text-gray-100 placeholder-gray-500 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
              <p className="mt-2 text-xs text-gray-400">
                Paste the FEN string for the puzzle position. Students will need to find the best move from this position.
              </p>
            </div>
          )}

          {/* Validation Status */}
          {validationError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-300">Validation Error</p>
                  <p className="text-sm text-red-400 mt-1">{validationError}</p>
                </div>
              </div>
            </div>
          )}

          {isValid && !validationError && (type === 'lesson' ? pgn : fen) && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-emerald-300">Valid chess notation ✓</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Live Preview
          </label>
          <div className="bg-gray-900/30 backdrop-blur-sm p-4 rounded-xl border border-gray-600/30">
            {isValid && (type === 'lesson' ? pgn : fen) ? (
              <ChessBoardViewer
                pgn={type === 'lesson' ? pgn : undefined}
                fen={type === 'puzzle' ? fen : undefined}
                showControls={type === 'lesson'}
                width={350}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400">Enter valid {type === 'lesson' ? 'PGN' : 'FEN'} to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700/50">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-600/30 text-gray-300 rounded-lg hover:bg-gray-800/50 hover:border-gray-500/50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || !title.trim()}
          className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
        >
          Save Content
        </button>
      </div>
    </div>
  );
}
