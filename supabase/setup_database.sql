-- ============================================
-- CoaChess Database Setup Script
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  display_name text,
  role text NOT NULL CHECK (role IN ('coach', 'player', 'admin')),
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Connections table (coach-player relationships)
CREATE TABLE IF NOT EXISTS connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id uuid REFERENCES users(id) ON DELETE CASCADE,
  player_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'revoked')) DEFAULT 'pending',
  invite_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_coach_player UNIQUE (coach_id, player_id)
);

-- Content table (lessons and puzzles)
CREATE TABLE IF NOT EXISTS content (
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
CREATE TABLE IF NOT EXISTS assignments (
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
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Sessions table (optional manual scheduling)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid REFERENCES connections(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_connections_coach ON connections(coach_id);
CREATE INDEX IF NOT EXISTS idx_connections_player ON connections(player_id);
CREATE INDEX IF NOT EXISTS idx_content_creator ON content(creator_id);
CREATE INDEX IF NOT EXISTS idx_assignments_coach ON assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_assignments_player ON assignments(player_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ============================================
-- 3. CREATE TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_connections_updated_at ON connections;
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Users policies
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_select_admin" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Connections policies
CREATE POLICY "connections_insert_coach" ON connections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'coach'
    ) AND coach_id = auth.uid()
  );

CREATE POLICY "connections_select_own" ON connections
  FOR SELECT
  USING (coach_id = auth.uid() OR player_id = auth.uid());

CREATE POLICY "connections_update_own" ON connections
  FOR UPDATE
  USING (coach_id = auth.uid() OR player_id = auth.uid());

-- Content policies
CREATE POLICY "content_insert_coach" ON content
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'coach'
    ) AND creator_id = auth.uid()
  );

CREATE POLICY "content_update_creator" ON content
  FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "content_delete_creator" ON content
  FOR DELETE
  USING (creator_id = auth.uid());

CREATE POLICY "content_select_creator" ON content
  FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY "content_select_assigned" ON content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assignments
      WHERE assignments.content_id = content.id
        AND assignments.player_id = auth.uid()
    )
  );

-- Assignments policies
CREATE POLICY "assignments_insert_coach" ON assignments
  FOR INSERT
  WITH CHECK (
    coach_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.coach_id = auth.uid()
        AND connections.player_id = assignments.player_id
        AND connections.status = 'accepted'
    )
  );

CREATE POLICY "assignments_select_own" ON assignments
  FOR SELECT
  USING (coach_id = auth.uid() OR player_id = auth.uid());

CREATE POLICY "assignments_update_player" ON assignments
  FOR UPDATE
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "assignments_update_coach" ON assignments
  FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Messages policies
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
        AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
        AND connections.status = 'accepted'
    )
  );

CREATE POLICY "messages_select_own" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = messages.connection_id
        AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
    )
  );

-- Sessions policies
CREATE POLICY "sessions_insert_coach" ON sessions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = sessions.connection_id
        AND connections.coach_id = auth.uid()
        AND connections.status = 'accepted'
    )
  );

CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = sessions.connection_id
        AND (connections.coach_id = auth.uid() OR connections.player_id = auth.uid())
    )
  );

CREATE POLICY "sessions_update_coach" ON sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = sessions.connection_id
        AND connections.coach_id = auth.uid()
    )
  );

CREATE POLICY "sessions_delete_coach" ON sessions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM connections
      WHERE connections.id = sessions.connection_id
        AND connections.coach_id = auth.uid()
    )
  );

-- Audit log policies
CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "audit_log_insert_all" ON audit_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables, indexes, triggers, and RLS policies are now created.
-- You can now sign up users through the app and they will automatically
-- be added to the users table via the signup flow.
