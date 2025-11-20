'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { getContentById, type Content } from '@/lib/content/content-service';
import { markAssignmentCompleted } from '@/lib/assignments/assignments-service';
import ChessBoardViewer from '@/components/chess/ChessBoardViewer';
import InteractivePuzzle from '@/components/chess/InteractivePuzzle';

export default function ViewContentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completingAssignment, setCompletingAssignment] = useState(false);

  const contentId = params?.id as string;
  const assignmentId = searchParams?.get('assignmentId');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load content
  useEffect(() => {
    if (user && contentId) {
      loadContent();
    }
  }, [user, contentId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getContentById(contentId);
      console.log('📥 Content retrieved:', data);
      console.log('📋 Content type:', data?.type);
      console.log('📝 Has PGN:', !!data?.pgn, '| Length:', data?.pgn?.length || 0);
      console.log('♟️ Has FEN:', !!data?.fen, '| Value:', data?.fen);
      if (!data) {
        setError('Content not found');
      } else {
        setContent(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
      console.error('Load content error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/coach/content/${contentId}/edit`);
  };

  const handleBack = () => {
    router.push('/coach/content');
  };

  const handlePuzzleSolved = async () => {
    // If there's an assignment ID, mark it as complete
    if (assignmentId && user?.role === 'player') {
      try {
        setCompletingAssignment(true);
        await markAssignmentCompleted(assignmentId);
        
        // Show success message
        alert('🎉 Puzzle solved! Assignment marked as complete.');
        
        // Optionally redirect back to assignments
        setTimeout(() => {
          router.push('/player/assignments');
        }, 2000);
      } catch (err: any) {
        console.error('Failed to mark assignment complete:', err);
        alert('Puzzle solved, but failed to mark assignment complete: ' + (err.message || 'Unknown error'));
      } finally {
        setCompletingAssignment(false);
      }
    } else {
      // Just show a success message if not part of an assignment
      console.log('Puzzle solved!');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-12 text-center shadow-2xl">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">Content Not Found</h3>
            <p className="text-gray-400 mb-6">{error || 'The content you are looking for does not exist.'}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                      {content.title}
                    </span>
                  </h1>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      content.type === 'lesson'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}
                  >
                    {content.type === 'lesson' ? '📚 Lesson' : '🧩 Puzzle'}
                  </span>
                </div>
                <p className="mt-1 text-gray-400">
                  Created {new Date(content.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {user?.role === 'coach' && content.creator_id === user.id && (
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center space-x-2 shadow-lg shadow-cyan-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chess Board - Left Side */}
          <div className="lg:col-span-7">
            <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 shadow-2xl">
              {/* Type Indicator */}
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border ${
                  content.type === 'lesson'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                }`}>
                  {content.type === 'lesson' ? '📚 LESSON MODE' : '🧩 PUZZLE MODE'}
                </span>
              </div>

              <div className="flex justify-center">
                {content.type === 'lesson' ? (
                  <>
                    {!content.pgn ? (
                      <div className="w-full text-center p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <p className="text-red-400 font-medium mb-2">⚠️ No PGN Data</p>
                        <p className="text-gray-400 text-sm">This lesson doesn't have move notation. Please edit the content to add PGN.</p>
                      </div>
                    ) : (
                      <ChessBoardViewer
                        pgn={content.pgn}
                        fen={content.fen}
                        showControls={true}
                        width={480}
                        allowExploration={true}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {!content.fen ? (
                      <div className="w-full text-center p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <p className="text-red-400 font-medium mb-2">⚠️ No FEN Position</p>
                        <p className="text-gray-400 text-sm">This puzzle doesn't have a position. Please edit the content to add FEN notation.</p>
                      </div>
                    ) : (
                      <InteractivePuzzle
                        fen={content.fen}
                        width={480}
                        onSolved={handlePuzzleSolved}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel - Right Side */}
          <div className="lg:col-span-5 space-y-6">
            {/* Lesson Instructions */}
            {content.type === 'lesson' && (
              <div className="bg-gradient-to-br from-blue-500/10 via-transparent to-transparent backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-3">📚 Study This Lesson</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Navigate through the game move-by-move using the controls below the board. You can also drag pieces to explore variations!
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Use ▶️ Next to advance through moves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Drag pieces to explore your own ideas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Click "Return to main line" to get back</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notation Display */}
            {content.type === 'lesson' && content.pgn && (
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Game Notation (PGN)
                </h3>
                <pre className="bg-black/30 border border-gray-600/30 rounded-xl p-4 text-sm font-mono text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
{content.pgn}
                </pre>
              </div>
            )}

            {content.type === 'puzzle' && content.fen && (
              <>
                <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    Position (FEN)
                  </h3>
                  <pre className="bg-black/30 border border-gray-600/30 rounded-xl p-4 text-sm font-mono text-gray-300 overflow-x-auto break-all">
{content.fen}
                  </pre>
                </div>

                {/* Puzzle Instructions */}
                <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-transparent backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-lg font-semibold text-white mb-3">🎯 Solve This Puzzle</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Analyze the position and find the best move. Consider tactics, checkmates, and winning combinations.
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Look for checks, captures, and attacks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Consider all opponent responses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span>Calculate variations to the end</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {content.metadata && Object.keys(content.metadata).length > 0 && (
              <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h3>
                <div className="space-y-3">
                  {Object.entries(content.metadata).map(([key, value]) => (
                    <div key={key} className="bg-white/5 border border-gray-600/30 rounded-xl p-4">
                      <div className="text-sm font-medium text-cyan-400 uppercase tracking-wider mb-1">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-gray-300">
                        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
