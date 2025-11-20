# 🚨 URGENT: Apply This SQL NOW

## Copy and paste this EXACT SQL into Supabase SQL Editor:

```sql
-- Step 1: Drop the old policy
DROP POLICY IF EXISTS "connections_update_involved" ON connections;

-- Step 2: Create the new policy with USING and WITH CHECK clauses
CREATE POLICY "connections_update_involved" ON connections
  FOR UPDATE
  USING (
    coach_id = auth.uid() OR 
    player_id = auth.uid() OR 
    (status = 'pending' AND player_id IS NULL)
  )
  WITH CHECK (
    coach_id = auth.uid() OR 
    player_id = auth.uid()
  );

-- Step 3: Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies 
WHERE tablename = 'connections' 
  AND policyname = 'connections_update_involved';
```

## What This Does:

**USING clause** (who can UPDATE which rows):
- `coach_id = auth.uid()` → Coaches can update their connections
- `player_id = auth.uid()` → Players can update their connections
- `(status = 'pending' AND player_id IS NULL)` → **Anyone authenticated can update pending invites with no player yet** ⭐

**WITH CHECK clause** (what values are allowed AFTER update):
- `coach_id = auth.uid()` → After update, coach_id must still be the coach
- `player_id = auth.uid()` → After update, player_id must be the current user

This allows a player to accept an invite (update a pending connection where player_id is NULL), and after the update, the player_id will be their own ID, which passes the WITH CHECK.

---

## After Running the SQL:

1. **Refresh your app** (Ctrl+R or Cmd+R)
2. **Open browser console** (F12)
3. **Create a new invite** as coach
4. **Accept the invite** as player
5. **Check console** - should see:
   - `Accepting invite: { inviteToken: "...", userId: "..." }`
   - `Accept invite response status: 200`
   - `Invite accepted - response data: [{ ...connection object... }]`
6. **Check coach dashboard** - connection should be "accepted"

If you still see the error "No connection was updated", the migration wasn't applied correctly.
