-- Comprehensive check of what's blocking auth
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check all policies on users table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 3. Check for any triggers on auth.users that might be slow
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 4. Try to manually test the auth signup
-- (This will help identify if it's a Supabase API issue)
SELECT 'Ready to test' as status;
