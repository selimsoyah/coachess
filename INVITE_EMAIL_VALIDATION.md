# 🔐 Invite System with Email Validation

## The Problem You Identified

**Before**: 
- Coach creates invite with just a token
- ANY player with the link could accept
- No tracking of who was invited
- No way to verify the correct player accepted

**After**:
- Coach specifies player email when creating invite
- Email is stored in the `connections` table
- Only the invited email can accept the invite
- Full audit trail of who invited whom

---

## Changes Made

### 1. Migration 008: Add `invited_email` Column

**File**: `/supabase/migrations/008_add_invited_email.sql`

```sql
ALTER TABLE connections ADD COLUMN invited_email text;
CREATE INDEX idx_connections_invited_email ON connections(invited_email);
```

This allows tracking which specific email was invited.

### 2. Updated Connection Interface

**File**: `/src/lib/connections/connections-service.ts`

```typescript
export interface Connection {
  id: string;
  coach_id: string;
  player_id: string;
  status: 'pending' | 'accepted' | 'revoked';
  invite_token?: string;
  invited_email?: string; // ✅ NEW
  created_at: string;
  updated_at: string;
}
```

### 3. Enhanced createInvite Function

**Stores the invited email:**

```typescript
body: JSON.stringify({
  coach_id: userId,
  status: 'pending',
  invite_token: inviteToken,
  invited_email: playerEmail.toLowerCase().trim(), // ✅ Store the invited email
})
```

### 4. Email Validation in acceptInvite

**Validates that current user's email matches invited email:**

```typescript
// Fetch the connection to check invited email
const connection = await getConnectionByToken(inviteToken);

// Validate email match
if (connection.invited_email && 
    connection.invited_email.toLowerCase() !== userEmail.toLowerCase()) {
  throw new Error(
    `This invite was sent to ${connection.invited_email}. 
     Please login with that email address.`
  );
}

// Only if email matches, allow acceptance
```

### 5. UI Updates

**Invite Page** (`/invite/[token]`):
- Shows which email the invite was sent to
- Displays: "This invite was sent to: player@example.com"

**Coach Connections Page** (`/coach/connections`):
- Shows invited email for pending connections
- Format: "Invited: player@example.com" in italics

---

## How It Works Now

### Flow 1: New Player (Email Match)

1. **Coach creates invite**:
   - Goes to `/coach/connections`
   - Enters `player@example.com`
   - Invite created with `invited_email = 'player@example.com'`

2. **Player receives link**:
   - Clicks link → Sees "This invite was sent to: player@example.com"
   - Clicks "Continue to Sign Up"
   - Creates account with `player@example.com` ✅

3. **Validation passes**:
   - User email matches invited email
   - Connection accepted successfully
   - Coach sees player in connections

### Flow 2: Wrong Email (Rejected)

1. **Coach invites** `player1@example.com`

2. **Different player tries**:
   - User logs in as `player2@example.com`
   - Clicks accept
   - ❌ Error: "This invite was sent to player1@example.com. Please login with that email address."

3. **Connection blocked**:
   - Wrong player cannot accept
   - Invite remains pending

### Flow 3: Existing Player (Email Match)

1. **Coach invites** `player@example.com`

2. **Player already has account**:
   - Logs in as `player@example.com`
   - Clicks invite link
   - Clicks "Accept Invite"
   - ✅ Validation passes (emails match)
   - Connection accepted

---

## Security & Audit Benefits

### ✅ **Tracking & Accountability**

**In the database**, you can now see:

```sql
SELECT 
  c.id,
  coach.email as coach_email,
  c.invited_email,
  player.email as accepted_by_email,
  c.status,
  c.created_at
FROM connections c
JOIN users coach ON c.coach_id = coach.id
LEFT JOIN users player ON c.player_id = player.id
ORDER BY c.created_at DESC;
```

Result:
```
| coach_email        | invited_email      | accepted_by_email  | status   |
|--------------------|--------------------|--------------------|----------|
| coach@example.com  | player1@example.com| player1@example.com| accepted |
| coach@example.com  | player2@example.com| NULL               | pending  |
```

### ✅ **Prevents Unauthorized Access**

- Link sharing is useless if you don't have the invited email
- No one can "steal" an invite meant for someone else
- Coach knows exactly who accepted each invite

### ✅ **Audit Trail**

You can track:
- **Who invited whom**: `coach_id` + `invited_email`
- **Who actually accepted**: `player_id` + `player.email`
- **When**: `created_at` and `updated_at`
- **Current status**: `status` field

---

## Testing Instructions

### ⚠️ Step 1: Apply Migration 008

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/egbetefiwmefsoynyemz
2. Go to **SQL Editor**
3. Run:
   ```sql
   ALTER TABLE connections ADD COLUMN invited_email text;
   CREATE INDEX idx_connections_invited_email ON connections(invited_email);
   ```
4. Verify:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'connections' 
     AND column_name = 'invited_email';
   ```

### ✅ Step 2: Test Email Validation

**Test Case 1: Correct Email**
1. As coach, create invite for `test@example.com`
2. Create/login as player with `test@example.com`
3. Accept invite → Should succeed ✅

**Test Case 2: Wrong Email**
1. As coach, create invite for `player1@example.com`
2. Login as player with `player2@example.com`
3. Try to accept invite → Should fail with error message ❌
4. Error should say: "This invite was sent to player1@example.com..."

**Test Case 3: Verify in Database**
1. Go to Supabase → Table Editor → `connections`
2. Find the connection
3. Should see:
   - `coach_id`: Coach's UUID
   - `invited_email`: The email coach entered
   - `player_id`: Player's UUID (after acceptance)
   - `status`: 'accepted' or 'pending'

### ✅ Step 3: Verify UI Updates

1. **Coach Connections Page**:
   - Pending invites show: "Invited: player@example.com"
   - Accepted connections show player name and email

2. **Invite Page**:
   - Shows: "This invite was sent to: player@example.com"
   - Shows coach details

---

## Summary

✅ **Migration 008 created** - Adds `invited_email` column  
✅ **Email stored on invite creation** - Coach specifies who to invite  
✅ **Email validated on acceptance** - Only invited email can accept  
✅ **UI shows invited email** - Full transparency  
✅ **Audit trail complete** - Know exactly who invited whom and who accepted  

**Next**: Apply Migration 008 in Supabase, then test with different email scenarios!
