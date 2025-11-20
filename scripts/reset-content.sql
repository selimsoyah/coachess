-- Reset script for content and assignments
-- This will delete all existing content and assignments and repopulate with working examples

-- Delete all assignments (cascade will handle this, but being explicit)
DELETE FROM assignments;

-- Delete all content
DELETE FROM content;

-- Insert sample lessons with proper PGN data
INSERT INTO content (id, creator_id, title, type, pgn, fen, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Scholar''s Mate - Basic Checkmate Pattern',
  'lesson',
  '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Italian Opening - Classical Lines',
  'lesson',
  '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Na5',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Ruy Lopez Exchange Variation',
  'lesson',
  '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5 8. Nb3 Qxd1 9. Rxd1 Bg4',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
);

-- Insert sample puzzles with proper FEN data
INSERT INTO content (id, creator_id, title, type, fen, created_at) VALUES
(
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Back Rank Mate in 1',
  'puzzle',
  'r4rk1/ppp2ppp/2n5/3q4/3P4/2PB4/PP3PPP/R2Q1RK1 w - - 0 1',
  NOW()
),
(
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Fork the King and Queen',
  'puzzle',
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  NOW()
),
(
  '66666666-6666-6666-6666-666666666666',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  'Pin and Win Material',
  'puzzle',
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  NOW()
);

-- Insert sample assignments linking to the new content
INSERT INTO assignments (id, content_id, coach_id, player_id, status, assigned_at, due_date) VALUES
-- Lessons assigned to first player
(
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  (SELECT id FROM users WHERE role = 'player' LIMIT 1),
  'assigned',
  NOW(),
  NOW() + INTERVAL '7 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  (SELECT id FROM users WHERE role = 'player' LIMIT 1),
  'assigned',
  NOW(),
  NOW() + INTERVAL '14 days'
),
-- Puzzles assigned to first player
(
  'a4444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  (SELECT id FROM users WHERE role = 'player' LIMIT 1),
  'assigned',
  NOW(),
  NOW() + INTERVAL '3 days'
),
(
  'a5555555-5555-5555-5555-555555555555',
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM users WHERE role = 'coach' LIMIT 1),
  (SELECT id FROM users WHERE role = 'player' LIMIT 1),
  'assigned',
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Verify the data
SELECT 'Content Count:' as info, COUNT(*) as count FROM content
UNION ALL
SELECT 'Lessons:' as info, COUNT(*) as count FROM content WHERE type = 'lesson'
UNION ALL
SELECT 'Puzzles:' as info, COUNT(*) as count FROM content WHERE type = 'puzzle'
UNION ALL
SELECT 'Assignments:' as info, COUNT(*) as count FROM assignments;

-- Show sample of created content
SELECT 
  id,
  title,
  type,
  CASE 
    WHEN pgn IS NOT NULL THEN 'Has PGN (' || LENGTH(pgn) || ' chars)'
    ELSE 'No PGN'
  END as pgn_status,
  CASE 
    WHEN fen IS NOT NULL THEN 'Has FEN'
    ELSE 'No FEN'
  END as fen_status
FROM content
ORDER BY created_at DESC;
