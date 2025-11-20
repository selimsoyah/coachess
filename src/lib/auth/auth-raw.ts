import type { User, UserRole } from '@/types/database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AuthUser extends User {
  email: string;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  timezone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Raw fetch-based auth implementation (workaround for Supabase client issue)
 */
async function supabaseFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle empty responses (like 204 No Content or Prefer: return=minimal)
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    console.error('Supabase API error:', {
      status: response.status,
      statusText: response.statusText,
      error: data,
    });
    throw new Error(data.error_description || data.msg || data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Sign up a new user with raw fetch
 */
export async function signUp(data: SignUpData) {
  console.log('1. Creating auth user with raw fetch...');

  try {
    // 1. Create auth user via Supabase Auth API
    const authData = await supabaseFetch('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        data: {
          display_name: data.displayName,
          role: data.role,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });

    console.log('2. Auth user created:', authData.user.id);

    // 2. Create user profile via Supabase REST API
    console.log('3. Creating user profile...');
    
    await supabaseFetch('/rest/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: authData.user.id,
        email: data.email,
        display_name: data.displayName,
        role: data.role,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    console.log('4. Profile created successfully!');

    // Store session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('coachess_session', JSON.stringify({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: authData.expires_at,
        user: authData.user,
      }));
    }

    return { 
      user: authData.user, 
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
      }
    };
  } catch (error: any) {
    console.error('Signup failed:', error);
    throw error;
  }
}

/**
 * Sign in existing user with raw fetch
 */
export async function signIn(data: SignInData) {
  console.log('Signing in with raw fetch...', { email: data.email });

  try {
    const authData = await supabaseFetch('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log('Sign in successful, user:', authData.user?.id);
    console.log('Auth data received:', {
      hasAccessToken: !!authData.access_token,
      hasRefreshToken: !!authData.refresh_token,
      hasUser: !!authData.user,
      expiresAt: authData.expires_at
    });

    // Prepare session object
    const sessionData = {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: authData.expires_at,
      user: authData.user,
    };

    console.log('Preparing to store session in localStorage...');

    // Store session in localStorage
    if (typeof window !== 'undefined') {
      try {
        const sessionString = JSON.stringify(sessionData);
        console.log('Session string length:', sessionString.length);
        localStorage.setItem('coachess_session', sessionString);
        console.log('Session stored in localStorage');
        
        // Verify it was actually stored
        const verification = localStorage.getItem('coachess_session');
        console.log('Verification - session exists:', !!verification);
        if (!verification) {
          throw new Error('Failed to store session in localStorage - verification failed');
        }
      } catch (storageError: any) {
        console.error('localStorage error:', storageError);
        throw new Error('Failed to store session: ' + (storageError?.message || 'Unknown error'));
      }
    } else {
      console.warn('Window is undefined, cannot store session');
    }

    return { user: authData.user, session: authData };
  } catch (error: any) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('coachess_session');
  }
}

/**
 * Get current session from localStorage
 */
export async function getSession() {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('coachess_session');
  if (!stored) return null;
  
  try {
    const session = JSON.parse(stored);
    // Check if expired
    if (session.expires_at && session.expires_at < Date.now() / 1000) {
      localStorage.removeItem('coachess_session');
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session?.access_token) return null;

  try {
    const data = await supabaseFetch(`/rest/v1/users?id=eq.${session.user.id}&select=*`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    return data[0] || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<User>) {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const data = await supabaseFetch(`/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(updates),
  });

  return data[0];
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  await supabaseFetch('/auth/v1/recover', {
    method: 'POST',
    body: JSON.stringify({
      email,
      redirect_to: `${window.location.origin}/auth/reset-password`,
    }),
  });
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  await supabaseFetch('/auth/v1/user', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      password: newPassword,
    }),
  });
}
