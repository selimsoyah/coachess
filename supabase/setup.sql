-- ============================================================================
-- CoaChess Database Setup - Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (careful - this deletes data!)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  display_name text,
  role text NOT NULL CHECK (role IN ('coach', 'player', 'admin')),
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Connections table (coach-player relationships)
CREATE TABLE connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked')) DEFAULT 'pending',
  invite_token text UNIQUE,
  invited_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_coach_player UNIQUE (coach_id, player_id)
);

-- Content table (lessons and puzzles)
CREATE TABLE content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('lesson', 'puzzle')),
  pgn text,
  fen text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assignments table
CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES content(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('assigned', 'completed', 'skipped')) DEFAULT 'assigned',
  assigned_at timestamptz DEFAULT now(),
  due_date timestamptz,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Sessions table (optional manual scheduling)
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_connections_coach ON connections(coach_id);
CREATE INDEX idx_connections_player ON connections(player_id);
CREATE INDEX idx_content_creator ON content(creator_id);
CREATE INDEX idx_assignments_coach ON assignments(coach_id);
CREATE INDEX idx_assignments_player ON assignments(player_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_messages_connection ON messages(connection_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users policies: Users can read their own data and update it
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Service role bypass (for scripts and admin operations)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

CREATE POLICY "Coaches can create connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their connections" ON connections
  FOR UPDATE USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

CREATE POLICY "Service role full access connections" ON connections
  FOR ALL USING (auth.role() = 'service_role');

-- Content policies
CREATE POLICY "Coaches can view their content" ON content
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Players can view assigned content" ON content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.content_id = content.id
      AND assignments.player_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can create content" ON content
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Coaches can update their content" ON content
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Coaches can delete their content" ON content
  FOR DELETE USING (auth.uid() = creator_id);

CREATE POLICY "Service role full access content" ON content
  FOR ALL USING (auth.role() = 'service_role');

-- Assignments policies
CREATE POLICY "Users can view their assignments" ON assignments
  FOR SELECT USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

CREATE POLICY "Coaches can create assignments" ON assignments
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their assignments" ON assignments
  FOR UPDATE USING (
    auth.uid() = coach_id OR auth.uid() = player_id
  );

CREATE POLICY "Service role full access assignments" ON assignments
  FOR ALL USING (auth.role() = 'service_role');

-- Messages policies
CREATE POLICY "Users can view messages in their connections" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
      AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their connections" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
    )
  );

CREATE POLICY "Service role full access messages" ON messages
  FOR ALL USING (auth.role() = 'service_role');

-- Sessions policies
CREATE POLICY "Users can view their sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = sessions.connection_id
      AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can manage sessions" ON sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = connection_id
      AND connections.coach_id = auth.uid()
    )
  );

-- ============================================================================
-- Sync auth.users with public.users table
-- ============================================================================

-- Function to sync auth user to public users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Done!
-- ============================================================================

SELECT 'Database setup complete! ✅' as status;
