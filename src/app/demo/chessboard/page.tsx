'use client';

import { useState } from 'react';
import ChessBoardViewer from '@/components/chess/ChessBoardViewer';

export default function ChessBoardDemoPage() {
  const [demoType, setDemoType] = useState<'pgn' | 'fen'>('pgn');

  // Sample PGN (Scholar's Mate)
  const samplePGN = `[Event "Casual Game"]
[Site "?"]
[Date "2025.10.25"]
[Round "?"]
[White "Player 1"]
[Black "Player 2"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

  // Sample FEN (position after 1.e4)
  const sampleFEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chess Board Viewer Demo</h1>

        {/* Demo type selector */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setDemoType('pgn')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              demoType === 'pgn'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            PGN Demo (Scholar's Mate)
          </button>
          <button
            onClick={() => setDemoType('fen')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              demoType === 'fen'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            FEN Demo (Position)
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Chess board */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {demoType === 'pgn' ? 'PGN Viewer' : 'FEN Viewer'}
            </h2>
            <ChessBoardViewer
              pgn={demoType === 'pgn' ? samplePGN : undefined}
              fen={demoType === 'fen' ? sampleFEN : undefined}
              showControls={demoType === 'pgn'}
              width={400}
            />
          </div>

          {/* Source code display */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {demoType === 'pgn' ? 'PGN Source' : 'FEN Source'}
            </h2>
            <pre className="bg-gray-100 p-4 rounded text-sm text-gray-900 overflow-auto max-h-96">
              {demoType === 'pgn' ? samplePGN : sampleFEN}
            </pre>

            <div className="mt-6 space-y-2 text-sm text-gray-900">
              <p><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                {demoType === 'pgn' ? (
                  <>
                    <li>Navigate through moves with controls</li>
                    <li>Jump to start/end positions</li>
                    <li>Shows current move number</li>
                    <li>Displays check/checkmate status</li>
                  </>
                ) : (
                  <>
                    <li>Static position display</li>
                    <li>FEN notation support</li>
                    <li>Perfect for puzzles</li>
                    <li>No move playback needed</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>PGN Mode:</strong> Paste a full chess game in PGN format. Use the navigation
              controls to step through moves.
            </p>
            <p>
              <strong>FEN Mode:</strong> Paste a FEN string to display a specific board position.
              Great for chess puzzles!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
