'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { 
  getPlayerAssignments, 
  markAssignmentCompleted,
  type AssignmentWithDetails 
} from '@/lib/assignments/assignments-service';

type StatusFilter = 'all' | 'assigned' | 'completed';

export default function PlayerAssignmentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Redirect if not authenticated or not a player
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'player') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Load assignments
  useEffect(() => {
    if (user?.role === 'player') {
      loadAssignments();
    }
  }, [user]);

  // Filter assignments
  useEffect(() => {
    let filtered = assignments;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Sort: overdue first, then by due date, then by assigned date
    filtered.sort((a, b) => {
      // Overdue assignments first
      const aOverdue = a.status === 'assigned' && a.due_date && isOverdue(a.due_date);
      const bOverdue = b.status === 'assigned' && b.due_date && isOverdue(b.due_date);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Then by due date (closest first)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      // Finally by assigned date (newest first)
      return new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime();
    });

    setFilteredAssignments(filtered);
  }, [assignments, statusFilter]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPlayerAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Load assignments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (assignmentId: string) => {
    if (!confirm('Mark this assignment as completed?')) {
      return;
    }

    try {
      setProcessingId(assignmentId);
      await markAssignmentCompleted(assignmentId);
      // Update local state
      setAssignments(
        assignments.map((a) =>
          a.id === assignmentId ? { ...a, status: 'completed' as const, completed_at: new Date().toISOString() } : a
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to mark assignment as completed');
      console.error('Mark completed error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading assignments...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: assignments.length,
    assigned: assignments.filter((a) => a.status === 'assigned').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    overdue: assignments.filter((a) => a.status === 'assigned' && a.due_date && isOverdue(a.due_date)).length,
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  My Assignments
                </span>
              </h1>
              <p className="mt-2 text-gray-400">View and complete assignments from your coaches</p>
            </div>
            <button
              onClick={() => router.push('/player')}
              className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-zinc-800"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Assigned</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{stats.assigned}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overdue</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Lesson Type */}
          <div className="bg-gradient-to-br from-blue-500/10 via-transparent to-transparent backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">📚</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Lessons</h3>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
                  STUDY & LEARN
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Study complete games move-by-move to learn openings, strategies, and tactical patterns.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-blue-400 mt-0.5">▶️</span>
                <span>Navigate through moves with Next/Previous buttons</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-blue-400 mt-0.5">🔍</span>
                <span>Drag pieces to explore your own variations</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-blue-400 mt-0.5">↩️</span>
                <span>Return to main line anytime while exploring</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-blue-400 mt-0.5">✓</span>
                <span>Auto-completed when viewed</span>
              </div>
            </div>
          </div>

          {/* Puzzle Type */}
          <div className="bg-gradient-to-br from-purple-500/10 via-transparent to-transparent backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-5xl">🧩</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Puzzles</h3>
                <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">
                  SOLVE & PRACTICE
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Find the winning move in tactical positions. Drag pieces to make your moves and achieve checkmate.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-purple-400 mt-0.5">🎯</span>
                <span>Drag pieces to make your moves</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-purple-400 mt-0.5">✓</span>
                <span>Get instant feedback (correct/incorrect)</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-purple-400 mt-0.5">🔄</span>
                <span>Reset to try different approaches</span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <span className="text-purple-400 mt-0.5">🎉</span>
                <span>Auto-completed when you achieve checkmate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-600/30'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('assigned')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'assigned'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-600/30'
              }`}
            >
              Assigned ({stats.assigned})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === 'completed'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-gray-600/30'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-12 text-center shadow-2xl">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">
              {assignments.length === 0 ? 'No Assignments Yet' : 'No Assignments Found'}
            </h3>
            <p className="text-gray-400">
              {assignments.length === 0
                ? 'Your coach will assign content for you to study.'
                : 'Try adjusting your filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`group bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-all duration-300 ${
                  assignment.status === 'assigned' && assignment.due_date && isOverdue(assignment.due_date)
                    ? 'border-2 border-red-500/50'
                    : 'border border-gray-600/30'
                }`}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">
                      {assignment.content?.type === 'lesson' ? '📚' : '🧩'}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {assignment.content?.title || 'Deleted Content'}
                  </h3>

                  <p className="text-sm text-gray-400 mb-4">
                    From: {assignment.coach?.display_name || assignment.coach?.email || 'Unknown Coach'}
                  </p>

                  {/* Due Date */}
                  {assignment.due_date && (
                    <div
                      className={`flex items-center text-sm mb-4 ${
                        isOverdue(assignment.due_date) && assignment.status === 'assigned'
                          ? 'text-red-400 font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {isOverdue(assignment.due_date) && assignment.status === 'assigned' ? (
                        <span>Overdue by {Math.abs(getDaysUntilDue(assignment.due_date))} days</span>
                      ) : assignment.status === 'assigned' ? (
                        <span>Due in {getDaysUntilDue(assignment.due_date)} days</span>
                      ) : (
                        <span>Was due {new Date(assignment.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}

                  {/* Completion Info */}
                  {assignment.status === 'completed' && assignment.completed_at && (
                    <div className="flex items-center text-sm text-emerald-400 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Completed {new Date(assignment.completed_at).toLocaleDateString()}
                    </div>
                  )}

                  {/* Assigned Date */}
                  <p className="text-xs text-gray-500">
                    Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-gray-600/30">
                  <button
                    onClick={() => router.push(`/coach/content/${assignment.content_id}?assignmentId=${assignment.id}`)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors"
                  >
                    View Content →
                  </button>
                  {assignment.status === 'assigned' && (
                    <button
                      onClick={() => handleMarkCompleted(assignment.id)}
                      disabled={processingId === assignment.id}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25"
                    >
                      {processingId === assignment.id ? 'Marking...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
