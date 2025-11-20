-- Diagnostic: Check what policies exist on users table
-- Run this in Supabase SQL Editor to see current policies

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

-- If you see no INSERT policy, run the fix below:
-- (Uncomment and run if needed)

-- DROP POLICY IF EXISTS "users_insert_own" ON users;
-- CREATE POLICY "users_insert_own" ON users
--   FOR INSERT
--   WITH CHECK (auth.uid() = id);
