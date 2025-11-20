# Fix: Invite Acceptance Not Working

## Issues Found

1. **RLS UPDATE Policy Too Restrictive**: The policy only allowed updating if `coach_id = auth.uid() OR player_id = auth.uid()`, but when accepting an invite, `player_id` is NULL, so the player can't update it.

2. **No Filtering in getCoachConnections**: The function wasn't filtering by `coach_id`, so it might return all connections or none depending on RLS.

3. **No Console Logging**: Hard to debug what's actually happening during invite acceptance.

---

## Fixes Applied

### Fix 1: Update Migration 007 - Allow Invite Acceptance

**File**: `/supabase/migrations/007_fix_connections_rls.sql`

**Changed the UPDATE policy to allow updating when `player_id IS NULL`:**

```sql
-- UPDATE policy - allow both coach and player to update their connections
-- Special case: allow updating player_id when it's NULL (invite acceptance)
CREATE POLICY "connections_update_involved" ON connections
  FOR UPDATE
  USING (coach_id = auth.uid() OR player_id = auth.uid() OR player_id IS NULL);
```

**Why**: When a player accepts an invite, `player_id` is NULL. The original policy blocked the update because the player wasn't listed in the connection yet. This fix allows authenticated users to update connections where `player_id IS NULL`.

### Fix 2: Filter getCoachConnections by coach_id

**File**: `/src/lib/connections/connections-service.ts`

**Added `coach_id` filter to the query:**

```typescript
export async function getCoachConnections(): Promise<ConnectionWithUsers[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${userId}&select=*,coach:users!coach_id(*),player:users!player_id(*)&order=created_at.desc`,
    // Added: coach_id=eq.${userId} filter ^^^
    {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  // ...
}
```

**Why**: Without filtering, the function relied entirely on RLS policies, which might not return the expected results. Explicit filtering ensures the coach only sees their own connections.

### Fix 3: Enhanced Error Logging

**Files**: 
- `/src/lib/connections/connections-service.ts` (acceptInvite function)
- `/src/app/invite/[token]/page.tsx` (handleAccept function)

**Added console.log statements to track the flow:**

```typescript
export async function acceptInvite(inviteToken: string): Promise<Connection> {
  // ... auth checks ...
  
  console.log('Accepting invite:', { inviteToken, userId });

  const response = await fetch(/* ... */);
  
  console.log('Accept invite response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to accept invite' }));
    console.error('Accept invite error response:', error);
    throw new Error(error.message || error.hint || 'Failed to accept invite');
  }

  const data = await response.json();
  console.log('Invite accepted successfully:', data);
  return data[0];
}
```

**Why**: This helps debug issues in the browser console and provides better error messages.

---

## Testing Steps

### ⚠️ CRITICAL: Reapply Migration 007

**You MUST reapply the migration because it changed!**

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/egbetefiwmefsoynyemz
2. Go to **SQL Editor**
3. First, **drop the old policy**:
   ```sql
   DROP POLICY IF EXISTS "connections_update_involved" ON connections;
   ```
4. Then, **create the new policy**:
   ```sql
   CREATE POLICY "connections_update_involved" ON connections
     FOR UPDATE
     USING (coach_id = auth.uid() OR player_id = auth.uid() OR player_id IS NULL);
   ```
5. Verify:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'connections' AND policyname = 'connections_update_involved';
   ```

### Test Invite Acceptance Flow

1. **As Coach** - Create a new invite:
   - Go to `/coach/connections`
   - Click "Invite Player"
   - Enter any email
   - Copy the invite link

2. **As Player** (use incognito/private window):
   - Paste the invite link
   - Should see the invite page with coach details
   - If not logged in: Click "Continue to Sign Up" → Create player account
   - If logged in: Click "Accept Invite"

3. **Check Browser Console** (F12 → Console tab):
   - Should see logs:
     - `Accepting invite: { inviteToken: "...", userId: "..." }`
     - `Accept invite response status: 200`
     - `Invite accepted successfully: [...]`
     - `Invite accepted successfully, redirecting...`

4. **Verify in Database**:
   - Go to Supabase Dashboard → Table Editor → `connections`
   - Find the connection with the invite token
   - Should now have:
     - `status` = 'accepted'
     - `player_id` = the player's user ID (not NULL anymore)

5. **Verify in Coach Dashboard**:
   - Go to `/coach/connections`
   - The connection should now show as "accepted" (green badge)
   - Player name/email should be displayed

6. **Verify in Player Dashboard**:
   - Go to `/player` (as the player who accepted)
   - Should see the coach connection listed

---

## What Was Happening Before

**Symptom**: Player clicks "Accept Invite", gets redirected to player dashboard, but connection still shows as "pending" in coach dashboard.

**Root Cause**: The PATCH request to update the connection was failing silently because:
1. RLS policy didn't allow updating when `player_id IS NULL`
2. The player had no permission to modify the connection yet
3. Error wasn't displayed in the UI (no error handling in the redirect flow)

**The Flow**:
1. Coach creates invite → Connection: `{ coach_id: "X", player_id: NULL, status: "pending" }`
2. Player clicks accept → Tries to PATCH: `{ player_id: "Y", status: "accepted" }`
3. **RLS policy blocks** → Check fails: `coach_id = auth.uid()` ❌ (user is player), `player_id = auth.uid()` ❌ (player_id is NULL)
4. PATCH fails → But page still redirects → Connection stays pending

**After Fix**:
1. Coach creates invite → Connection: `{ coach_id: "X", player_id: NULL, status: "pending" }`
2. Player clicks accept → Tries to PATCH: `{ player_id: "Y", status: "accepted" }`
3. **RLS policy allows** → Check passes: `player_id IS NULL` ✅
4. PATCH succeeds → Connection updated: `{ coach_id: "X", player_id: "Y", status: "accepted" }`
5. Page redirects → Both coach and player see the accepted connection

---

## Summary

✅ **Migration 007 Updated** - Added `player_id IS NULL` condition to UPDATE policy  
✅ **getCoachConnections Fixed** - Added explicit `coach_id` filter  
✅ **Error Logging Added** - Console logs for debugging invite acceptance  

**Action Required**:
1. Drop old `connections_update_involved` policy in Supabase
2. Create new policy with `OR player_id IS NULL` condition
3. Test invite acceptance flow with browser console open
4. Verify connection changes from "pending" to "accepted" in both dashboards
