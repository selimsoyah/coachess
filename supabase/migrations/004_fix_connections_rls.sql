-- Fix connections RLS policies for invite flow
-- This migration adds missing policies for connections

-- Allow deleting connections for users who are part of them
CREATE POLICY IF NOT EXISTS "connections_delete_own" ON connections
  FOR DELETE
  USING (coach_id = auth.uid() OR player_id = auth.uid());

-- Allow anyone to select connections by invite_token (for invite acceptance page)
-- This is safe because invite_token is a secret random string
CREATE POLICY IF NOT EXISTS "connections_select_by_token" ON connections
  FOR SELECT
  USING (invite_token IS NOT NULL);

-- Allow players to update connections when accepting invites
-- They can only update to set their player_id and change status to accepted
CREATE POLICY IF NOT EXISTS "connections_accept_invite" ON connections
  FOR UPDATE
  USING (
    status = 'pending' AND 
    invite_token IS NOT NULL AND
    player_id IS NULL
  )
  WITH CHECK (
    status = 'accepted' AND
    player_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'player'
    )
  );
