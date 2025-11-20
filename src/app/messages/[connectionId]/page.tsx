'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/hooks';
import { getMessages, sendMessage, subscribeToMessages, type Message } from '@/lib/messages/messages-service';
import MessageList from '@/components/messaging/MessageList';
import MessageComposer from '@/components/messaging/MessageComposer';
import { getConnection, type Connection } from '@/lib/connections/connections-service';

export default function MessagesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  
  const connectionId = params.connectionId as string;
  
  const [connection, setConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load connection and messages
  useEffect(() => {
    if (authLoading || !user) return;

    async function loadData() {
      try {
        setLoading(true);
        setError('');

        // Load connection details
        const conn = await getConnection(connectionId);
        if (!conn) {
          setError('Connection not found');
          return;
        }

        // Verify user is part of this connection
        if (user && (conn.coach_id !== user.id && conn.player_id !== user.id)) {
          setError('You do not have access to this conversation');
          return;
        }

        // Check connection is accepted
        if (conn.status !== 'accepted') {
          setError('Connection must be accepted before messaging');
          return;
        }

        setConnection(conn);

        // Load messages
        const msgs = await getMessages(connectionId);
        setMessages(msgs);
      } catch (err: any) {
        console.error('Failed to load messages:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [connectionId, user, authLoading]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!connection || !user) return;

    const unsubscribe = subscribeToMessages(connectionId, (newMessage) => {
      // Only add message if it's not already in the list
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return unsubscribe;
  }, [connectionId, connection, user]);

  const handleSendMessage = async (body: string) => {
    try {
      const newMessage = await sendMessage(connectionId, body);
      // Add message optimistically (it will also come through realtime)
      setMessages((prev) => {
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      throw err; // Re-throw so MessageComposer knows it failed
    }
  };

  const getOtherUserName = () => {
    if (!connection || !user) return 'Unknown';
    
    // This is simplified - in production you'd fetch the other user's details
    if (connection.coach_id === user.id) {
      return 'Player'; // Would be actual player name
    } else {
      return 'Coach'; // Would be actual coach name
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {getOtherUserName()}
            </h1>
            <p className="text-sm text-gray-500">
              {connection?.status === 'accepted' ? 'Active' : connection?.status}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} loading={false} />

      {/* Composer */}
      <MessageComposer onSend={handleSendMessage} disabled={connection?.status !== 'accepted'} />
    </div>
  );
}
