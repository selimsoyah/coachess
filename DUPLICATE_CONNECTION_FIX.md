# Fix: Cannot Connect to Existing Accounts

## The Problem

When trying to invite a player who already has an accepted connection, or trying to accept an invite when already connected, the system was failing with database constraint errors instead of giving helpful feedback.

**Symptoms**:
- Coach tries to invite player they're already connected to → Database error
- Player tries to accept invite when already connected → Duplicate key constraint violation
- No clear error messages explaining what's wrong

---

## Root Cause

The `connections` table has a unique constraint:
```sql
CONSTRAINT unique_coach_player UNIQUE (coach_id, player_id)
```

This prevents duplicate connections, which is correct. But the code wasn't checking for existing connections before attempting to create/update, causing database-level errors.

---

## Fixes Applied

### 1. Check for Existing Connections on Invite Creation

**File**: `/src/lib/connections/connections-service.ts` - `createInvite()`

**Before**:
- Directly tried to INSERT new connection
- Database rejected if duplicate exists
- Generic error message

**After**:
```typescript
// Check if there's an existing connection with this email
const existingConnections = await fetch(
  `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${userId}&invited_email=eq.${email}`
);

if (existingConnections.length > 0) {
  const existing = existingConnections[0];
  if (existing.status === 'accepted') {
    throw new Error('You are already connected to this player');
  } else if (existing.status === 'pending') {
    throw new Error('You already have a pending invite for this player. Please share the existing invite link.');
  }
}
```

**Result**: Clear error messages before attempting database operation.

### 2. Check for Existing Connections on Invite Acceptance

**File**: `/src/lib/connections/connections-service.ts` - `acceptInvite()`

**Before**:
- Directly tried to UPDATE connection with player_id
- Database rejected if duplicate exists
- Confusing "duplicate key" error

**After**:
```typescript
// Check if there's already an accepted connection between this coach and player
const existingConnectionCheck = await fetch(
  `${SUPABASE_URL}/rest/v1/connections?coach_id=eq.${coachId}&player_id=eq.${userId}&status=eq.accepted`
);

if (existingConnections.length > 0) {
  throw new Error('You are already connected to this coach');
}
```

**Result**: Friendly error message instead of database constraint violation.

### 3. Improved UI Error Handling

**File**: `/src/app/coach/connections/page.tsx`

**Added**:
- Error state display in the page
- Shows error messages in both alert AND on-page error banner
- Clearer feedback when duplicate invites are attempted

---

## User Experience Now

### Scenario 1: Coach Tries to Re-invite Accepted Player

**Before**:
```
❌ Error: duplicate key value violates unique constraint "unique_coach_player"
```

**After**:
```
⚠️ You are already connected to this player
```

### Scenario 2: Coach Has Pending Invite for Same Email

**Before**:
```
✅ New invite created (but duplicate exists)
```

**After**:
```
⚠️ You already have a pending invite for this player. Please share the existing invite link.
```

### Scenario 3: Player Accepts When Already Connected

**Before**:
```
❌ Error: duplicate key value violates unique constraint "unique_coach_player"
```

**After**:
```
⚠️ You are already connected to this coach
```

---

## Testing Instructions

### Test 1: Try to Invite Existing Connection

1. **Setup**: Coach and player already have accepted connection
2. **Action**: Coach tries to invite the same player email again
3. **Expected**: Error message "You are already connected to this player"
4. **Verify**: No duplicate connection created in database

### Test 2: Try to Create Duplicate Pending Invite

1. **Setup**: Coach already sent invite to `player@example.com` (pending)
2. **Action**: Coach tries to invite `player@example.com` again
3. **Expected**: Error "You already have a pending invite for this player. Please share the existing invite link."
4. **Verify**: Original invite still exists, no duplicate created

### Test 3: Player Accepts When Already Connected

1. **Setup**: 
   - Coach A and Player already connected (accepted)
   - Coach A creates a new invite for same player email
2. **Action**: Player tries to accept the new invite
3. **Expected**: Error "You are already connected to this coach"
4. **Verify**: Original connection unchanged

### Test 4: Valid New Connection

1. **Setup**: Coach and player have NO existing connection
2. **Action**: Coach invites player, player accepts
3. **Expected**: ✅ Connection created successfully
4. **Verify**: New connection appears in both dashboards with "accepted" status

---

## Database Query to Check for Duplicates

Run this in Supabase SQL Editor to see if you have any duplicate connections:

```sql
SELECT 
  coach_id, 
  player_id, 
  COUNT(*) as connection_count
FROM connections
WHERE player_id IS NOT NULL
GROUP BY coach_id, player_id
HAVING COUNT(*) > 1;
```

**Expected result**: 0 rows (no duplicates)

If you find duplicates, you can clean them up:

```sql
-- Keep only the most recent connection for each coach-player pair
DELETE FROM connections
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY coach_id, player_id 
             ORDER BY created_at DESC
           ) as rn
    FROM connections
    WHERE player_id IS NOT NULL
  ) t
  WHERE rn > 1
);
```

---

## Summary

✅ **Pre-flight checks added** - System checks for existing connections before attempting database operations  
✅ **Clear error messages** - Users see friendly messages instead of database errors  
✅ **UI improvements** - Error messages displayed prominently in the interface  
✅ **Prevents duplicates** - Can't create duplicate invites or accept duplicate connections  

**No migration needed** - These are code-only changes. The database constraint remains as protection.

---

## What Changed

- `createInvite()` now checks for existing connections by email before creating
- `acceptInvite()` now checks for existing accepted connections before updating
- Coach connections page shows error messages clearly
- All error cases now have user-friendly messages
