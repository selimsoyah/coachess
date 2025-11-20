-- Remove the recursive admin policy
DROP POLICY IF EXISTS "users_select_admin" ON users;

-- Verify only the clean policies remain
SELECT policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
