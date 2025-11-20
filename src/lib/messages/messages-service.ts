import { getSession } from '@/lib/auth/auth-raw';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

/**
 * Get current user ID from session
 */
async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  return session.user.id;
}

/**
 * Get access token from session
 */
async function getAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

/**
 * Send a message in a connection
 */
export async function sendMessage(connectionId: string, body: string): Promise<Message> {
  const token = await getAccessToken();
  const senderId = await getCurrentUserId();

  if (!body.trim()) {
    throw new Error('Message body cannot be empty');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      connection_id: connectionId,
      sender_id: senderId,
      body: body.trim(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Get all messages for a connection
 */
export async function getMessages(connectionId: string): Promise<Message[]> {
  const token = await getAccessToken();

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?connection_id=eq.${connectionId}&order=created_at.asc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
}

/**
 * Subscribe to new messages in a connection (for realtime updates)
 * Returns cleanup function to unsubscribe
 */
export function subscribeToMessages(
  connectionId: string,
  onNewMessage: (message: Message) => void
): () => void {
  // Create WebSocket connection to Supabase Realtime
  const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
  const socket = new WebSocket(`${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`);

  socket.onopen = () => {
    // Join the messages channel for this connection
    const joinMessage = {
      topic: `realtime:public:messages:connection_id=eq.${connectionId}`,
      event: 'phx_join',
      payload: {},
      ref: '1',
    };
    socket.send(JSON.stringify(joinMessage));

    // Send heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          topic: 'phoenix',
          event: 'heartbeat',
          payload: {},
          ref: Date.now().toString(),
        }));
      }
    }, 30000);

    // Store interval ID for cleanup
    (socket as any)._heartbeatInterval = heartbeatInterval;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Handle INSERT events (new messages)
    if (data.event === 'INSERT' && data.payload?.record) {
      onNewMessage(data.payload.record as Message);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  // Return cleanup function
  return () => {
    if ((socket as any)._heartbeatInterval) {
      clearInterval((socket as any)._heartbeatInterval);
    }
    socket.close();
  };
}

/**
 * Get unread message count for a connection
 * (This is a simplified version - in production you'd track read status per message)
 */
export async function getUnreadCount(connectionId: string): Promise<number> {
  const token = await getAccessToken();
  const currentUserId = await getCurrentUserId();

  // Count messages where sender is NOT the current user
  // In a full implementation, you'd have a read_at field per recipient
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?connection_id=eq.${connectionId}&sender_id=neq.${currentUserId}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Range': '0-0',
        'Prefer': 'count=exact',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get unread count');
  }

  const contentRange = response.headers.get('Content-Range');
  if (contentRange) {
    const total = parseInt(contentRange.split('/')[1], 10);
    return total;
  }

  return 0;
}

/**
 * Delete a message (only the sender can delete)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const token = await getAccessToken();
  const currentUserId = await getCurrentUserId();

  // First verify the message belongs to the current user
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}&sender_id=eq.${currentUserId}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const messages = await checkResponse.json();
  if (!messages || messages.length === 0) {
    throw new Error('Message not found or you do not have permission to delete it');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete message');
  }
}
