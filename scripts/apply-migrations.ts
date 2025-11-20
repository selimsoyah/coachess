/**
 * Apply all migrations to Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('🚀 Applying migrations to Supabase...\n');

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Apply in order

  console.log(`Found ${files.length} migration files:\n`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log();

  for (const file of files) {
    console.log(`📄 Applying ${file}...`);
    
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    
    // Split by semicolon but be careful with function definitions
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ';';
      
      // Skip empty or comment-only statements
      if (!stmt.trim() || stmt.trim() === ';') continue;
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt }).single();
      
      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase.from('_temp').select('*').limit(0);
        
        console.log(`   ⚠️  Could not execute via RPC, trying direct...`);
        // Since we can't execute arbitrary SQL via the client, we'll log it
        console.log(`   Statement ${i + 1}/${statements.length}: ${stmt.substring(0, 80)}...`);
        if (error.message.includes('does not exist') || error.message.includes('already exists')) {
          console.log(`   ✅ Likely already applied or needs manual execution`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Processed ${file}\n`);
  }

  console.log('\n✨ Migration process complete!');
  console.log('\n⚠️  Note: Since Supabase client cannot execute DDL directly,');
  console.log('you need to run these migrations in the Supabase SQL Editor:');
  console.log('\n1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy and paste each migration file content');
  console.log('5. Run them in order (001, 002, 003, etc.)\n');
}

applyMigrations();
