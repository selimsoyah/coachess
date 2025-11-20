-- Direct SQL script to insert sample content and assignments
-- Run this directly in Supabase SQL Editor

-- First, let's see what users we have
-- SELECT id, email, role FROM auth.users;

-- Delete existing assignments and content
DELETE FROM assignments;
DELETE FROM content;

-- Insert lessons with PGN data
-- Using your actual coach user ID: 456f4f12-c48f-4e0f-ad42-2096fc725a76
INSERT INTO content (id, creator_id, title, type, pgn, fen, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76', -- Your actual coach ID
  'Scholar''s Mate - Basic Checkmate Pattern',
  'lesson',
  '1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Italian Opening - Classical Lines',
  'lesson',
  '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Na5',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Ruy Lopez Exchange Variation',
  'lesson',
  '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5 8. Nb3 Qxd1 9. Rxd1 Bg4',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '44444444-4444-4444-4444-444444444444',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'King''s Indian Defense - Main Line',
  'lesson',
  '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. f3 f5',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
),
(
  '55555555-5555-5555-5555-555555555555',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Queen''s Gambit Declined',
  'lesson',
  '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5',
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  NOW()
);

-- Insert puzzles with FEN data
INSERT INTO content (id, creator_id, title, type, fen, created_at) VALUES
(
  '66666666-6666-6666-6666-666666666666',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Back Rank Mate in 1',
  'puzzle',
  'r4rk1/ppp2ppp/2n5/3q4/3P4/2PB4/PP3PPP/R2Q1RK1 w - - 0 1',
  NOW()
),
(
  '77777777-7777-7777-7777-777777777777',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Fork the King and Queen',
  'puzzle',
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  NOW()
),
(
  '88888888-8888-8888-8888-888888888888',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Pin and Win Material',
  'puzzle',
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
  NOW()
),
(
  '99999999-9999-9999-9999-999999999999',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Smothered Mate Pattern',
  'puzzle',
  '6rk/5Npp/8/8/8/8/5PPP/6K1 b - - 0 1',
  NOW()
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  'Remove the Defender',
  'puzzle',
  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
  NOW()
);

-- Insert assignments
-- Coach ID: 456f4f12-c48f-4e0f-ad42-2096fc725a76
-- Player ID: 099726a5-c6ef-4a37-9c84-e14724ca742a
INSERT INTO assignments (id, content_id, coach_id, player_id, status, assigned_at, due_date) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '7 days'
),
(
  'a2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '10 days'
),
(
  'a3333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '14 days'
),
(
  'a6666666-6666-6666-6666-666666666666',
  '66666666-6666-6666-6666-666666666666',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '3 days'
),
(
  'a7777777-7777-7777-7777-777777777777',
  '77777777-7777-7777-7777-777777777777',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '5 days'
),
(
  'a8888888-8888-8888-8888-888888888888',
  '88888888-8888-8888-8888-888888888888',
  '456f4f12-c48f-4e0f-ad42-2096fc725a76',
  '099726a5-c6ef-4a37-9c84-e14724ca742a',
  'assigned',
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Verify the inserted data
SELECT 'Content inserted:' as status, COUNT(*) as count FROM content;
SELECT 'Assignments inserted:' as status, COUNT(*) as count FROM assignments;

-- Show the content
SELECT id, title, type, 
  CASE WHEN pgn IS NOT NULL THEN 'Has PGN' ELSE 'No PGN' END as pgn_status,
  CASE WHEN fen IS NOT NULL THEN 'Has FEN' ELSE 'No FEN' END as fen_status
FROM content
ORDER BY created_at DESC;

-- Show the assignments
SELECT a.id, c.title as content_title, c.type, a.status, a.due_date
FROM assignments a
JOIN content c ON a.content_id = c.id
ORDER BY a.assigned_at DESC;
