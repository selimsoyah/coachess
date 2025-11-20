/**
 * Simple script to populate with existing user data
 * Works with existing auth users, just adds connections, content, assignments, messages
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateWithExisting() {
  console.log('🚀 Populating with existing auth users...\n');

  // Get existing auth users  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error || !users || users.length === 0) {
    console.log('❌ No users found in auth. Please sign up some users first.');
    return;
  }

  // Filter coaches and players from existing users
  const coaches = users.filter(u => u.email?.includes('coach'));
  const players = users.filter(u => u.email?.includes('player') || (!u.email?.includes('coach') && !u.email?.includes('admin')));

  console.log(`Found ${coaches.length} coaches and ${players.length} players\n`);

  if (coaches.length === 0 || players.length === 0) {
    console.log('❌ Need both coaches and players. Please create test accounts first.');
    console.log('Coaches should have "coach" in their email, others will be treated as players.');
    return;
  }

  // Take first 3 coaches and first 5 players
  const selectedCoaches = coaches.slice(0, 3);
  const selectedPlayers = players.slice(0, 5);

  console.log('Using:');
  selectedCoaches.forEach(c => console.log(`  Coach: ${c.email}`));
  selectedPlayers.forEach(p => console.log(`  Player: ${p.email}`));
  console.log();

  // Create connections
  console.log('🔗 Creating connections...\n');
  let connCount = 0;

  for (const coach of selectedCoaches) {
    for (const player of selectedPlayers.slice(0, 3)) {
      const { error } = await supabase
        .from('connections')
        .upsert({
          coach_id: coach.id,
          player_id: player.id,
          status: 'accepted',
        }, { onConflict: 'coach_id,player_id' });

      if (!error) {
        connCount++;
        console.log(`✅ Connected ${coach.email} ↔ ${player.email}`);
      } else {
        console.log(`⚠️  ${error.message}`);
      }
    }
  }

  // Create content
  console.log(`\n📚 Creating content...\n`);

  const contentItems = [
    {
      title: 'Ruy Lopez Opening - Complete Guide',
      description: 'Master the Spanish Opening with this comprehensive guide covering main lines and key variations',
      content_type: 'lesson',
      fen_position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    },
    {
      title: 'Sicilian Defense: Dragon Variation',
      description: 'Learn the aggressive Dragon variation with sharp tactical ideas',
      content_type: 'lesson',
      fen_position: 'rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    },
    {
      title: 'King and Pawn Endgame Essentials',
      description: 'Essential king and pawn endgame principles every player must know',
      content_type: 'lesson',
      fen_position: '8/8/4k3/8/8/4P3/4K3/8 w - - 0 1',
    },
    {
      title: 'Tactical Puzzle: Double Attack',
      description: 'Find the winning double attack in this position',
      content_type: 'puzzle',
      fen_position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    },
    {
      title: 'Queens Gambit Declined',
      description: 'Solid defensive setup against the Queens Gambit',
      content_type: 'lesson',
      fen_position: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    },
    {
      title: 'Checkmate Pattern: Back Rank Mate',
      description: 'Recognize and execute the devastating back rank checkmate',
      content_type: 'puzzle',
      fen_position: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
    },
    {
      title: 'French Defense: Classical Variation',
      description: 'Strategic plans and ideas in the Classical French',
      content_type: 'lesson',
      fen_position: 'rnbqkb1r/pppppppp/5n2/4P3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
    },
    {
      title: 'Pin Tactics Exercise',
      description: 'Master the art of pinning with these tactical exercises',
      content_type: 'puzzle',
      fen_position: 'r2qkb1r/ppp2ppp/2n5/3p4/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 6',
    },
  ];

  const createdContent = [];
  for (let i = 0; i < contentItems.length; i++) {
    const coach = selectedCoaches[i % selectedCoaches.length];
    const { data, error } = await supabase
      .from('content')
      .insert({
        title: contentItems[i].title,
        type: contentItems[i].content_type,
        creator_id: coach.id,
        fen: contentItems[i].fen_position,
        metadata: { description: contentItems[i].description },
      })
      .select()
      .single();

    if (!error && data) {
      createdContent.push(data);
      console.log(`✅ Created: ${contentItems[i].title}`);
    } else if (error) {
      console.log(`⚠️  ${error.message}`);
    }
  }

  // Create assignments
  console.log(`\n🎯 Creating assignments...\n`);
  let assignCount = 0;

  for (const content of createdContent) {
    // Assign each content to 3-4 random players
    const numAssignments = 3 + Math.floor(Math.random() * 2); // 3 or 4 assignments per content
    const shuffledPlayers = [...selectedPlayers].sort(() => Math.random() - 0.5);
    
    for (let j = 0; j < numAssignments && j < shuffledPlayers.length; j++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7 + Math.floor(Math.random() * 14));
      
      const statuses = ['assigned', 'completed', 'skipped'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const { error } = await supabase
        .from('assignments')
        .insert({
          content_id: content.id,
          player_id: shuffledPlayers[j].id,
          coach_id: content.creator_id,
          due_date: dueDate.toISOString(),
          status: status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        });

      if (!error) {
        assignCount++;
        console.log(`✅ Assigned "${content.title}" to ${shuffledPlayers[j].email} (${status})`);
      } else {
        console.log(`⚠️  Failed to assign: ${error.message}`);
      }
    }
  }

  // Create messages
  console.log(`\n💬 Creating messages...\n`);

  const messageTemplates = [
    "Great work on the last lesson! Keep it up.",
    "Let's schedule a session to review your progress.",
    "Have you tried the puzzle I assigned?",
    "Your tactical vision is improving!",
    "Remember to focus on pawn structure in your games.",
    "Let me know if you need help with any concepts.",
    "Excellent progress this week!",
    "Don't forget about the assignment due next week.",
    "I noticed you completed the lesson - well done!",
    "Your opening preparation is getting stronger.",
  ];

  let msgCount = 0;
  for (let i = 0; i < 25; i++) {
    const coach = selectedCoaches[Math.floor(Math.random() * selectedCoaches.length)];
    const player = selectedPlayers[Math.floor(Math.random() * selectedPlayers.length)];
    const isCoachSender = Math.random() > 0.3; // Coach sends 70% of messages

    const message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: isCoachSender ? coach.id : player.id,
        receiver_id: isCoachSender ? player.id : coach.id,
        message: message,
      });

    if (!error) {
      msgCount++;
      console.log(`✅ ${isCoachSender ? 'Coach → Player' : 'Player → Coach'}: "${message.substring(0, 40)}..."`);
    }
  }

  // Summary
  console.log('\n\n✨ Data Population Complete! ✨\n');
  console.log('═══════════════════════════════════════════\n');
  console.log('📊 Summary:');
  console.log(`   • ${selectedCoaches.length} coaches`);
  console.log(`   • ${selectedPlayers.length} players`);
  console.log(`   • ${connCount} connections`);
  console.log(`   • ${createdContent.length} content items`);
  console.log(`   • ${assignCount} assignments`);
  console.log(`   • ${msgCount} messages\n`);
  console.log('═══════════════════════════════════════════\n');
  console.log('✅ Your database is now populated with realistic data!\n');
  console.log('🔑 Login with any existing user account to explore the data.\n');
}

populateWithExisting();
