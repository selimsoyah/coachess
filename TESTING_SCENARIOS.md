# 🧪 CoaChess - Complete Testing Scenarios

**Purpose**: Test all MVP features end-to-end to ensure everything works correctly.

**Estimated Time**: 45-60 minutes for full test suite

---

## 📋 Pre-Test Checklist

Before starting tests:

- [ ] Dev server running: `npm run dev` at http://localhost:3000
- [ ] Migration 008 applied in Supabase (invited_email column)
- [ ] Two browser windows/profiles ready (one for coach, one for player)
- [ ] Clear localStorage in both browsers: `localStorage.clear()` in console
- [ ] Notepad ready to save invite links and IDs

---

## 🎭 Test Personas

You'll need to create these test users:

### Coach User
- **Email**: coach@test.com
- **Password**: TestCoach123!
- **Display Name**: Test Coach
- **Role**: Coach

### Player User
- **Email**: player@test.com
- **Password**: TestPlayer123!
- **Display Name**: Test Player
- **Role**: Player

---

## 📝 Test Scenario 1: Authentication & Onboarding

**Goal**: Verify user registration, login, and role-based access

### 1.1 Coach Sign Up

**Browser**: #1 (Coach)

1. **Navigate** to http://localhost:3000/auth/signup
2. **Fill in form**:
   - Email: `coach@test.com`
   - Password: `TestCoach123!`
   - Display Name: `Test Coach`
   - Role: Select "Coach"
3. **Click** "Sign up"
4. **Expected**: 
   - ✅ Redirected to `/dashboard` (coach dashboard)
   - ✅ See "Welcome, Test Coach" or similar
   - ✅ See stats: Content (0), Connections (0), Assignments (0)
   - ✅ Navigation shows: Dashboard, Content, Connections, Assignments
5. **Verify localStorage**:
   - Open DevTools Console (F12)
   - Run: `JSON.parse(localStorage.getItem('coachess_session'))`
   - ✅ Should show session with access_token, user object

**✅ PASS CRITERIA**:
- Coach account created successfully
- Redirected to coach dashboard
- Session stored in localStorage
- Coach-specific navigation visible

---

### 1.2 Coach Sign Out and Sign In

**Browser**: #1 (Coach)

1. **Click** "Sign out" button on dashboard
2. **Expected**: Redirected to `/auth/login`
3. **Sign in** with:
   - Email: `coach@test.com`
   - Password: `TestCoach123!`
4. **Expected**:
   - ✅ Redirected to `/dashboard`
   - ✅ Still shows as Test Coach
   - ✅ Session persisted after page refresh

**✅ PASS CRITERIA**:
- Sign out clears session
- Sign in restores session
- Can access dashboard after re-login

---

### 1.3 Player Sign Up (via Invite - Test Later)

**Note**: We'll test player signup via invite link in Scenario 3

---

## 📝 Test Scenario 2: Content Management

**Goal**: Verify coaches can create, edit, view, and delete chess content

### 2.1 Create Lesson Content (PGN)

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/content`
2. **Click** "New Content" or similar button
3. **Fill in form**:
   - Title: `King and Pawn Endgame`
   - Type: Lesson
   - PGN: 
   ```
   [Event "Endgame Lesson"]
   [White "Coach"]
   [Black "Student"]
   
   1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
   ```
4. **Click** "Save" or "Create"
5. **Expected**:
   - ✅ Success message appears
   - ✅ Redirected to content library
   - ✅ "King and Pawn Endgame" appears in list

**✅ PASS CRITERIA**:
- Content created successfully
- Appears in content library
- PGN stored correctly

---

### 2.2 Create Puzzle Content (FEN)

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/content`
2. **Click** "New Content"
3. **Fill in form**:
   - Title: `Checkmate in 2 Moves`
   - Type: Puzzle
   - FEN: `r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4`
4. **Click** "Save"
5. **Expected**:
   - ✅ Success message
   - ✅ Content appears in library
   - ✅ Shows correct type "Puzzle"

**✅ PASS CRITERIA**:
- Puzzle created with FEN
- Both lesson and puzzle visible in library
- Dashboard stats updated (Content: 2)

---

### 2.3 View Content

**Browser**: #1 (Coach)

1. **From content library**, click on "King and Pawn Endgame"
2. **Expected**:
   - ✅ Content detail page opens
   - ✅ Title displayed
   - ✅ Chess board shown with position
   - ✅ Can navigate moves (if implemented)
   - ✅ Edit/Delete buttons visible

**✅ PASS CRITERIA**:
- Can view content details
- Chess board renders correctly
- Navigation controls work (if implemented)

---

### 2.4 Edit Content

**Browser**: #1 (Coach)

1. **From content detail page**, click "Edit"
2. **Update**:
   - Title: `King and Pawn Endgame - Updated`
3. **Click** "Save"
4. **Expected**:
   - ✅ Success message
   - ✅ Title updated in content library
   - ✅ Changes persisted

**✅ PASS CRITERIA**:
- Can edit existing content
- Changes saved to database
- Updated content displayed correctly

---

### 2.5 Delete Content (Optional - save for later)

**Note**: Don't delete content yet, we need it for assignment testing

---

## 📝 Test Scenario 3: Connections & Invites

**Goal**: Verify coach can invite players and players can accept invites

### 3.1 Coach Creates Invite

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/connections`
2. **Click** "Invite Player" button
3. **Fill in form**:
   - Email: `player@test.com`
4. **Click** "Send Invite" or "Create Invite"
5. **Expected**:
   - ✅ Success message with invite link shown
   - ✅ Invite appears in connections list with status "Pending"
   - ✅ Shows invited email: `player@test.com`
6. **Copy the invite link** (should look like: `http://localhost:3000/invite/abc123xyz`)
7. **Save it** to notepad for next step

**✅ PASS CRITERIA**:
- Invite created successfully
- Invite link generated
- Shows as pending in connections list
- Dashboard stats updated (Connections: 1 pending)

---

### 3.2 Player Accepts Invite

**Browser**: #2 (Player - NEW browser/incognito window)

1. **Paste invite link** from previous step into address bar
2. **Expected**:
   - ✅ Redirected to invite page
   - ✅ See invitation message: "You've been invited by Test Coach" (or similar)
   - ✅ See "Accept Invite" button
   - ✅ Shows invited email: `player@test.com`
3. **If not logged in**, should see "Sign up to accept" option
4. **Click** "Sign up" or navigate to `/auth/signup`
5. **Fill in form** (IMPORTANT: Use the same email as invited):
   - Email: `player@test.com` (MUST match invited email)
   - Password: `TestPlayer123!`
   - Display Name: `Test Player`
   - Role: Player (should be auto-selected or only option)
6. **Click** "Sign up"
7. **Expected after signup**:
   - ✅ Redirected back to invite page OR directly to accept flow
8. **Click** "Accept Invite"
9. **Expected**:
   - ✅ Success message: "Connection accepted"
   - ✅ Redirected to player dashboard
   - ✅ Dashboard shows Connections: 1

**✅ PASS CRITERIA**:
- Player can access invite link
- Signup with matching email works
- Invite acceptance succeeds
- Connection status changes to "accepted"
- Both users see connection in their dashboards

---

### 3.3 Verify Connection (Both Sides)

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/connections` (or refresh if already there)
2. **Expected**:
   - ✅ Connection status changed from "Pending" to "Accepted"
   - ✅ Shows player name: "Test Player"
   - ✅ Shows player email: `player@test.com`
   - ✅ Message button (green chat icon) now visible

**Browser**: #2 (Player)

1. **Navigate** to player dashboard or connections page
2. **Expected**:
   - ✅ See connection to "Test Coach"
   - ✅ Status: "Accepted"

**✅ PASS CRITERIA**:
- Connection visible to both coach and player
- Status is "accepted" on both sides
- Coach sees message button
- Dashboard stats updated on both sides

---

### 3.4 Test Email Validation (Migration 008 Required)

**Browser**: #1 (Coach)

1. **Create another invite**:
   - Email: `specificplayer@test.com`
2. **Copy invite link**

**Browser**: #3 (Different Player - NEW incognito window)

1. **Paste invite link**
2. **Sign up with DIFFERENT email**:
   - Email: `wrongemail@test.com`
   - Password: `Test123!`
   - Display Name: `Wrong Email`
   - Role: Player
3. **Try to accept invite**
4. **Expected**:
   - ❌ Error message: "This invite was sent to specificplayer@test.com. Please sign in with that email."
   - ✅ Invite NOT accepted

**✅ PASS CRITERIA**:
- Email validation prevents wrong user from accepting
- Clear error message shown
- Invite remains pending

---

### 3.5 Test Duplicate Connection Prevention

**Browser**: #1 (Coach)

1. **Try to invite** `player@test.com` again (already connected)
2. **Expected**:
   - ❌ Error message: "You are already connected to this player"
   - ✅ No duplicate connection created

**✅ PASS CRITERIA**:
- Cannot create duplicate connections
- Clear error message
- Existing connection unaffected

---

## 📝 Test Scenario 4: Assignments

**Goal**: Verify coach can assign content and player can complete assignments

### 4.1 Coach Creates Assignment

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/assignments`
2. **Click** "New Assignment" or "Create Assignment"
3. **Fill in form**:
   - Content: Select "King and Pawn Endgame - Updated"
   - Player: Select "Test Player (player@test.com)"
   - Due Date: Tomorrow's date (optional)
4. **Click** "Assign" or "Create"
5. **Expected**:
   - ✅ Success message
   - ✅ Assignment appears in assignments list
   - ✅ Status: "Assigned"
   - ✅ Shows player name and content title
   - ✅ Dashboard stats updated (Assignments: 1)

**✅ PASS CRITERIA**:
- Assignment created successfully
- Linked to correct content and player
- Appears in coach's assignments list

---

### 4.2 Player Views Assignment

**Browser**: #2 (Player)

1. **Navigate** to player dashboard or `/player/assignments`
2. **Expected**:
   - ✅ See "King and Pawn Endgame - Updated" assignment
   - ✅ Status: "Assigned"
   - ✅ Shows due date (if set)
   - ✅ "View" or "Open" button visible
   - ✅ Dashboard stats updated (Total Assignments: 1, Completed: 0)

**✅ PASS CRITERIA**:
- Assignment visible to player
- Shows correct content title
- Status is "Assigned"

---

### 4.3 Player Opens and Completes Assignment

**Browser**: #2 (Player)

1. **Click** on the assignment to open it
2. **Expected**:
   - ✅ Content detail page opens
   - ✅ Chess board shows the lesson
   - ✅ Can view the position/moves
   - ✅ "Mark as Complete" button visible
3. **Click** "Mark as Complete"
4. **Expected**:
   - ✅ Success message: "Assignment completed"
   - ✅ Status changes to "Completed"
   - ✅ Completion timestamp shown
5. **Navigate** back to assignments list
6. **Expected**:
   - ✅ Assignment shows "Completed" status
   - ✅ Dashboard stats updated (Completed: 1)

**✅ PASS CRITERIA**:
- Player can open assignment
- Can view content
- Can mark as complete
- Completion recorded with timestamp

---

### 4.4 Coach Sees Completion

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/assignments` (or refresh)
2. **Expected**:
   - ✅ Assignment status changed to "Completed"
   - ✅ Shows completion date/time
   - ✅ Can see player completed the work

**✅ PASS CRITERIA**:
- Coach sees updated assignment status
- Completion visible on coach side
- Both sides show same status

---

### 4.5 Coach Creates Second Assignment (Puzzle)

**Browser**: #1 (Coach)

1. **Create another assignment**:
   - Content: "Checkmate in 2 Moves" (the puzzle)
   - Player: "Test Player"
2. **Expected**:
   - ✅ Second assignment created
   - ✅ Both assignments visible in list

**Browser**: #2 (Player)

1. **Check assignments list**
2. **Expected**:
   - ✅ Two assignments visible
   - ✅ One completed, one assigned
   - ✅ Dashboard shows: Total: 2, Completed: 1

**✅ PASS CRITERIA**:
- Can create multiple assignments
- Player sees both assignments
- Stats correctly show total vs completed

---

## 📝 Test Scenario 5: Real-Time Messaging

**Goal**: Verify coach and player can exchange messages in real-time

### 5.1 Coach Opens Messages

**Browser**: #1 (Coach)

1. **Navigate** to `/coach/connections`
2. **Find** "Test Player" connection (status: Accepted)
3. **Click** the green message button (chat icon)
4. **Expected**:
   - ✅ Redirected to `/messages/{connectionId}`
   - ✅ Header shows "Test Player" or connection info
   - ✅ Empty state: "No messages yet"
   - ✅ Message composer visible at bottom
   - ✅ Back button works

**✅ PASS CRITERIA**:
- Message page loads correctly
- Shows empty state initially
- Composer ready to use

---

### 5.2 Coach Sends First Message

**Browser**: #1 (Coach)

1. **Type in message composer**: "Hello Test Player! How are you finding the King and Pawn endgame lesson?"
2. **Press** Enter (or click Send)
3. **Expected**:
   - ✅ Message appears immediately in chat
   - ✅ Displayed on RIGHT side (blue bubble)
   - ✅ Shows timestamp
   - ✅ Composer clears after sending
   - ✅ No errors in console

**✅ PASS CRITERIA**:
- Message sent successfully
- Appears in chat immediately
- Displayed as own message (blue, right-aligned)
- Timestamp shown

---

### 5.3 Player Opens Messages and Sees Message (REALTIME TEST)

**Browser**: #2 (Player)

**IMPORTANT**: Do NOT refresh the page manually. We're testing realtime delivery.

**Option A: If player dashboard has message link**:
1. **Navigate** to player dashboard or connections
2. **Click** message link/button for "Test Coach"

**Option B: Direct URL**:
1. **Get connectionId** from Browser #1 URL (the UUID in `/messages/{uuid}`)
2. **Navigate** to same URL in Browser #2

3. **Expected**:
   - ✅ Page loads showing message history
   - ✅ Coach's message visible: "Hello Test Player!..."
   - ✅ Message on LEFT side (gray bubble)
   - ✅ Shows as from coach (not from self)
   - ✅ Timestamp shown

**⏱️ REALTIME TEST**: 
- Time from send (Browser #1) to visible (Browser #2): Should be 1-2 seconds max
- If you had Browser #2 messages page already open, message should appear automatically without refresh

**✅ PASS CRITERIA**:
- Message delivered to player
- Displayed correctly (left side, gray)
- Realtime delivery working (1-2 second latency)

---

### 5.4 Player Replies (REALTIME TEST)

**Browser**: #2 (Player)

1. **Type reply**: "Hi Coach! The lesson was great, I learned a lot about pawn endgames."
2. **Press** Enter
3. **Expected**:
   - ✅ Message appears in Browser #2 (right side, blue)
   - ✅ Composer clears

**Browser**: #1 (Coach) - WITHOUT REFRESHING

4. **Watch the chat** (don't refresh)
5. **Expected within 1-2 seconds**:
   - ✅ Player's reply appears automatically
   - ✅ Message on LEFT side (gray)
   - ✅ No page refresh needed
   - ✅ Auto-scrolls to new message

**✅ PASS CRITERIA**:
- Reply sent successfully
- Appears immediately for sender
- **Delivered in realtime to coach (no refresh)**
- Both users see conversation in correct order

---

### 5.5 Rapid Message Exchange

**Test rapid back-and-forth messaging**:

**Browser**: #1 (Coach)
1. Send: "Great! Let's try the puzzle now."

**Browser**: #2 (Player)
2. Watch message appear (1-2 sec)
3. Send: "Looking at it now..."

**Browser**: #1 (Coach)
4. Watch message appear
5. Send: "Hint: Look at the bishop and queen combination"

**Browser**: #2 (Player)
6. Watch message appear
7. Send: "Got it! Checkmate in 2 moves!"

**Expected**:
- ✅ All messages delivered in realtime
- ✅ Correct order maintained
- ✅ No duplicates
- ✅ No messages lost
- ✅ Auto-scroll works for new messages
- ✅ Timestamps accurate

**✅ PASS CRITERIA**:
- Multiple messages in quick succession all delivered
- Realtime updates work consistently
- Chat remains responsive
- No performance issues

---

### 5.6 Message with Line Breaks

**Browser**: #1 (Coach)

1. **Type message** with Shift+Enter for line breaks:
   ```
   Here are the key points:
   1. Control the center
   2. Activate your king
   3. Create passed pawns
   ```
2. **Send**
3. **Expected**:
   - ✅ Line breaks preserved
   - ✅ Formatting maintained
   - ✅ Readable in chat

**✅ PASS CRITERIA**:
- Multi-line messages work
- Formatting preserved
- Displayed correctly

---

### 5.7 Test WebSocket Reconnection

**Browser**: #1 (Coach)

1. **Open DevTools** → Network tab
2. **Filter** by WS (WebSocket)
3. **Find** the WebSocket connection to Supabase
4. **In Console**, close the WebSocket:
   ```javascript
   // This will be visible in the Network tab
   // The app should auto-reconnect
   ```
5. **Wait 5-10 seconds**
6. **Send a message** from Browser #2
7. **Expected**:
   - ✅ WebSocket reconnects automatically
   - ✅ Message still delivered
   - ✅ No errors shown to user

**✅ PASS CRITERIA**:
- WebSocket resilient to disconnections
- Messages still delivered after reconnect
- User doesn't see errors

---

## 📝 Test Scenario 6: Dashboard Statistics

**Goal**: Verify all dashboard stats are accurate and update in realtime

### 6.1 Coach Dashboard Stats

**Browser**: #1 (Coach)

1. **Navigate** to `/dashboard` or coach dashboard
2. **Verify numbers**:
   - Content: Should show `2` (King & Pawn lesson + Checkmate puzzle)
   - Connections: Should show `1` (Test Player)
   - Assignments: Should show `2` (both assignments created)
3. **Match against actual data**:
   - Go to `/coach/content` → Count items (should be 2)
   - Go to `/coach/connections` → Count accepted (should be 1)
   - Go to `/coach/assignments` → Count all (should be 2)

**✅ PASS CRITERIA**:
- All stats match reality
- No hardcoded zeros
- Stats fetch from database

---

### 6.2 Player Dashboard Stats

**Browser**: #2 (Player)

1. **Navigate** to player dashboard
2. **Verify numbers**:
   - Total Assignments: Should show `2`
   - Completed: Should show `1` (King & Pawn completed)
   - Connections: Should show `1` (Test Coach)
3. **Match against actual data**:
   - Go to `/player/assignments` → Count total (should be 2)
   - Count completed status (should be 1)

**✅ PASS CRITERIA**:
- Player stats accurate
- Completed count correct
- Total assignments correct

---

### 6.3 Stats Update After Actions

**Test stats update after changes**:

**Browser**: #2 (Player)

1. **Complete the second assignment** (Checkmate puzzle)
2. **Return to dashboard**
3. **Expected**:
   - ✅ Completed count updates to `2`
   - ✅ Total remains `2`

**Browser**: #1 (Coach)

1. **Create third assignment** (if you create more content)
2. **Return to dashboard**
3. **Expected**:
   - ✅ Assignments count updates to `3`

**✅ PASS CRITERIA**:
- Stats update after actions
- Counts remain accurate
- No caching issues

---

## 📝 Test Scenario 7: Error Handling & Edge Cases

**Goal**: Verify app handles errors gracefully

### 7.1 Invalid Login Credentials

**Browser**: #3 (New incognito)

1. **Navigate** to `/auth/login`
2. **Try to login** with:
   - Email: `nonexistent@test.com`
   - Password: `WrongPassword123!`
3. **Expected**:
   - ❌ Error message: "Invalid email or password"
   - ✅ Stays on login page
   - ✅ No console errors
   - ✅ Can try again

**✅ PASS CRITERIA**:
- Invalid login rejected
- Clear error message
- App doesn't crash

---

### 7.2 Empty Message

**Browser**: #1 (Coach in messages)

1. **Try to send empty message** (just spaces)
2. **Expected**:
   - ❌ Send button disabled OR
   - ❌ Error message shown
   - ✅ Message not sent

**✅ PASS CRITERIA**:
- Cannot send empty messages
- Validation works

---

### 7.3 Access Unauthorized Page

**Browser**: #2 (Player)

1. **Try to access** `/coach/content` (coach-only page)
2. **Expected**:
   - ✅ Redirected to player dashboard OR
   - ✅ Access denied message
   - ✅ Cannot see coach content

**Browser**: #1 (Coach)

1. **Try to access** `/player/assignments` (player-only page)
2. **Expected**:
   - ✅ Redirected to coach dashboard OR
   - ✅ Access denied
   - ✅ Cannot see player-specific views

**✅ PASS CRITERIA**:
- Role-based access control works
- Users can't access unauthorized pages
- Proper redirects

---

### 7.4 Expired/Invalid Invite Link

**Browser**: #3 (New incognito)

1. **Try to access** invite with invalid token: `/invite/invalidtoken123`
2. **Expected**:
   - ❌ Error message: "Invite not found" or "Invalid invite link"
   - ✅ Cannot proceed
   - ✅ Helpful error message

**✅ PASS CRITERIA**:
- Invalid invites rejected
- Clear error message
- App handles gracefully

---

### 7.5 Session Persistence After Refresh

**Browser**: #1 or #2 (Any logged-in user)

1. **Refresh the page** (F5 or Ctrl+R)
2. **Expected**:
   - ✅ Still logged in
   - ✅ Dashboard loads correctly
   - ✅ No redirect to login
   - ✅ User info still displayed

**Close tab and reopen**:
3. **Navigate** to http://localhost:3000/dashboard
4. **Expected**:
   - ✅ Still logged in (if localStorage persists)
   - ✅ Session restored

**✅ PASS CRITERIA**:
- Session persists across refreshes
- No need to re-login constantly
- localStorage working correctly

---

## 📝 Test Scenario 8: Mobile/Responsive Testing

**Goal**: Verify app works on mobile devices

### 8.1 Mobile View Testing

**Browser**: Any

1. **Open DevTools** (F12)
2. **Click** device toolbar icon (Ctrl+Shift+M)
3. **Select** iPhone 12 Pro or similar
4. **Test all pages**:
   - Login/Signup forms
   - Dashboard
   - Content library
   - Connections
   - Assignments
   - Messages
5. **Expected**:
   - ✅ All pages render correctly
   - ✅ No horizontal scroll
   - ✅ Buttons touchable
   - ✅ Forms usable
   - ✅ Messages readable

**✅ PASS CRITERIA**:
- App is responsive
- All features work on mobile
- UI doesn't break

---

## 📊 Test Results Summary

After completing all scenarios, fill in this summary:

### Core Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (Sign up/in/out) | ⬜ Pass / ⬜ Fail | |
| Content Creation (Lesson) | ⬜ Pass / ⬜ Fail | |
| Content Creation (Puzzle) | ⬜ Pass / ⬜ Fail | |
| Content Edit/View | ⬜ Pass / ⬜ Fail | |
| Coach Invite Player | ⬜ Pass / ⬜ Fail | |
| Player Accept Invite | ⬜ Pass / ⬜ Fail | |
| Email Validation (Migration 008) | ⬜ Pass / ⬜ Fail | |
| Duplicate Prevention | ⬜ Pass / ⬜ Fail | |
| Create Assignment | ⬜ Pass / ⬜ Fail | |
| Player View Assignment | ⬜ Pass / ⬜ Fail | |
| Player Complete Assignment | ⬜ Pass / ⬜ Fail | |
| Coach See Completion | ⬜ Pass / ⬜ Fail | |
| Send Message | ⬜ Pass / ⬜ Fail | |
| **Realtime Message Delivery** | ⬜ Pass / ⬜ Fail | |
| Rapid Message Exchange | ⬜ Pass / ⬜ Fail | |
| Dashboard Stats (Coach) | ⬜ Pass / ⬜ Fail | |
| Dashboard Stats (Player) | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |
| Role-Based Access | ⬜ Pass / ⬜ Fail | |
| Session Persistence | ⬜ Pass / ⬜ Fail | |
| Mobile Responsive | ⬜ Pass / ⬜ Fail | |

### Critical Issues Found

List any bugs or issues discovered during testing:

1. 
2. 
3. 

### Success Criteria (from PROJECT_PLAN.md)

- [ ] Coach can register, create content, and invite a player ✅
- [ ] Player accepts an invite, sees assigned content, and can mark it completed ✅
- [ ] Messaging between coach and player works in realtime ✅
- [ ] Data access enforced by RLS policies ✅
- [ ] All core features functional ✅

---

## 🚀 Next Steps After Testing

Based on test results:

### If All Tests Pass ✅
- Mark MVP as feature-complete
- Apply Migration 008 (if not done)
- Add UX enhancements (unread counts, notifications)
- Move to Phase 6: Write automated tests
- Prepare for production deployment

### If Tests Fail ❌
- Document all failures in detail
- Prioritize critical bugs (auth, messaging, data loss)
- Fix issues one by one
- Re-run affected test scenarios
- Iterate until all pass

---

## 📞 Support

If you encounter issues during testing:

1. **Check browser console** for errors (F12 → Console tab)
2. **Check Network tab** for failed requests
3. **Verify localStorage**: `localStorage.getItem('coachess_session')`
4. **Check Supabase logs** in Supabase Dashboard
5. **Review documentation** in project root (PHASE_5_MESSAGING_COMPLETE.md, etc.)

---

**Happy Testing! 🧪**

*Remember: Every bug found now is a bug not found by users later!*
