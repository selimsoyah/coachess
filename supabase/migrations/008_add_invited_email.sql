-- Migration 008: Add invited_email field to connections table
-- This allows tracking which specific email was invited by the coach
-- Ensures only the invited player can accept the invite

-- Add invited_email column
ALTER TABLE connections 
ADD COLUMN invited_email text;

-- Add index for faster lookups by email
CREATE INDEX IF NOT EXISTS idx_connections_invited_email 
ON connections(invited_email);

-- Add comment explaining the field
COMMENT ON COLUMN connections.invited_email IS 
'Email address of the player invited by the coach. Used to validate that only the invited player can accept the invite.';
