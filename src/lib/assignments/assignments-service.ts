/**
 * Assignments Service - Manage content assignments from coaches to players
 * Uses raw fetch API for reliability
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Assignment {
  id: string;
  content_id: string;
  coach_id: string;
  player_id: string;
  status: 'assigned' | 'completed' | 'skipped';
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
}

export interface AssignmentWithDetails extends Assignment {
  content: {
    id: string;
    title: string;
    type: 'lesson' | 'puzzle';
    pgn?: string;
    fen?: string;
  } | null;
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

export interface CreateAssignmentInput {
  content_id: string;
  player_id: string;
  due_date?: string;
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
 * Create a new assignment (coach assigns content to player)
 */
export async function createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      content_id: input.content_id,
      coach_id: userId, // ✅ Add coach_id from session
      player_id: input.player_id,
      due_date: input.due_date || null,
      status: 'assigned',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create assignment' }));
    throw new Error(error.message || 'Failed to create assignment');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Get all assignments (for current user as coach or player)
 */
export async function getMyAssignments(): Promise<AssignmentWithDetails[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?select=*,content(*),coach:users!coach_id(*),player:users!player_id(*)&order=assigned_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch assignments' }));
    throw new Error(error.message || 'Failed to fetch assignments');
  }

  return response.json();
}

/**
 * Get assignments as a coach (all assignments created by coach)
 */
export async function getCoachAssignments(): Promise<AssignmentWithDetails[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  console.log('📥 Fetching coach assignments for user:', userId);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?coach_id=eq.${userId}&select=*,content(*),coach:users!coach_id(*),player:users!player_id(*)&order=assigned_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch assignments' }));
    console.error('❌ Coach assignments fetch error:', error);
    throw new Error(error.message || 'Failed to fetch assignments');
  }

  const data = await response.json();
  console.log('✅ Coach assignments fetched:', data.length, 'items');
  return data;
}

/**
 * Get assignments as a player (all assignments assigned to player)
 */
export async function getPlayerAssignments(): Promise<AssignmentWithDetails[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  console.log('📥 Fetching player assignments for user:', userId);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?player_id=eq.${userId}&select=*,content(*),coach:users!coach_id(*),player:users!player_id(*)&order=assigned_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch assignments' }));
    console.error('❌ Player assignments fetch error:', error);
    throw new Error(error.message || 'Failed to fetch assignments');
  }

  const data = await response.json();
  console.log('✅ Player assignments fetched:', data.length, 'items');
  return data;
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: string): Promise<AssignmentWithDetails | null> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?id=eq.${id}&select=*,content(*),coach:users!coach_id(*),player:users!player_id(*)&limit=1`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch assignment' }));
    throw new Error(error.message || 'Failed to fetch assignment');
  }

  const data = await response.json();
  return data[0] || null;
}

/**
 * Mark assignment as completed (player side)
 */
export async function markAssignmentCompleted(assignmentId: string): Promise<Assignment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?id=eq.${assignmentId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to mark assignment completed' }));
    throw new Error(error.message || 'Failed to mark assignment completed');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: 'assigned' | 'completed' | 'skipped'
): Promise<Assignment> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const body: any = { status };
  if (status === 'completed') {
    body.completed_at = new Date().toISOString();
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?id=eq.${assignmentId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update assignment' }));
    throw new Error(error.message || 'Failed to update assignment');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Delete an assignment (coach only)
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?id=eq.${assignmentId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete assignment' }));
    throw new Error(error.message || 'Failed to delete assignment');
  }
}

/**
 * Get assignments by status
 */
export async function getAssignmentsByStatus(
  status: 'assigned' | 'completed' | 'skipped'
): Promise<AssignmentWithDetails[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/assignments?status=eq.${status}&select=*,content(*),coach:users!coach_id(*),player:users!player_id(*)&order=assigned_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch assignments' }));
    throw new Error(error.message || 'Failed to fetch assignments');
  }

  return response.json();
}
