/**
 * Database Reset Script
 * Deletes all existing content and assignments, then populates with working examples
 * 
 * Usage: npx tsx scripts/reset-database.ts
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables - make sure .env.local is loaded by your terminal
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample PGN for lessons
const sampleLessons = [
  {
    title: "Scholar's Mate - Basic Checkmate Pattern",
    pgn: "1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  },
  {
    title: "Italian Opening - Classical Lines",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Na5",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  },
  {
    title: "Ruy Lopez Exchange Variation",
    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5 8. Nb3 Qxd1 9. Rxd1 Bg4",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  },
  {
    title: "King's Indian Defense - Main Line",
    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. f3 f5",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  },
  {
    title: "Queen's Gambit Declined",
    pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
];

// Sample FEN for puzzles
const samplePuzzles = [
  {
    title: "Back Rank Mate in 1",
    fen: "r4rk1/ppp2ppp/2n5/3q4/3P4/2PB4/PP3PPP/R2Q1RK1 w - - 0 1",
    solution: "White to move: Qd8+ is checkmate!"
  },
  {
    title: "Fork the King and Queen",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    solution: "White to move: Nxe5 forks king and queen"
  },
  {
    title: "Pin and Win Material",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    solution: "Black to move: Defend the pinned knight"
  },
  {
    title: "Smothered Mate Pattern",
    fen: "6rk/5Npp/8/8/8/8/5PPP/6K1 b - - 0 1",
    solution: "White has just played Nf7+. Black is in check and will be mated."
  },
  {
    title: "Remove the Defender",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    solution: "White to move: Bxf7+ removes the defender of the e5 pawn"
  }
];

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n');

  try {
    // Step 1: Get coach and player IDs
    console.log('📋 Finding users...');
    const { data: coaches } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'coach')
      .limit(1);
    
    const { data: players } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'player')
      .limit(1);

    if (!coaches?.length || !players?.length) {
      console.error('❌ No coach or player found. Please create users first.');
      process.exit(1);
    }

    const coachId = coaches[0].id;
    const playerId = players[0].id;
    console.log(`✅ Found coach: ${coachId}`);
    console.log(`✅ Found player: ${playerId}\n`);

    // Step 2: Delete existing assignments
    console.log('🗑️  Deleting existing assignments...');
    const { error: deleteAssignmentsError } = await supabase
      .from('assignments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteAssignmentsError) throw deleteAssignmentsError;
    console.log('✅ Assignments deleted\n');

    // Step 3: Delete existing content
    console.log('🗑️  Deleting existing content...');
    const { error: deleteContentError } = await supabase
      .from('content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteContentError) throw deleteContentError;
    console.log('✅ Content deleted\n');

    // Step 4: Insert lessons
    console.log('📚 Creating lessons...');
    const lessonsToInsert = sampleLessons.map(lesson => ({
      creator_id: coachId,
      title: lesson.title,
      type: 'lesson' as const,
      pgn: lesson.pgn,
      fen: lesson.fen,
    }));

    const { data: createdLessons, error: lessonsError } = await supabase
      .from('content')
      .insert(lessonsToInsert)
      .select();

    if (lessonsError) throw lessonsError;
    console.log(`✅ Created ${createdLessons?.length} lessons\n`);

    // Step 5: Insert puzzles
    console.log('🧩 Creating puzzles...');
    const puzzlesToInsert = samplePuzzles.map(puzzle => ({
      creator_id: coachId,
      title: puzzle.title,
      type: 'puzzle' as const,
      fen: puzzle.fen,
      metadata: { solution: puzzle.solution }
    }));

    const { data: createdPuzzles, error: puzzlesError } = await supabase
      .from('content')
      .insert(puzzlesToInsert)
      .select();

    if (puzzlesError) throw puzzlesError;
    console.log(`✅ Created ${createdPuzzles?.length} puzzles\n`);

    // Step 6: Create assignments
    console.log('📝 Creating assignments...');
    const allContent = [...(createdLessons || []), ...(createdPuzzles || [])];
    const assignmentsToInsert = allContent.slice(0, 6).map((content, index) => ({
      content_id: content.id,
      coach_id: coachId,
      player_id: playerId,
      status: 'assigned' as const,
      due_date: new Date(Date.now() + (index + 3) * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { data: createdAssignments, error: assignmentsError } = await supabase
      .from('assignments')
      .insert(assignmentsToInsert)
      .select();

    if (assignmentsError) throw assignmentsError;
    console.log(`✅ Created ${createdAssignments?.length} assignments\n`);

    // Step 7: Verify results
    console.log('📊 Verification:');
    const { count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true });
    
    const { count: lessonsCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'lesson');
    
    const { count: puzzlesCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'puzzle');
    
    const { count: assignmentsCount } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true });

    console.log(`   Total Content: ${contentCount}`);
    console.log(`   Lessons: ${lessonsCount}`);
    console.log(`   Puzzles: ${puzzlesCount}`);
    console.log(`   Assignments: ${assignmentsCount}`);

    // Show sample content
    console.log('\n📋 Sample Content:');
    if (createdLessons) {
      console.log('\nLessons:');
      createdLessons.forEach(lesson => {
        const pgnLength = lesson.pgn?.length || 0;
        console.log(`   ✓ ${lesson.title} (PGN: ${pgnLength} chars)`);
      });
    }
    
    if (createdPuzzles) {
      console.log('\nPuzzles:');
      createdPuzzles.forEach(puzzle => {
        console.log(`   ✓ ${puzzle.title} (FEN: ${puzzle.fen ? 'Yes' : 'No'})`);
      });
    }

    console.log('\n✅ Database reset complete!\n');
    console.log('🎯 Next steps:');
    console.log('   1. Refresh your application');
    console.log('   2. Check /coach/content to see the new content');
    console.log('   3. Check /player/assignments to see the assignments');
    console.log('   4. Test viewing lessons (should show navigation controls)');
    console.log('   5. Test solving puzzles (should validate moves)\n');

  } catch (error) {
    console.error('❌ Error during reset:', error);
    process.exit(1);
  }
}

// Run the script
resetDatabase();
