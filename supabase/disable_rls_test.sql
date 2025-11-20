-- Emergency fix: Temporarily disable RLS and test
-- Run these commands ONE BY ONE in Supabase SQL Editor

-- Step 1: Disable RLS temporarily to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 2: Check if it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- After you test signup successfully, run this to re-enable:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
