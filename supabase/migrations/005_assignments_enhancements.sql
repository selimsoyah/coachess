-- Migration 005: Assignments Enhancements
-- Add indexes and additional constraints for assignments table
-- Run this migration if you need to optimize assignments queries

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assignments_coach_id ON assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_assignments_player_id ON assignments(player_id);
CREATE INDEX IF NOT EXISTS idx_assignments_content_id ON assignments(content_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_at ON assignments(assigned_at);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_assignments_player_status ON assignments(player_id, status);
CREATE INDEX IF NOT EXISTS idx_assignments_coach_status ON assignments(coach_id, status);

-- Add check constraint to ensure completed_at is only set when status is completed
ALTER TABLE assignments
DROP CONSTRAINT IF EXISTS assignments_completed_at_check;

ALTER TABLE assignments
ADD CONSTRAINT assignments_completed_at_check
CHECK (
  (status = 'completed' AND completed_at IS NOT NULL) OR
  (status != 'completed' AND completed_at IS NULL)
);

-- Add function to automatically set completed_at timestamp
CREATE OR REPLACE FUNCTION set_assignment_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage completed_at
DROP TRIGGER IF EXISTS trg_set_assignment_completed_at ON assignments;
CREATE TRIGGER trg_set_assignment_completed_at
BEFORE UPDATE ON assignments
FOR EACH ROW
EXECUTE FUNCTION set_assignment_completed_at();

-- Add comment documentation
COMMENT ON TABLE assignments IS 'Tracks chess content assigned by coaches to players with due dates and completion status';
COMMENT ON COLUMN assignments.status IS 'Current status: assigned (pending completion) or completed (marked complete by player)';
COMMENT ON COLUMN assignments.due_date IS 'Optional deadline for assignment completion';
COMMENT ON COLUMN assignments.assigned_at IS 'When the coach created this assignment';
COMMENT ON COLUMN assignments.completed_at IS 'When the player marked this assignment as completed (NULL if not completed)';
