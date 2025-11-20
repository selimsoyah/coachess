'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { getMyContent, type Content } from '@/lib/content/content-service';
import { getCoachConnections, type ConnectionWithUsers } from '@/lib/connections/connections-service';
import { createAssignment } from '@/lib/assignments/assignments-service';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [connections, setConnections] = useState<ConnectionWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [selectedContent, setSelectedContent] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Redirect if not authenticated or not a coach
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'coach') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Load content and connections
  useEffect(() => {
    if (user?.role === 'coach') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [contentData, connectionsData] = await Promise.all([
        getMyContent(),
        getCoachConnections(),
      ]);
      
      setContent(contentData);
      // Filter only accepted connections
      setConnections(connectionsData.filter((c) => c.status === 'accepted'));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContent) {
      alert('Please select content to assign');
      return;
    }

    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    try {
      setCreating(true);
      setError('');

      await createAssignment({
        content_id: selectedContent,
        player_id: selectedPlayer,
        due_date: dueDate || undefined,
      });

      // Redirect to assignments page
      router.push('/coach/assignments');
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
      console.error('Create assignment error:', err);
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/coach/assignments');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedContentData = content.find((c) => c.id === selectedContent);
  const selectedConnectionData = connections.find((c) => c.player_id === selectedPlayer);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-900"
              disabled={creating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
              <p className="mt-1 text-gray-600">Assign content to a connected player</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {content.length === 0 || connections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {content.length === 0 ? 'No Content Available' : 'No Connected Players'}
            </h3>
            <p className="text-gray-600 mb-6">
              {content.length === 0
                ? 'You need to create some content before you can assign it.'
                : 'You need to connect with players before you can assign content.'}
            </p>
            <div className="flex justify-center space-x-4">
              {content.length === 0 && (
                <button
                  onClick={() => router.push('/coach/content/new')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Content
                </button>
              )}
              {connections.length === 0 && (
                <button
                  onClick={() => router.push('/coach/connections')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Invite Players
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            {/* Select Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                Content to Assign *
              </label>
              <select
                id="content"
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select content...</option>
                {content.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.type === 'lesson' ? '📚' : '🧩'} {item.title}
                  </option>
                ))}
              </select>
              {selectedContentData && (
                <p className="mt-2 text-sm text-gray-600">
                  Type: {selectedContentData.type} • Created {new Date(selectedContentData.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Select Player */}
            <div>
              <label htmlFor="player" className="block text-sm font-medium text-gray-900 mb-2">
                Assign to Player *
              </label>
              <select
                id="player"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select player...</option>
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.player_id}>
                    {connection.player?.display_name || connection.player?.email}
                  </option>
                ))}
              </select>
              {selectedConnectionData?.player && (
                <p className="mt-2 text-sm text-gray-600">
                  Email: {selectedConnectionData.player.email} • Connected {new Date(selectedConnectionData.created_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Due Date (Optional) */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900 mb-2">
                Due Date (Optional)
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-xs text-gray-600">
                Leave empty for no deadline, or set a date when the player should complete this assignment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={creating}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !selectedContent || !selectedPlayer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating Assignment...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
