# MVP Testing Guide

## Quick Test with Existing Data

Since we need the service role key to auto-create users, here's how to test everything manually:

### Step 1: Create Test Accounts

**Create 2 Coach Accounts:**
1. Go to http://localhost:3000/auth/signup
2. Sign up as:
   - Email: `coach@test.com` / Password: `Test123!` / Role: Coach
   - Email: `coach2@test.com` / Password: `Test123!` / Role: Coach

**Create 3 Player Accounts:**
1. Sign up as:
   - Email: `player1@test.com` / Password: `Test123!` / Role: Player
   - Email: `player2@test.com` / Password: `Test123!` / Role: Player
   - Email: `player3@test.com` / Password: `Test123!` / Role: Player

### Step 2: Test Coach Dashboard

**Login as coach@test.com:**

1. **Create Content** (Dashboard → Content → Create New)
   - Title: "Ruy Lopez Opening"
   - Description: "Master the Spanish Opening"
   - Type: Lesson
   - FEN: `r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3`
   - Click "Create Content"

2. **Add More Content:**
   - Title: "Sicilian Defense Basics"
   - Type: Lesson
   - FEN: `rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2`
   
   - Title: "Tactical Puzzle: Fork"
   - Type: Puzzle
   - FEN: `r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4`

3. **Connect with Players** (Dashboard → Connections → Generate Invite)
   - Generate an invite link
   - Copy the invite link
   - Logout

**Login as player1@test.com:**
1. Paste the invite link in browser
2. Accept the connection
3. Logout

**Repeat for player2 and player3**

**Login back as coach@test.com:**

4. **Create Assignments** (Dashboard → Assignments → Create Assignment)
   - Select: "Ruy Lopez Opening"
   - Assign to: player1@test.com
   - Due date: Pick a date next week
   - Click "Create Assignment"

5. **Create more assignments:**
   - Assign "Sicilian Defense" to player2
   - Assign "Tactical Puzzle" to player1 and player2

6. **Send Messages** (Dashboard → Messages)
   - Click on player1's conversation
   - Send: "Great work! Let's review the Ruy Lopez next session."
   - Send another message

### Step 3: Test Player Dashboard

**Login as player1@test.com:**

1. **View Assignments** (Dashboard → Assignments)
   - Should see "Ruy Lopez Opening" and "Tactical Puzzle"
   - Click on one assignment
   - Mark as "In Progress"
   - Later mark as "Completed"

2. **View Messages** (Dashboard → Messages)
   - Should see coach's message
   - Reply: "Thank you coach! Looking forward to it."

3. **Check Dashboard Stats**
   - Should show: assignments count, completion rate, etc.

### Step 4: Test Real-time Features

**Open two browser windows side by side:**

**Window 1: Coach (coach@test.com)**
- Go to Messages → Select player1's conversation

**Window 2: Player (player1@test.com)**
- Go to Messages → Select coach's conversation

**Test real-time messaging:**
- Type a message in coach's window → should appear instantly in player's window
- Type a message in player's window → should appear instantly in coach's window

### Step 5: Comprehensive Feature Test

#### ✅ Authentication
- [  ] Sign up as coach
- [  ] Sign up as player
- [  ] Login/Logout
- [  ] Password validation

#### ✅ Coach Dashboard
- [  ] View dashboard stats
- [  ] Create content (lesson & puzzle)
- [  ] Edit content
- [  ] Delete content
- [  ] View all content in library
- [  ] Generate invite link
- [  ] View connections
- [  ] Create assignments
- [  ] View assignment status
- [  ] Send messages
- [  ] Receive real-time messages

#### ✅ Player Dashboard
- [  ] View dashboard stats
- [  ] Accept connection via invite link
- [  ] View assigned content
- [  ] Update assignment status
- [  ] Complete assignments
- [  ] Send messages to coach
- [  ] Receive real-time messages

#### ✅ Content Management
- [  ] Content displays chess board correctly
- [  ] FEN positions render properly
- [  ] Content filtering (lessons vs puzzles)
- [  ] Content search (if implemented)

#### ✅ Assignments
- [  ] Coach can create assignments
- [  ] Player sees assignments
- [  ] Status updates (pending → in progress → completed)
- [  ] Due dates display correctly
- [  ] Completed assignments show timestamp

#### ✅ Messaging
- [  ] Send message coach → player
- [  ] Send message player → coach
- [  ] Real-time message delivery
- [  ] Message history loads
- [  ] Unread indicators (if implemented)
- [  ] Conversation list shows recent messages

#### ✅ Connections
- [  ] Generate invite link
- [  ] Accept invitation
- [  ] View connection status
- [  ] Connection appears in both dashboards

#### ✅ UI/UX
- [  ] Responsive on mobile
- [  ] Responsive on tablet
- [  ] Responsive on desktop
- [  ] Landing page animation works
- [  ] Navigation is intuitive
- [  ] Loading states display
- [  ] Error messages are clear

### Common Issues to Check

1. **If messages don't appear in real-time:**
   - Check browser console for errors
   - Verify Supabase Realtime is enabled
   - Try refreshing the page

2. **If content doesn't save:**
   - Check required fields are filled
   - Verify FEN position is valid
   - Check browser console for errors

3. **If invite links don't work:**
   - Ensure you're logged in as player when accepting
   - Check the URL is complete
   - Verify connection status in database

4. **If dashboard stats don't update:**
   - Refresh the page
   - Check if queries are returning data
   - Verify RLS policies allow reading

### Demo Presentation Tips

1. **Start with landing page:** Show off the chess animation
2. **Create coach account:** Demonstrate signup flow
3. **Create rich content:** Show 2-3 different lessons/puzzles
4. **Create player account:** Show player perspective
5. **Connect accounts:** Demonstrate invite link flow
6. **Create assignments:** Show assignment creation and tracking
7. **Test messaging:** Demonstrate real-time chat in split screen
8. **Show completion:** Player completes assignment, coach sees update

### Performance Notes

- First load may be slow (Next.js cold start)
- Subsequent navigation should be fast
- Real-time updates should be instantaneous
- Chess board rendering should be smooth

### For Future: Auto-populate Script

To use the auto-populate script, you need to:
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (keep it secret!)
3. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`
4. Run: `npx tsx scripts/populate-test-data.ts`

This will create all test accounts and data automatically.
