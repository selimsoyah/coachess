'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import {
  getConnectionByToken,
  acceptInvite,
  type ConnectionWithUsers,
} from '@/lib/connections/connections-service';

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [connection, setConnection] = useState<ConnectionWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  const inviteToken = params?.token as string;

  // Load connection details
  useEffect(() => {
    if (inviteToken) {
      loadConnection();
    }
  }, [inviteToken]);

  const loadConnection = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getConnectionByToken(inviteToken);
      
      if (!data) {
        setError('Invalid or expired invite link');
      } else if (data.status === 'accepted') {
        setError('This invite has already been accepted');
      } else if (data.status === 'revoked') {
        setError('This invite has been revoked by the coach');
      } else if (data.status !== 'pending') {
        setError('This invite is no longer valid');
      } else {
        setConnection(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invite');
      console.error('Load invite error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirect to signup if not logged in
      router.push(`/auth/signup?invite=${inviteToken}`);
      return;
    }

    if (user.role !== 'player') {
      setError('Only players can accept coach invites');
      return;
    }

    try {
      setAccepting(true);
      setError('');
      console.log('Accepting invite:', inviteToken);
      await acceptInvite(inviteToken);
      
      console.log('Invite accepted successfully, redirecting...');
      // Redirect to player dashboard
      router.push('/player');
    } catch (err: any) {
      console.error('Accept invite error:', err);
      setError(err.message || 'Failed to accept invite');
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    router.push('/');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (error || !connection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
          <p className="text-gray-600 mb-6">{error || 'This invite link is not valid.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coach Invite</h2>
          <p className="text-gray-600">You've been invited to connect with a coach</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {connection.coach?.display_name?.[0] || connection.coach?.email[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {connection.coach?.display_name || 'Coach'}
              </div>
              <div className="text-sm text-gray-600">{connection.coach?.email}</div>
            </div>
          </div>
          {connection.invited_email && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                This invite was sent to:
              </p>
              <p className="text-sm font-medium text-gray-900">
                {connection.invited_email}
              </p>
            </div>
          )}
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              To accept this invite, you need to create an account or sign in
            </p>
            <button
              onClick={handleAccept}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continue to Sign Up
            </button>
            <button
              onClick={handleDecline}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        ) : user.role !== 'player' ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                You are logged in as a {user.role}. Only players can accept coach invites.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              By accepting, {connection.coach?.display_name || 'the coach'} will be able to assign you chess content and track your progress.
            </p>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {accepting ? 'Accepting...' : 'Accept Invite'}
            </button>
            <button
              onClick={handleDecline}
              disabled={accepting}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
