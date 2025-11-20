-- Cleanup Script: Remove test users that were created without profiles
-- Run this AFTER you've run fix_signup_policy.sql

-- This will show you all auth users that don't have profiles
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Uncomment the lines below to delete these orphaned auth users
-- (Only do this after confirming the list above shows your test accounts)

-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT au.id
--   FROM auth.users au
--   LEFT JOIN public.users pu ON au.id = pu.id
--   WHERE pu.id IS NULL
-- );
