# Database Setup Instructions

## Problem
Your Supabase database doesn't have the required tables yet. You have 33 auth users but the migrations haven't been applied.

## Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`coachess`)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Setup Script

1. Open the file: `supabase/setup.sql` (in this project)
2. **Copy the entire contents** of that file
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

You should see: `Database setup complete! ✅`

### Step 3: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ users
   - ✅ connections
   - ✅ content
   - ✅ assignments
   - ✅ messages
   - ✅ sessions
   - ✅ audit_log

### Step 4: Backfill Existing Auth Users

You have 33 existing auth users that need to be migrated to the `users` table. Run this in the SQL Editor:

```sql
-- Backfill existing auth users into public.users table
INSERT INTO public.users (id, email, display_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as display_name,
  COALESCE(raw_user_meta_data->>'role', 'player') as role
FROM auth.users
ON CONFLICT (id) DO NOTHING;

SELECT COUNT(*) as users_migrated FROM public.users;
```

You should see: `users_migrated: 33`

### Step 5: Populate Test Data

Now run the population script to create connections, content, assignments, and messages:

```bash
cd /home/salim/Desktop/coachess
export $(cat .env.local | grep -v '^#' | xargs) && npx tsx scripts/populate-existing.ts
```

This will create:
- 9 connections between coaches and players
- 8 content items (lessons and puzzles with real chess positions)
- 16 assignments with various statuses
- 25 messages between users

### Step 6: Start the App & Test

```bash
npm run dev
```

Then login with any test account:
- **Coaches**: coach1@test.com, coach2@test.com, coach3@test.com
- **Players**: player1@test.com, player2@test.com, player3@test.com, player4@test.com, player5@test.com
- **Password for all**: Test123!

You should now see:
- ✅ Dashboard with connections
- ✅ Content library with lessons and puzzles
- ✅ Assignments with due dates
- ✅ Messages between coaches and players

## Troubleshooting

**Error: "table already exists"**
→ This is normal if some tables were partially created
→ The script uses `DROP TABLE IF EXISTS` to clean up first
→ It's safe to run again

**Error: "Could not find table in schema cache"**
→ This means the migrations haven't been applied yet
→ Run `supabase/setup.sql` in the SQL Editor

**No users after backfill**
→ Check that you ran the backfill SQL in Step 4
→ Verify auth users exist: Go to Authentication → Users in Supabase

**Populate script fails**
→ Make sure you ran Steps 1-4 first
→ Check that `.env.local` has all required keys
→ Verify SUPABASE_SERVICE_ROLE_KEY is set

## What The Setup Does

The `supabase/setup.sql` script:
1. **Drops and recreates** all tables (clean slate)
2. **Creates 7 tables**: users, connections, content, assignments, messages, sessions, audit_log
3. **Sets up indexes** for query performance
4. **Enables RLS** (Row Level Security) on all tables
5. **Creates policies** so users can only see their own data
6. **Adds a trigger** to automatically sync auth.users → public.users

The backfill SQL:
- Takes all existing auth users
- Creates matching records in public.users table
- Preserves their metadata (name, role)

The populate script:
- Uses your existing 33 auth users
- Creates realistic relationships and data
- Makes the app demo-ready for your client

## Ready for Demo!

Once all steps are complete, you have:
- ✅ Fully functional database
- ✅ 33 user accounts (3 coaches, 30 players)
- ✅ Real connections between coaches and players
- ✅ Sample chess content (lessons and puzzles)
- ✅ Assignments with various statuses
- ✅ Message history

Perfect for showing your client how the platform works! 🚀
