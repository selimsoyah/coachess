/**
 * Check database status - verify tables exist and show counts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking database status...\n');
  console.log('═══════════════════════════════════════════\n');

  // Check auth users
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    console.log(`✅ Auth Users: ${users?.length || 0}`);
  } catch (error: any) {
    console.log(`❌ Auth Users: ${error.message}`);
  }

  // Check each table
  const tables = ['users', 'connections', 'content', 'assignments', 'messages'];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log(`✅ ${table.padEnd(15)}: ${count} records`);
    } catch (error: any) {
      if (error.message.includes('schema cache')) {
        console.log(`❌ ${table.padEnd(15)}: Table not found - Run supabase/setup.sql first!`);
      } else {
        console.log(`❌ ${table.padEnd(15)}: ${error.message}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════\n');

  // Check if auth users have corresponding user records
  try {
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    const { data: dbUsers } = await supabase.from('users').select('id');
    
    const authCount = authUsers?.length || 0;
    const dbCount = dbUsers?.length || 0;
    
    if (authCount > dbCount) {
      console.log(`⚠️  You have ${authCount} auth users but only ${dbCount} in the users table`);
      console.log(`   Run the backfill SQL in DATABASE_SETUP.md Step 4\n`);
    } else if (authCount === dbCount && authCount > 0) {
      console.log(`✅ All ${authCount} auth users are synced to the users table\n`);
    }
  } catch (error) {
    // Skip if tables don't exist yet
  }

  console.log('Next steps:');
  console.log('1. If tables don\'t exist, run: supabase/setup.sql in Supabase SQL Editor');
  console.log('2. If auth users > db users, run: backfill SQL from DATABASE_SETUP.md');
  console.log('3. If everything is set up, run: npm run populate-existing');
  console.log('4. Then start the app: npm run dev\n');
}

checkDatabase();
