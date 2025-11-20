/**
 * Script to populate the database with test data for MVP demo
 * Run with: npx tsx scripts/populate-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateTestData() {
  console.log('🚀 Starting to populate test data...\n');

  try {
    // 1. Create test users (coaches and players)
    console.log('📝 Creating test users...');
    
    const coaches = [
      { email: 'coach1@test.com', password: 'Test123!', name: 'Magnus Carlsen', role: 'coach' },
      { email: 'coach2@test.com', password: 'Test123!', name: 'Hikaru Nakamura', role: 'coach' },
      { email: 'coach3@test.com', password: 'Test123!', name: 'Judit Polgar', role: 'coach' },
    ];

    const players = [
      { email: 'player1@test.com', password: 'Test123!', name: 'Alex Johnson', role: 'player' },
      { email: 'player2@test.com', password: 'Test123!', name: 'Emma Williams', role: 'player' },
      { email: 'player3@test.com', password: 'Test123!', name: 'Michael Chen', role: 'player' },
      { email: 'player4@test.com', password: 'Test123!', name: 'Sofia Rodriguez', role: 'player' },
      { email: 'player5@test.com', password: 'Test123!', name: 'James Smith', role: 'player' },
    ];

    const createdCoaches = [];
    const createdPlayers = [];

    // Create coaches
    for (const coach of coaches) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: coach.email,
        password: coach.password,
        email_confirm: true,
        user_metadata: {
          full_name: coach.name,
          role: coach.role,
        }
      });

      if (authError) {
        console.log(`⚠️  Coach ${coach.email} might already exist, trying to fetch...`);
        // Try to get existing user by email from profiles
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', coach.email)
          .single();
        
        if (existingProfile) {
          createdCoaches.push({ id: existingProfile.id, ...coach });
          console.log(`✅ Found existing coach: ${coach.name} (${coach.email})`);
        } else {
          console.log(`❌ Could not find coach: ${coach.email}`);
        }
        continue;
      }

      // Wait a bit for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: coach.name, 
          role: coach.role,
          email: coach.email 
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.log(`⚠️  Profile update error for ${coach.email}:`, profileError.message);
      }

      createdCoaches.push({ id: authData.user.id, ...coach });
      console.log(`✅ Created coach: ${coach.name} (${coach.email})`);
    }

    // Create players
    for (const player of players) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: player.email,
        password: player.password,
        email_confirm: true,
        user_metadata: {
          full_name: player.name,
          role: player.role,
        }
      });

      if (authError) {
        console.log(`⚠️  Player ${player.email} might already exist, trying to fetch...`);
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', player.email)
          .single();
        
        if (existingProfile) {
          createdPlayers.push({ id: existingProfile.id, ...player });
          console.log(`✅ Found existing player: ${player.name} (${player.email})`);
        } else {
          console.log(`❌ Could not find player: ${player.email}`);
        }
        continue;
      }

      // Wait a bit for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: player.name, 
          role: player.role,
          email: player.email 
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.log(`⚠️  Profile update error for ${player.email}:`, profileError.message);
      }

      createdPlayers.push({ id: authData.user.id, ...player });
      console.log(`✅ Created player: ${player.name} (${player.email})`);
    }

    console.log(`\n📊 Created ${createdCoaches.length} coaches and ${createdPlayers.length} players\n`);

    if (createdCoaches.length === 0 || createdPlayers.length === 0) {
      console.log('❌ No users found or created. Cannot proceed with connections and content.');
      console.log('Please check your Supabase dashboard to verify users exist.\n');
      return;
    }

    // 2. Create connections between coaches and players
    console.log('🔗 Creating connections...');
    
    const connections = [];
    for (let i = 0; i < createdCoaches.length; i++) {
      for (let j = 0; j < createdPlayers.length; j++) {
        // Each coach connects with 3-4 players
        if (j < 3 || (i === 0 && j === 3)) {
          const { data, error } = await supabase
            .from('connections')
            .insert({
              coach_id: createdCoaches[i].id,
              player_id: createdPlayers[j].id,
              status: 'accepted',
            })
            .select()
            .single();

          if (error) {
            console.log(`⚠️  Connection error: ${error.message}`);
          } else if (data) {
            connections.push(data);
            console.log(`✅ Connected ${createdCoaches[i].name} ↔ ${createdPlayers[j].name}`);
          }
        }
      }
    }

    console.log(`\n📊 Created ${connections.length} connections\n`);

    // 3. Create content
    console.log('📚 Creating content...');

    const contentItems = [
      {
        title: 'Ruy Lopez Opening',
        description: 'Master the Spanish Opening with this comprehensive guide',
        content_type: 'lesson',
        fen_position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
      },
      {
        title: 'Sicilian Defense Basics',
        description: 'Learn the fundamental ideas behind the Sicilian Defense',
        content_type: 'lesson',
        fen_position: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
      },
      {
        title: 'Endgame: King and Pawn',
        description: 'Essential king and pawn endgame principles',
        content_type: 'lesson',
        fen_position: '8/8/8/4k3/8/8/4P3/4K3 w - - 0 1',
      },
      {
        title: 'Tactical Puzzle: Fork',
        description: 'Find the winning knight fork',
        content_type: 'puzzle',
        fen_position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      },
      {
        title: 'Queens Gambit Accepted',
        description: 'How to play when Black accepts the gambit',
        content_type: 'lesson',
        fen_position: 'rnbqkbnr/ppp1pppp/8/8/2pP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
      },
      {
        title: 'Checkmate Patterns: Back Rank',
        description: 'Recognize and execute back rank mates',
        content_type: 'puzzle',
        fen_position: '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
      },
      {
        title: 'French Defense Strategy',
        description: 'Strategic plans in the French Defense',
        content_type: 'lesson',
        fen_position: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
      },
      {
        title: 'Pin Tactics',
        description: 'Master the art of pinning pieces',
        content_type: 'puzzle',
        fen_position: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 5 4',
      },
    ];

    const createdContent = [];
    for (let i = 0; i < contentItems.length; i++) {
      const coachIndex = i % createdCoaches.length;
      const { data, error } = await supabase
        .from('content')
        .insert({
          ...contentItems[i],
          author_id: createdCoaches[coachIndex].id,
        })
        .select()
        .single();

      if (error) {
        console.log(`⚠️  Content creation error for "${contentItems[i].title}": ${error.message}`);
      } else if (data) {
        createdContent.push(data);
        console.log(`✅ Created content: ${contentItems[i].title}`);
      }
    }

    console.log(`\n📊 Created ${createdContent.length} content items\n`);

    // 4. Create assignments
    console.log('🎯 Creating assignments...');

    const createdAssignments = [];
    for (let i = 0; i < createdContent.length; i++) {
      const content = createdContent[i];
      
      // Assign to 2-3 players
      const numAssignments = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < numAssignments && j < createdPlayers.length; j++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14)); // Due in next 2 weeks
        
        const statuses = ['pending', 'in_progress', 'completed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const { data, error } = await supabase
          .from('assignments')
          .insert({
            content_id: content.id,
            player_id: createdPlayers[j].id,
            coach_id: content.author_id,
            due_date: dueDate.toISOString(),
            status: status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (!error && data) {
          createdAssignments.push(data);
          console.log(`✅ Assigned "${content.title}" to ${createdPlayers[j].name} (${status})`);
        }
      }
    }

    console.log(`\n📊 Created ${createdAssignments.length} assignments\n`);

    // 5. Create messages
    console.log('💬 Creating messages...');

    const messageTemplates = [
      "Great work on the last lesson! Keep it up.",
      "Let's schedule a session to review your progress.",
      "Have you tried the puzzle I assigned?",
      "Your tactical vision is improving!",
      "Remember to focus on pawn structure in your games.",
      "Let me know if you need help with any concepts.",
      "Excellent progress this week!",
      "Don't forget about the assignment due next week.",
    ];

    const createdMessages = [];
    for (let i = 0; i < 20; i++) {
      const coachIndex = Math.floor(Math.random() * createdCoaches.length);
      const playerIndex = Math.floor(Math.random() * createdPlayers.length);
      const isCoachSender = Math.random() > 0.5;

      const message = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: isCoachSender ? createdCoaches[coachIndex].id : createdPlayers[playerIndex].id,
          receiver_id: isCoachSender ? createdPlayers[playerIndex].id : createdCoaches[coachIndex].id,
          message: message,
        })
        .select()
        .single();

      if (!error && data) {
        createdMessages.push(data);
        console.log(`✅ Message: ${isCoachSender ? 'Coach → Player' : 'Player → Coach'}`);
      }
    }

    console.log(`\n📊 Created ${createdMessages.length} messages\n`);

    // Summary
    console.log('\n✨ Test Data Population Complete! ✨\n');
    console.log('═══════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   • ${createdCoaches.length} coaches`);
    console.log(`   • ${createdPlayers.length} players`);
    console.log(`   • ${connections.length} connections`);
    console.log(`   • ${createdContent.length} content items`);
    console.log(`   • ${createdAssignments.length} assignments`);
    console.log(`   • ${createdMessages.length} messages\n`);
    console.log('═══════════════════════════════════════════\n');
    console.log('🔑 Test Accounts:');
    console.log('\nCoaches:');
    coaches.forEach(c => console.log(`   ${c.email} / ${c.password}`));
    console.log('\nPlayers:');
    players.forEach(p => console.log(`   ${p.email} / ${p.password}`));
    console.log('\n═══════════════════════════════════════════\n');
    console.log('✅ You can now login with any of these accounts to test the application!\n');

  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

populateTestData();
