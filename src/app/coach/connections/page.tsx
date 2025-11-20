'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import {
  getCoachConnections,
  createInvite,
  revokeConnection,
  deleteConnection,
  type ConnectionWithUsers,
} from '@/lib/connections/connections-service';

export default function ConnectionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState<ConnectionWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'revoked'>('all');

  // Redirect if not authenticated or not a coach
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'coach') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Load connections
  useEffect(() => {
    if (user?.role === 'coach') {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCoachConnections();
      setConnections(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
      console.error('Load connections error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      setError('');
      const connection = await createInvite(inviteEmail.trim());
      
      // Generate invite link
      const inviteLink = `${window.location.origin}/invite/${connection.invite_token}`;
      setInviteSuccess(inviteLink);
      
      // Reload connections
      await loadConnections();
      setInviteEmail('');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create invite';
      setError(errorMessage);
      
      // Show in alert too for immediate visibility
      alert(errorMessage);
      
      console.error('Invite error:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this connection?')) {
      return;
    }

    try {
      await revokeConnection(id);
      await loadConnections();
    } catch (err: any) {
      alert('Failed to revoke: ' + err.message);
      console.error('Revoke error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this connection?')) {
      return;
    }

    try {
      await deleteConnection(id);
      await loadConnections();
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const filteredConnections = statusFilter === 'all'
    ? connections
    : connections.filter((c) => c.status === statusFilter);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="relative bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border-b border-gray-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Connections</h1>
              <p className="mt-1 text-gray-300">Manage your player connections and invites</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Invite Player</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Status Filter */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-6 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-[1.02] ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
              }`}
            >
              All ({connections.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-[1.02] ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
              }`}
            >
              Pending ({connections.filter((c) => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('accepted')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-[1.02] ${
                statusFilter === 'accepted'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
              }`}
            >
              Active ({connections.filter((c) => c.status === 'accepted').length})
            </button>
            <button
              onClick={() => setStatusFilter('revoked')}
              className={`px-4 py-2 rounded-xl transition-all hover:scale-[1.02] ${
                statusFilter === 'revoked'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/30'
              }`}
            >
              Revoked ({connections.filter((c) => c.status === 'revoked').length})
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-4 mb-6 backdrop-blur-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Connections List */}
        {filteredConnections.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No connections found</h3>
            <p className="text-gray-400 mb-6">
              {statusFilter !== 'all'
                ? `No ${statusFilter} connections`
                : 'Start by inviting a player to connect'}
            </p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20"
            >
              Invite Player
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-600/30">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Connected Since
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600/30">
                {filteredConnections.map((connection) => (
                  <tr key={connection.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-white">
                          {connection.player?.display_name || connection.player?.email || connection.invited_email || 'Pending'}
                        </div>
                        {connection.player ? (
                          <div className="text-gray-400">{connection.player.email}</div>
                        ) : connection.invited_email ? (
                          <div className="text-gray-400 italic">Invited: {connection.invited_email}</div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          connection.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : connection.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {connection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(connection.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {connection.status === 'accepted' && (
                          <button
                            onClick={() => router.push(`/messages/${connection.id}`)}
                            className="text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-xl hover:bg-emerald-500/10 transition-all hover:scale-[1.02]"
                            title="Send message"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </button>
                        )}
                        {connection.status === 'pending' && connection.invite_token && (
                          <button
                            onClick={() => {
                              const link = `${window.location.origin}/invite/${connection.invite_token}`;
                              navigator.clipboard.writeText(link);
                              alert('Invite link copied to clipboard!');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 px-3 py-1 rounded-xl hover:bg-cyan-500/10 transition-all hover:scale-[1.02]"
                            title="Copy invite link"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        )}
                        {connection.status === 'accepted' && (
                          <button
                            onClick={() => handleRevoke(connection.id)}
                            className="text-orange-400 hover:text-orange-300 px-3 py-1 rounded-xl hover:bg-orange-500/10 transition-all hover:scale-[1.02]"
                            title="Revoke connection"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(connection.id)}
                          className="text-red-400 hover:text-red-300 px-3 py-1 rounded-xl hover:bg-red-500/10 transition-all hover:scale-[1.02]"
                          title="Delete connection"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800/95 via-gray-700/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Invite Player</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteSuccess(null);
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {inviteSuccess ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <p className="text-sm font-medium text-emerald-400 mb-2">Invite created successfully!</p>
                  <p className="text-sm text-emerald-300">Share this link with your player:</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-600/30 rounded-xl p-3">
                  <code className="text-sm text-gray-300 break-all">{inviteSuccess}</code>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteSuccess);
                      alert('Link copied to clipboard!');
                    }}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      setInviteSuccess(null);
                      setShowInviteModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-600/30 text-gray-300 rounded-xl hover:bg-gray-700/50 transition-all hover:scale-[1.02]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Player Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="player@example.com"
                    required
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600/30 text-white placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    The player will receive an invite link to connect with you.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    disabled={inviting}
                    className="flex-1 px-4 py-2 border border-gray-600/30 text-gray-300 rounded-xl hover:bg-gray-700/50 disabled:opacity-50 transition-all hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20"
                  >
                    {inviting ? 'Creating...' : 'Create Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
