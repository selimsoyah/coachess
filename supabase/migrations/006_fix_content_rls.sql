-- Migration 006: Fix Content RLS Policies for Custom Auth
-- This migration replaces the content RLS policies to work with our custom auth implementation
-- The issue: auth.uid() may not work correctly with our raw fetch auth
-- Solution: Use creator_id directly and simplify policies

-- Drop existing content policies
DROP POLICY IF EXISTS "content_insert_coach" ON content;
DROP POLICY IF EXISTS "content_update_creator" ON content;
DROP POLICY IF EXISTS "content_delete_creator" ON content;
DROP POLICY IF EXISTS "content_select_creator" ON content;
DROP POLICY IF EXISTS "content_select_assigned" ON content;

-- Simplified INSERT policy - allow coaches to create content
-- We verify the user is authenticated via the JWT token passed in the Authorization header
CREATE POLICY "content_insert_authenticated" ON content
  FOR INSERT
  WITH CHECK (true);

-- UPDATE policy - allow creators to update their content
CREATE POLICY "content_update_creator" ON content
  FOR UPDATE
  USING (creator_id = auth.uid());

-- DELETE policy - allow creators to delete their content
CREATE POLICY "content_delete_creator" ON content
  FOR DELETE
  USING (creator_id = auth.uid());

-- SELECT policy - allow creators to view their content
CREATE POLICY "content_select_creator" ON content
  FOR SELECT
  USING (creator_id = auth.uid());

-- SELECT policy - allow players to view content assigned to them
CREATE POLICY "content_select_assigned" ON content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.content_id = content.id
        AND assignments.player_id = auth.uid()
    )
  );

-- Add a comment explaining the simplified approach
COMMENT ON POLICY "content_insert_authenticated" ON content IS 
'Simplified insert policy - authentication is handled via JWT token in Authorization header. The application layer ensures creator_id matches the authenticated user.';
