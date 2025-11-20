import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
  console.log('🔍 Checking database data...\n');

  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('*');
  
  console.log('📚 Content:', content?.length || 0, 'items');
  if (contentError) console.error('Content error:', contentError);
  
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*');
  
  console.log('📝 Assignments:', assignments?.length || 0, 'items');
  if (assignmentsError) console.error('Assignments error:', assignmentsError);

  if (assignments?.length) {
    console.log('\nAssignment details:');
    assignments.forEach((a: any) => {
      console.log(`  - ${a.id}: content=${a.content_id}, coach=${a.coach_id}, player=${a.player_id}, status=${a.status}`);
    });
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, email, role');
  
  console.log('\n👥 Users:');
  users?.forEach((u: any) => {
    console.log(`  - ${u.role}: ${u.email} (${u.id})`);
  });
}

checkData();
