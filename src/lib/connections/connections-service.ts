/**
 * Connections Service - Manage coach-player relationships and invites
 * Uses raw fetch API for reliability
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Connection {
  id: string;
  coach_id: string;
  player_id: string;
  status: 'pending' | 'accepted' | 'revoked';
  invite_token?: string;
  invited_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionWithUsers extends Connection {
  coach: {
    id: string;
    email: string;
    display_name: string | null;
  } | null;
  player: {
    id: string;
    email: string;
    display_name: string | null;
  } | null;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('coachess_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Get current user ID from session
 */
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('coachess_session');
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    return parsed.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Generate a random invite token
 */
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

/**
 * Create an invite (coach creates a pending connection with token)
 */
export async function createInvite(playerEmail: string): Promise<Connection> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  // Check if there's an existing connection with this email
  const existingCheckResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${userId}&invited_email=eq.${playerEmail.toLowerCase().trim()}&select=*`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (existingCheckResponse.ok) {
    const existingConnections = await existingCheckResponse.json();
    if (existingConnections.length > 0) {
      const existing = existingConnections[0];
      if (existing.status === 'accepted') {
        throw new Error('You are already connected to this player');
      } else if (existing.status === 'pending') {
        throw new Error('You already have a pending invite for this player. Please share the existing invite link.');
      }
    }
  }

  const inviteToken = generateInviteToken();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/connections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      coach_id: userId,
      status: 'pending',
      invite_token: inviteToken,
      invited_email: playerEmail.toLowerCase().trim(),
      // Note: player_id will be set when they accept
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create invite' }));
    throw new Error(error.message || 'Failed to create invite');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Get connection by invite token
 */
export async function getConnectionByToken(inviteToken: string): Promise<ConnectionWithUsers | null> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?invite_token=eq.${inviteToken}&select=*,coach:users!coach_id(*),player:users!player_id(*)`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data[0] || null;
}

/**
 * Accept an invite (player side)
 */
export async function acceptInvite(inviteToken: string): Promise<Connection> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  // Get current user's email from session
  const session = localStorage.getItem('coachess_session');
  if (!session) {
    throw new Error('Not authenticated');
  }
  
  const parsed = JSON.parse(session);
  const userEmail = parsed.user?.email;
  
  if (!userEmail) {
    throw new Error('User email not found in session');
  }

  console.log('Accepting invite:', { inviteToken, userId, userEmail });

  // First, fetch the connection to check the invited email
  const connectionResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?invite_token=eq.${inviteToken}&select=*`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
      },
    }
  );

  if (!connectionResponse.ok) {
    throw new Error('Failed to fetch invite details');
  }

  const connections = await connectionResponse.json();
  const connection = connections[0];

  if (!connection) {
    throw new Error('Invite not found');
  }

  // Validate that the current user's email matches the invited email
  if (connection.invited_email && 
      connection.invited_email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error(`This invite was sent to ${connection.invited_email}. Please login with that email address.`);
  }

  // Check if there's already an accepted connection between this coach and player
  const existingConnectionCheck = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${connection.coach_id}&player_id=eq.${userId}&status=eq.accepted&select=id`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (existingConnectionCheck.ok) {
    const existingConnections = await existingConnectionCheck.json();
    if (existingConnections.length > 0) {
      throw new Error('You are already connected to this coach');
    }
  }

  // Now update the connection
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?invite_token=eq.${inviteToken}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        player_id: userId,
        status: 'accepted',
      }),
    }
  );

  console.log('Accept invite response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to accept invite' }));
    console.error('Accept invite error response:', error);
    
    // Check for duplicate connection error
    if (error.message?.includes('unique_coach_player') || error.code === '23505') {
      throw new Error('You are already connected to this coach');
    }
    
    throw new Error(error.message || error.hint || 'Failed to accept invite');
  }

  const data = await response.json();
  console.log('Invite accepted - response data:', data);
  
  if (!data || data.length === 0) {
    console.error('No connection was updated - this means RLS policy blocked the update');
    throw new Error('Failed to update connection - please check if Migration 007 was applied correctly');
  }
  
  return data[0];
}

/**
 * Get my connections (as coach or player)
 */
export async function getMyConnections(): Promise<ConnectionWithUsers[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?select=*,coach:users!coach_id(*),player:users!player_id(*)&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch connections' }));
    throw new Error(error.message || 'Failed to fetch connections');
  }

  return response.json();
}

/**
 * Get a single connection by ID
 */
export async function getConnection(connectionId: string): Promise<Connection | null> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?id=eq.${connectionId}&select=*`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch connection');
  }

  const data = await response.json();
  return data[0] || null;
}

/**
 * Get connections as a coach
 */
export async function getCoachConnections(): Promise<ConnectionWithUsers[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${userId}&select=*,coach:users!coach_id(*),player:users!player_id(*)&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch connections' }));
    throw new Error(error.message || 'Failed to fetch connections');
  }

  return response.json();
}

/**
 * Revoke a connection (coach or player can revoke)
 */
export async function revokeConnection(connectionId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?id=eq.${connectionId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'revoked',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to revoke connection' }));
    throw new Error(error.message || 'Failed to revoke connection');
  }
}

/**
 * Delete a connection permanently
 */
export async function deleteConnection(connectionId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?id=eq.${connectionId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete connection' }));
    throw new Error(error.message || 'Failed to delete connection');
  }
}
