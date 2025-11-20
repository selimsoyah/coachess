# CoaChess Demo Walkthrough Guide
## Complete Feature Tour (15-20 minutes)

**Prerequisites**: Database populated with test data, app running on `http://localhost:3000`

---

## 🎯 Scenario 1: Coach Experience - Content Creation & Management

### Login as Coach
1. Go to `http://localhost:3000`
2. Click **"Sign In"**
3. Login with:
   - Email: `coach1@test.com`
   - Password: `Test123!`
4. ✅ You should be redirected to `/coach` dashboard

**Note**: All test accounts use password `Test123!`
- Coaches: coach1@test.com, coach2@test.com, coach3@test.com  
- Players: player1@test.com through player5@test.com
- All players have 10-15 assignments each from their connected coaches

### Explore Coach Dashboard
- **URL**: `http://localhost:3000/dashboard`
- **What to check**:
  - ✅ Welcome message with coach name
  - ✅ Quick stats cards (Connections, Lessons, Puzzles, Assignments)
  - ✅ Recent activity feed
  - ✅ Navigation sidebar (Dashboard, Content, Connections, Messages, Settings)

### Create New Lesson
1. Click **"Content"** in sidebar → `http://localhost:3000/dashboard/content`
2. Click **"Create New"** button
3. Select **"Lesson"** type
4. Fill in:
   - Title: "Advanced Endgame Techniques"
   - Description: "Master the art of king and pawn endgames with opposition and triangulation"
   - Tags: Add "endgame", "strategy"
5. **Chess Board Section**:
   - Set up a position: Click squares to add pieces
   - Or paste FEN: `4k3/8/4K3/8/8/8/4P3/8 w - - 0 1`
6. Add annotation: "White to move and demonstrate opposition"
7. Click **"Save Lesson"**
8. ✅ Verify: Lesson appears in content library

### Create New Puzzle
1. From Content page, click **"Create New"**
2. Select **"Puzzle"** type
3. Fill in:
   - Title: "Mate in 2: Back Rank Weakness"
   - Description: "Find the forcing checkmate sequence"
   - Difficulty: ⭐⭐⭐ (Intermediate)
   - Tags: "tactics", "checkmate"
4. Set position (FEN): `6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1`
5. Add solution moves: Ra8#
6. Add hint: "Look at the back rank!"
7. Click **"Save Puzzle"**
8. ✅ Verify: Puzzle appears with correct difficulty badge

### View Content Library
- **What to check**:
  - ✅ Filter by type (All, Lessons, Puzzles)
  - ✅ Search bar works
  - ✅ Sort by date/title
  - ✅ Each card shows: title, type, date, tags
  - ✅ Quick action buttons: Edit, Delete, Assign

### Edit Existing Content
1. Find "Ruy Lopez Opening - Complete Guide" lesson
2. Click **"Edit"** icon
3. Update description: Add "Includes key variations and strategic ideas"
4. Add new tag: "opening"
5. Click **"Update"**
6. ✅ Verify: Changes saved and reflected in library

---

## 🎯 Scenario 2: Coach Experience - Managing Players

### View Connections
1. Click **"Connections"** in sidebar → `http://localhost:3000/dashboard/connections`
2. **What to check**:
   - ✅ List of connected players
   - ✅ Player info: Name, email, connection date
   - ✅ Quick stats per player: Assignments, Completed, In Progress
   - ✅ Action buttons: Message, View Progress, Remove

### Invite New Player
1. Click **"Invite Player"** button
2. Fill in:
   - Email: `newplayer@test.com`
   - Personal message: "Looking forward to working with you!"
3. Click **"Send Invitation"**
4. ✅ Verify: 
   - Success message appears
   - Invitation shows as "Pending" in connections list
   - Copy invite link displayed

### View Player Progress
1. Find "Alex Johnson" (player1@test.com)
2. Click **"View Progress"** → `http://localhost:3000/dashboard/connections/[player-id]`
3. **What to check**:
   - ✅ Player stats overview
   - ✅ Assignment history with completion rates
   - ✅ Recent activity timeline
   - ✅ Performance graphs (if implemented)

### Assign Content to Player
1. From connections page, click **"Assign Content"** next to a player
2. Or go to Content → Click "Assign" on any lesson/puzzle
3. Select player(s): Check "Emma Williams" and "Michael Chen"
4. Set due date: 7 days from today
5. Add note: "Focus on the key tactical patterns"
6. Click **"Assign"**
7. ✅ Verify: 
   - Success notification
   - Assignment counter updates
   - Players receive notification (check their dashboards later)

---

## 🎯 Scenario 3: Coach Experience - Messaging

### Access Messages
1. Click **"Messages"** in sidebar → `http://localhost:3000/dashboard/messages`
2. **What to check**:
   - ✅ List of conversations (left panel)
   - ✅ Unread message indicators
   - ✅ Recent message preview
   - ✅ Search conversations

### Send Message to Player
1. Click on conversation with "Alex Johnson"
2. **Right panel shows**:
   - ✅ Full conversation history
   - ✅ Timestamps on messages
   - ✅ Message bubbles (coach on right, player on left)
3. Type message: "Great work on the Sicilian Defense puzzle! Let's review it in our next session."
4. Press Enter or click Send
5. ✅ Verify: 
   - Message appears immediately
   - Timestamp shows
   - Delivered indicator

### Start New Conversation
1. Click **"New Message"** button
2. Select player: "Sofia Rodriguez"
3. Type: "Hi Sofia! I've assigned some new endgame lessons. Let me know if you have questions."
4. Click Send
5. ✅ Verify: New conversation appears in list

### Test Real-time Messaging
1. Keep coach window open
2. Open new incognito window → Login as player1@test.com
3. Go to player messages
4. Send message from player: "Thanks coach! I'll review it today."
5. **Back to coach window**:
   - ✅ Message appears in real-time (no refresh needed)
   - ✅ Notification badge appears
   - ✅ Conversation moves to top of list

---

## 🎯 Scenario 4: Player Experience - Viewing Assignments

### Logout and Login as Player
1. Click profile icon → **"Sign Out"**
2. Sign in as:
   - Email: `player1@test.com` (Alex Johnson)
   - Password: `Test123!`

### Explore Player Dashboard
- **URL**: `http://localhost:3000/dashboard`
- **What to check**:
  - ✅ Welcome message with player name
  - ✅ Stats: Total assignments, Completed, In Progress, Pending
  - ✅ "My Assignments" section with filters
  - ✅ Connected coaches list
  - ✅ Recent activity

### View Assignments
1. **Dashboard shows assignments grouped by status**:
   - 📌 **Pending**: Not started yet
   - 🎯 **In Progress**: Currently working on
   - ✅ **Completed**: Finished assignments

### Work on a Lesson Assignment
1. Find "Ruy Lopez Opening - Complete Guide" (should be assigned)
2. Click **"Start"** or **"Continue"**
3. **Assignment page shows**:
   - ✅ Lesson title and description
   - ✅ Chess board with position
   - ✅ Annotations/instructions
   - ✅ Progress indicator
   - ✅ Due date
   - ✅ Mark as complete button

4. Study the content
5. Scroll down, take notes (if note-taking feature exists)
6. Click **"Mark as Complete"**
7. ✅ Verify:
   - Status changes to "Completed"
   - Completion badge appears
   - Coach gets notification
   - Assignment moves to "Completed" section

### Attempt a Puzzle Assignment
1. Find "Tactical Puzzle: Double Attack" assignment
2. Click to open → `http://localhost:3000/dashboard/assignments/[id]`
3. **Interactive puzzle page**:
   - ✅ Chess board (draggable pieces)
   - ✅ Instructions: "White to move and win material"
   - ✅ Hint button (reveals hint after 30 seconds)
   - ✅ Solution button (shows answer)
   - ✅ Try again button

4. Make moves on the board
5. If correct: ✅ Success animation + "Puzzle Solved!"
6. If incorrect: ❌ "Not quite, try again" + board resets
7. Click **"Show Solution"** if stuck
8. Mark as complete when satisfied

---

## 🎯 Scenario 5: Player Experience - Browse Content Library

### Access Content Library
1. Click **"Browse Content"** in sidebar → `http://localhost:3000/dashboard/content`
2. **What to check**:
   - ✅ All content created by connected coaches
   - ✅ Filter by type, difficulty, tags
   - ✅ Search functionality
   - ✅ Preview cards with thumbnails

### View Lesson Details
1. Click on any lesson (not assigned yet)
2. **Lesson detail page shows**:
   - ✅ Full description
   - ✅ Chess position viewer
   - ✅ Author info (coach name)
   - ✅ Creation date
   - ✅ Tags
   - ✅ "Request Assignment" button (optional feature)

### Filter and Search
1. Use filter: Select **"Puzzles"** only
2. ✅ Verify: Only puzzles displayed
3. Use search: Type "opening"
4. ✅ Verify: Only opening-related content shows
5. Clear filters
6. Sort by: **"Newest First"**
7. ✅ Verify: Most recent content at top

---

## 🎯 Scenario 6: Player Experience - Messaging Coach

### Send Message to Coach
1. Go to **Messages** → `http://localhost:3000/dashboard/messages`
2. Click conversation with "Magnus Carlsen" (coach1)
3. Type: "Hi coach! I completed the Ruy Lopez lesson. Could we schedule a session to review?"
4. Send message
5. ✅ Verify: Message sent successfully

### Check for Coach Reply
1. Keep window open
2. Have coach (in another tab/window) reply
3. ✅ Verify: Reply appears in real-time
4. ✅ Notification sound/indicator (if implemented)

---

## 🎯 Scenario 7: Settings & Profile

### Coach Settings
1. Login as coach1@test.com
2. Go to **Settings** → `http://localhost:3000/dashboard/settings`
3. **Profile Tab**:
   - ✅ Update display name
   - ✅ Add bio
   - ✅ Upload profile picture (if feature exists)
   - ✅ Set timezone
   - Click **"Save Changes"**

4. **Preferences Tab**:
   - ✅ Email notifications toggle
   - ✅ Assignment reminders frequency
   - ✅ Default assignment due date (e.g., 7 days)
   - ✅ Theme preference (Light/Dark)

5. **Account Tab**:
   - ✅ Change password
   - ✅ Email verification status
   - ✅ Account created date
   - ⚠️ Delete account (with confirmation)

### Player Settings
1. Login as player1@test.com
2. Go to Settings
3. Similar structure to coach settings
4. Additional options:
   - ✅ Difficulty preference
   - ✅ Study reminders
   - ✅ Coach visibility settings

---

## 🎯 Scenario 8: Error Handling & Edge Cases

### Test Connection Flow
1. As coach, try to invite existing player
2. ✅ Verify: "Already connected" message
3. Try invalid email format
4. ✅ Verify: Validation error displayed

### Test Content Creation Validation
1. As coach, create lesson without title
2. ✅ Verify: Required field error
3. Try to save puzzle without solution
4. ✅ Verify: Validation prevents saving

### Test Assignment Limits
1. Try to assign content to disconnected player
2. ✅ Verify: Only connected players in dropdown
3. Set due date in past
4. ✅ Verify: Warning or adjustment

### Test Offline Behavior
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to send message
4. ✅ Verify: 
   - User-friendly error message
   - Message queued for retry
   - No app crash

### Test Real-time Reconnection
1. Disconnect internet
2. Wait 30 seconds
3. Reconnect internet
4. ✅ Verify:
   - Realtime subscription reconnects
   - New messages sync automatically
   - No data loss

---

## 🎯 Scenario 9: Mobile Responsive Testing

### Test on Mobile Viewport
1. Open DevTools → Device Toolbar (Ctrl+Shift+M)
2. Select "iPhone 12 Pro" or similar
3. Test each page:

**Homepage**:
- ✅ Navigation collapses to hamburger menu
- ✅ Chess animation scales correctly
- ✅ CTAs remain visible
- ✅ Text readable without zooming

**Dashboard**:
- ✅ Sidebar becomes bottom nav or drawer
- ✅ Stats cards stack vertically
- ✅ Touch targets minimum 44x44px

**Content Library**:
- ✅ Cards stack in single column
- ✅ Filters collapse into drawer
- ✅ Search bar full-width

**Messages**:
- ✅ Conversation list and chat pane switch views
- ✅ Back button to return to list
- ✅ Input field stays above keyboard

**Chess Board**:
- ✅ Board scales to fit screen
- ✅ Pieces draggable with touch
- ✅ Controls accessible

---

## 🎯 Scenario 10: Performance & Loading States

### Test Loading States
1. Throttle network: DevTools → Network → "Slow 3G"
2. Navigate between pages
3. ✅ Verify:
   - Skeleton loaders appear
   - No content flash
   - Graceful loading indicators
   - No blank screens

### Test Data Fetching
1. Open React Query DevTools (bottom-right corner)
2. Navigate dashboard
3. ✅ Verify:
   - Queries cached appropriately
   - Background refetching works
   - Stale data handled correctly

---

## ✅ Complete Feature Checklist

After completing all scenarios, verify:

### Core Features
- ✅ Authentication (login/logout)
- ✅ Coach dashboard with stats
- ✅ Player dashboard with assignments
- ✅ Content creation (lessons & puzzles)
- ✅ Content library with filters
- ✅ Chess board viewer/editor
- ✅ Connections management
- ✅ Player invitations
- ✅ Assignment creation
- ✅ Assignment completion flow
- ✅ Real-time messaging
- ✅ Settings & preferences

### User Experience
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Success/error notifications
- ✅ Smooth animations
- ✅ Intuitive navigation

### Real-time Features
- ✅ Live message updates
- ✅ Assignment notifications
- ✅ Connection status updates
- ✅ Presence indicators (online/offline)

### Data Integrity
- ✅ Changes persist after refresh
- ✅ No data loss on errors
- ✅ Proper RLS (can't access others' data)
- ✅ Optimistic updates work correctly

---

## 🐛 Bug Reporting Template

If you find issues during testing, document them:

```
**Bug**: [Short description]
**Severity**: Critical / High / Medium / Low
**Steps to Reproduce**:
1. Login as coach1@test.com
2. Navigate to Content
3. Click Create Lesson
4. ...

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [If applicable]
**Browser**: Chrome 120.0.6099.109
**Console Errors**: [Any errors from DevTools]
```

---

## 🚀 Demo Presentation Order (10 minutes)

When presenting to client, follow this order:

1. **Homepage (1 min)**: Show chess animation, value proposition
2. **Coach Login (30 sec)**: Quick login as coach
3. **Content Creation (2 min)**: Create a lesson with chess board
4. **Assign to Player (1 min)**: Show assignment flow
5. **Switch to Player (30 sec)**: Login as player
6. **Complete Assignment (2 min)**: Show player experience
7. **Messaging (1 min)**: Real-time chat demo
8. **Connections (1 min)**: Show coach-player relationships
9. **Mobile View (1 min)**: Quick responsive demo
10. **Q&A (flexible)**: Answer questions

---

**Total Time**: 15-20 minutes for complete walkthrough
**Quick Demo**: 10 minutes hitting highlights
**Deep Dive**: 30+ minutes exploring all features

Good luck with your demo! 🎉
