/**
 * Content Service - CRUD operations for chess content
 * Uses raw fetch API for reliability (similar to auth-raw.ts)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Content {
  id: string;
  creator_id: string;
  title: string;
  type: 'lesson' | 'puzzle';
  pgn?: string;
  fen?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateContentInput {
  title: string;
  type: 'lesson' | 'puzzle';
  pgn?: string;
  fen?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContentInput {
  title?: string;
  type?: 'lesson' | 'puzzle';
  pgn?: string;
  fen?: string;
  metadata?: Record<string, any>;
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
 * Get current user ID from localStorage
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
 * Create new content
 */
export async function createContent(input: CreateContentInput): Promise<Content> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      ...input,
      creator_id: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create content' }));
    throw new Error(error.message || error.hint || 'Failed to create content');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Get all content for the current user
 */
export async function getMyContent(): Promise<Content[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  console.log('📥 Fetching content for user:', userId);

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/content?creator_id=eq.${userId}&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch content' }));
    console.error('❌ Content fetch error:', error);
    throw new Error(error.message || 'Failed to fetch content');
  }

  const data = await response.json();
  console.log('✅ Content fetched:', data.length, 'items');
  return data;
}

/**
 * Get content by ID
 */
export async function getContentById(id: string): Promise<Content | null> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/content?id=eq.${id}&limit=1`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch content' }));
    throw new Error(error.message || 'Failed to fetch content');
  }

  const data = await response.json();
  return data[0] || null;
}

/**
 * Update content
 */
export async function updateContent(id: string, input: UpdateContentInput): Promise<Content> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update content' }));
    throw new Error(error.message || 'Failed to update content');
  }

  const data = await response.json();
  return data[0];
}

/**
 * Delete content
 */
export async function deleteContent(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete content' }));
    throw new Error(error.message || 'Failed to delete content');
  }
}

/**
 * Search content by title
 */
export async function searchContent(query: string): Promise<Content[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/content?title=ilike.*${query}*&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to search content' }));
    throw new Error(error.message || 'Failed to search content');
  }

  return response.json();
}

/**
 * Filter content by type
 */
export async function getContentByType(type: 'lesson' | 'puzzle'): Promise<Content[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/content?type=eq.${type}&order=created_at.desc`,
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch content' }));
    throw new Error(error.message || 'Failed to fetch content');
  }

  return response.json();
}
