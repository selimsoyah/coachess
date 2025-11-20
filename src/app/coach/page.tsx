'use client';

import { useEffect, useState } from 'react';
import { useRequireRole } from '@/lib/auth/hooks';
import { signOut } from '@/lib/auth/auth-raw';
import { useRouter } from 'next/navigation';
import { getMyContent, type Content } from '@/lib/content/content-service';
import { getCoachConnections } from '@/lib/connections/connections-service';
import { getCoachAssignments } from '@/lib/assignments/assignments-service';

export default function CoachDashboard() {
  const { user, loading } = useRequireRole(['coach']);
  const router = useRouter();
  const [stats, setStats] = useState({
    contentCount: 0,
    connectionsCount: 0,
    assignmentsCount: 0,
  });
  const [recentContent, setRecentContent] = useState<Content[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'coach') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const [content, connections, assignments] = await Promise.all([
        getMyContent(),
        getCoachConnections(),
        getCoachAssignments(),
      ]);

      setStats({
        contentCount: content.length,
        connectionsCount: connections.filter(c => c.status === 'accepted').length,
        assignmentsCount: assignments.filter(a => a.status === 'assigned').length,
      });
      
      // Set recent content (last 3)
      setRecentContent(content.slice(0, 3));
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-zinc-800"></div>
            <div className="absolute inset-0 inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-amber-500"></div>
          </div>
          <p className="mt-6 text-gray-400 font-light text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold">
                <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Hey, {user.role || 'Coach'}!
                </span>
                <span className="ml-3 inline-block animate-bounce">👋</span>
              </h1>
              <p className="text-gray-400 text-base max-w-2xl">
                Welcome to your personal dashboard. Here you can view your recent conversations and repertoires.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/5 border border-transparent hover:border-zinc-800"
              >
                Home
              </button>
              <button
                onClick={handleSignOut}
                className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 transition-all rounded-xl border border-zinc-700 overflow-hidden"
              >
                <span className="relative z-10">Sign Out</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-8 py-12 space-y-8">
        {/* Hero Stats Section - Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Large Featured Card - Summary */}
          <div className="lg:col-span-7 group relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-10 overflow-hidden shadow-2xl">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Decorative mesh pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-cyan-500/20">
                  <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Summary</h2>
                  <p className="text-gray-500 text-sm">Overview of your activities</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="group/stat relative p-6 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 transition-all duration-300 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-2xl"></div>
                  <svg className="w-8 h-8 text-amber-400 mb-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-4xl font-bold text-white mb-2 relative">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-10 bg-gray-600 animate-pulse rounded"></span>
                    ) : (
                      stats.contentCount
                    )}
                  </p>
                  <p className="text-gray-300 text-sm uppercase tracking-wider relative">Content</p>
                </div>

                <div className="group/stat relative p-6 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 transition-all duration-300 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-2xl"></div>
                  <svg className="w-8 h-8 text-purple-400 mb-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-4xl font-bold text-white mb-2 relative">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-10 bg-gray-600 animate-pulse rounded"></span>
                    ) : (
                      stats.connectionsCount
                    )}
                  </p>
                  <p className="text-gray-300 text-sm uppercase tracking-wider relative">Players</p>
                </div>

                <div className="group/stat relative p-6 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 transition-all duration-300 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity rounded-2xl"></div>
                  <svg className="w-8 h-8 text-emerald-400 mb-4 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-4xl font-bold text-white mb-2 relative">
                    {statsLoading ? (
                      <span className="inline-block w-12 h-10 bg-gray-600 animate-pulse rounded"></span>
                    ) : (
                      stats.assignmentsCount
                    )}
                  </p>
                  <p className="text-gray-300 text-sm uppercase tracking-wider relative">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Cards Stack */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Action Card 1 */}
            <button
              onClick={() => router.push('/coach/content/new')}
              className="group relative w-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-xl border border-amber-500/20 hover:border-amber-500/40 rounded-3xl p-8 text-left overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">➕</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">New Repertoire</h3>
                  <p className="text-gray-400 text-sm">Create your next masterpiece</p>
                </div>
                <svg className="w-6 h-6 text-amber-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>

            {/* Quick Action Card 2 */}
            <button
              onClick={() => router.push('/coach/connections')}
              className="group relative w-full bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 rounded-3xl p-8 text-left overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Manage Players</h3>
                  <p className="text-gray-400 text-sm">View and connect with students</p>
                </div>
                <svg className="w-6 h-6 text-purple-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Repertoires - Full Width Feature */}
        <div className="group relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-10 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-blue-500/20">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Recent Repertoires</h2>
                  <p className="text-gray-500 text-sm">Your latest openings and strategies</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/coach/content/new')}
                className="group/btn px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
              >
                <span className="text-lg">+</span>
                <span>New Repertoire</span>
                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            {/* Content List or Empty State */}
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : recentContent.length > 0 ? (
              <div className="space-y-4">
                {recentContent.map((content) => (
                  <button
                    key={content.id}
                    onClick={() => router.push(`/coach/content/${content.id}`)}
                    className="group/item relative w-full p-6 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-blue-500/40 transition-all shadow-lg text-left"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity rounded-2xl"></div>
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 ${content.type === 'lesson' ? 'bg-blue-500/20' : 'bg-purple-500/20'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <span className="text-2xl">{content.type === 'lesson' ? '📚' : '🧩'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold text-lg truncate">{content.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                              content.type === 'lesson' 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              {content.type === 'lesson' ? '📖 Lesson' : '🎯 Puzzle'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Created {new Date(content.created_at).toLocaleDateString()}
                            </span>
                            {content.type === 'lesson' && content.pgn && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {content.pgn.split(/\d+\./).length - 1} moves
                              </span>
                            )}
                            {content.type === 'puzzle' && content.fen && (
                              <span className="flex items-center gap-1">
                                ♟ Position ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/coach/content/${content.id}/edit`);
                          }}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <svg className="w-5 h-5 text-blue-500 opacity-0 group-hover/item:opacity-100 transform translate-x-0 group-hover/item:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative py-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
                </div>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl mb-6 backdrop-blur-sm border border-blue-500/20">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No repertoires yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">Start building your opening repertoire and share your chess knowledge with your students.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Grid - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Club Invitations */}
          <div className="group relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-red-500/20">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Club Invitations</h2>
                  <p className="text-gray-400 text-sm">Join chess clubs</p>
                </div>
              </div>

              <div className="relative py-16 border border-gray-600/30 rounded-2xl bg-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl"></div>
                <div className="relative text-center">
                  <div className="text-5xl mb-3 opacity-30">📬</div>
                  <p className="text-gray-300 text-sm">No invitations yet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Linked Accounts */}
          <div className="group relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-8 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Linked Accounts</h2>
                    <p className="text-gray-400 text-sm">Chess platforms</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/coach/connections')}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all rounded-lg border border-gray-500/30 hover:border-gray-400"
                >
                  Settings
                </button>
              </div>

              <div className="space-y-3">
                <div className="group/item relative p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-emerald-500/40 transition-all shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity rounded-2xl"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">♟</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold mb-1">chess.com</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <p className="text-red-400 text-sm">Not connected</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all border border-emerald-500/20">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
