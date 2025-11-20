-- Fix for Email Confirmation Flow
-- This creates a trigger to automatically create user profiles after email confirmation

-- First, let's fix the RLS policies to work with email confirmation
-- We need to allow the trigger function (which runs as postgres) to insert

-- Drop existing policy
DROP POLICY IF EXISTS "users_insert_own" ON users;

-- Create policy that allows INSERT from service role (used by trigger)
-- AND from authenticated users (for manual profile creation if needed)
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    auth.role() = 'service_role'
  );

-- Now create a function that will automatically create user profiles
-- This runs when a user confirms their email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role, timezone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'player'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is confirmed
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
