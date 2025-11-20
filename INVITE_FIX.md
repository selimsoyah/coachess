# 🔴 URGENT: Invite Link Fix

## The Problem
You're getting **"Invalid Invite"** error when clicking the generated invite link.

## Root Cause
The **Migration 007 hasn't been applied yet**, so the RLS policies are blocking the invite lookup. Specifically, the `getConnectionByToken()` function can't read the connection record because unauthenticated users don't have SELECT permissions.

## The Solution
Migration 007 adds a special RLS policy that allows **unauthenticated users** to view pending connections by invite token:

```sql
CREATE POLICY "connections_select_by_token" ON connections
  FOR SELECT
  USING (status = 'pending' AND invite_token IS NOT NULL);
```

This policy is **critical** because players may not be logged in when they first click an invite link.

---

## ⚡ Quick Fix Steps

### Step 1: Apply Migration 007 (REQUIRED)

1. Open **Supabase Dashboard**: https://supabase.com/dashboard/project/egbetefiwmefsoynyemz
2. Go to **SQL Editor**
3. Copy **ALL** the SQL from `/supabase/migrations/007_fix_connections_rls.sql`
4. Paste and click **Run**

### Step 2: Verify Policies

In the SQL Editor, run:
```sql
SELECT * FROM pg_policies WHERE tablename = 'connections';
```

You should see **5 policies**:
- ✅ `connections_insert_authenticated`
- ✅ `connections_update_involved`
- ✅ `connections_delete_coach`
- ✅ `connections_select_involved`
- ✅ `connections_select_by_token` ⭐ **← This one fixes the invite link**

### Step 3: Test Invite Link

1. **Create a new invite** (as coach):
   - Go to `/coach/connections`
   - Enter any email
   - Click "Create Invite"
   - Copy the invite link (e.g., `http://localhost:3000/invite/abc123xyz`)

2. **Open in incognito/private window**:
   - Paste the invite link
   - ✅ Should see coach details and "Continue to Sign Up" button
   - ✅ Should **NOT** see "Invalid Invite" error anymore

3. **Test acceptance**:
   - Click "Continue to Sign Up"
   - Create a player account
   - Should auto-accept the invite

---

## What Changed in Migration 007

### Before (Blocked):
- Only authenticated users with matching `coach_id` or `player_id` could view connections
- Invite links failed because unauthenticated visitors couldn't read the connection

### After (Fixed):
- Authenticated users can still view their own connections
- **Unauthenticated users can view pending connections by invite token**
- Invite acceptance flow works for both logged-in and new players

---

## Why This Happened

This is the **same pattern** as the previous fixes:
1. Migration 006 fixed content creation (added `creator_id`)
2. Migration 007 fixes connections creation (added `coach_id`)
3. **BUT** - connections also need **public read access** for invite tokens

The invite acceptance flow has 2 paths:
1. **New player**: Not logged in → Views invite → Signs up → Auto-accepts
2. **Existing player**: Logs in → Views invite → Clicks accept

Path #1 requires unauthenticated SELECT access, which is what the new policy provides.

---

## Summary

✅ **Migration 007 ready** - Adds 5 RLS policies including unauthenticated invite lookups  
⏳ **Apply migration NOW** - SQL is in `/supabase/migrations/007_fix_connections_rls.sql`  
🧪 **Test in incognito** - Verify invite links work without login  

After applying the migration, the "Invalid Invite" error will be resolved!
