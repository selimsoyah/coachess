/**
 * Fix profiles for existing auth users
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfiles() {
  console.log('🔧 Fixing profiles for existing users...\n');

  // Get all auth users
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error listing users:', error);
    return;
  }

  console.log(`Found ${users.length} auth users\n`);

  for (const  user of users) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          role: user.user_metadata?.role || 'player',
        });

      if (insertError) {
        console.log(`❌ Error creating profile for ${user.email}:`, insertError.message);
      } else {
        console.log(`✅ Created profile for ${user.email}`);
      }
    } else {
      console.log(`✓ Profile exists for ${user.email}`);
    }
  }

  console.log('\n✨ Profile fix complete!\n');
}

fixProfiles();
