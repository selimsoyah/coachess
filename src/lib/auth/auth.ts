import { supabase } from '@/lib/supabase/client';
import type { User, UserRole } from '@/types/database.types';

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
 * Sign up a new user with Supabase Auth and create user profile
 */
export async function signUp(data: SignUpData) {
  console.log('1. Creating auth user...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  try {
    // Create auth user with a timeout
    const signupPromise = supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
          role: data.role,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        emailRedirectTo: undefined, // Disable email confirmation redirect
      },
    });

    // Add 10 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Signup request timed out after 10 seconds')), 10000)
    );

    const { data: authData, error: authError } = await Promise.race([
      signupPromise,
      timeoutPromise
    ]) as any;

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    if (!authData.user) {
      console.error('No user returned from signup');
      throw new Error('Failed to create user');
    }

    console.log('2. Auth user created:', authData.user.id);
    console.log('3. Creating user profile...');

    // Create user profile in our users table
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: data.email,
      display_name: data.displayName,
      role: data.role,
      timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('4. Profile created successfully!');
    return { user: authData.user, session: authData.session };
  } catch (error: any) {
    console.error('Signup failed:', error);
    throw error;
  }
}

/**
 * Sign in existing user
 */
export async function signIn(data: SignInData) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw error;
  return { user: authData.user, session: authData.session };
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Request password reset
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
