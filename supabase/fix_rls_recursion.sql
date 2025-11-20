-- Fix Infinite Recursion in RLS Policies
-- Run this ENTIRE script in Supabase SQL Editor

-- First, drop ALL existing policies on users table
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON users;

-- Now create clean, simple policies

-- Allow users to INSERT their own profile during signup
CREATE POLICY "users_can_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile
CREATE POLICY "users_can_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "users_can_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify policies were created correctly
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
