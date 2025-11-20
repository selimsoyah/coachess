'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import { getMyContent, deleteContent, type Content } from '@/lib/content/content-service';

export default function ContentLibraryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lesson' | 'puzzle'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Redirect if not authenticated or not a coach
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'coach') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Load content
  useEffect(() => {
    if (user?.role === 'coach') {
      loadContent();
    }
  }, [user]);

  // Filter content when search or type filter changes
  useEffect(() => {
    let filtered = content;

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(query)
      );
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, typeFilter]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyContent();
      setContent(data);
      setFilteredContent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
      console.error('Load content error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContent(id);
      setContent((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/coach/content/${id}/edit`);
  };

  const handleView = (id: string) => {
    router.push(`/coach/content/${id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative">
      {/* Decorative blur orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border-b border-gray-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Content Library</h1>
              <p className="mt-1 text-gray-300">Manage your chess lessons and puzzles</p>
            </div>
            <button
              onClick={() => router.push('/coach/content/new')}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-amber-500/20 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
                className="w-full px-4 py-2 bg-white/5 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Content Type
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                    typeFilter === 'all'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('lesson')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                    typeFilter === 'lesson'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  📚 Lessons
                </button>
                <button
                  onClick={() => setTypeFilter('puzzle')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all ${
                    typeFilter === 'puzzle'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  🧩 Puzzles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-4 mb-6 backdrop-blur-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content Grid/Table */}
        {filteredContent.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No content found</h3>
            <p className="text-gray-300 mb-6">
              {searchQuery || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first lesson or puzzle'}
            </p>
            <button
              onClick={() => router.push('/coach/content/new')}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-amber-500/20"
            >
              Create Content
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-600/30">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600/30">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-all hover:scale-[1.02]">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{item.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium border ${
                          item.type === 'lesson'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {item.type === 'lesson' ? '📚 Lesson' : '🧩 Puzzle'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(item.id)}
                          className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded-xl hover:bg-blue-500/10 transition-all"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-gray-300 hover:text-white px-3 py-1 rounded-xl hover:bg-white/10 transition-all"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-400 hover:text-red-300 px-3 py-1 rounded-xl hover:bg-red-500/10 text-xs font-medium transition-all"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-300 hover:text-white px-3 py-1 rounded-xl hover:bg-white/10 text-xs font-medium transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="text-red-400 hover:text-red-300 px-3 py-1 rounded-xl hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-4 hover:scale-[1.02] transition-transform">
            <div className="text-2xl font-bold text-white">{content.length}</div>
            <div className="text-sm text-gray-400">Total Content</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-4 hover:scale-[1.02] transition-transform shadow-blue-500/10">
            <div className="text-2xl font-bold text-blue-400">
              {content.filter((c) => c.type === 'lesson').length}
            </div>
            <div className="text-sm text-gray-400">Lessons</div>
          </div>
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-4 hover:scale-[1.02] transition-transform shadow-purple-500/10">
            <div className="text-2xl font-bold text-purple-400">
              {content.filter((c) => c.type === 'puzzle').length}
            </div>
            <div className="text-sm text-gray-400">Puzzles</div>
          </div>
        </div>
      </div>
    </div>
  );
}
