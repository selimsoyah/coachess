-- Fix RLS Policy for User Signup
-- Run this ENTIRE script in Supabase SQL Editor to allow new users to create their profile

-- First, drop the policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Now create the INSERT policy for users table to allow new signups
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT policyname, cmd, with_check 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'users_insert_own';

-- You should see one row with cmd='INSERT' and with_check showing the auth.uid() = id check
