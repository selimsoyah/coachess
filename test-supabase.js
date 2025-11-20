// Quick test script to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');

// Hardcode the values for testing
const supabaseUrl = 'https://egbetefiwmefsoynyemz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnYmV0ZWZpd21lZnNveW55ZW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzA0NjMsImV4cCI6MjA3NjkwNjQ2M30.o5GSzvT5nK9lQ91YxiWb_5r2ShUnEyCc0DT-g07FWIU';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Has Key:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }

    console.log('\n2. Testing auth signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456',
    });

    if (authError) {
      console.error('❌ Auth signup error:', authError.message);
      console.error('Full error:', authError);
    } else {
      console.log('✅ Auth signup successful!');
      console.log('User ID:', authData.user?.id);
      
      // Clean up test user
      if (authData.user) {
        console.log('\n3. Cleaning up test user...');
        await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
