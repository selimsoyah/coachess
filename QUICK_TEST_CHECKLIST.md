# ⚡ Quick Testing Checklist

**Use this for rapid testing of all core features**

---

## 🚀 Quick Setup (5 minutes)

- [ ] Clear localStorage in both browsers
- [ ] Dev server running at http://localhost:3000
- [ ] Migration 008 applied (optional but recommended)
- [ ] Two browser windows ready (Coach | Player)

---

## ✅ Core Feature Tests (30 minutes)

### Authentication (5 min)
- [ ] Sign up as coach (coach@test.com)
- [ ] Sign out and sign back in
- [ ] Session persists after refresh
- [ ] Sign up as player via invite (later step)

### Content (5 min)
- [ ] Create lesson with PGN
- [ ] Create puzzle with FEN
- [ ] View content - chessboard renders
- [ ] Edit content title
- [ ] Content count shows 2 on dashboard

### Connections (5 min)
- [ ] Coach invites player@test.com
- [ ] Copy invite link
- [ ] Player signs up with player@test.com
- [ ] Player accepts invite
- [ ] Connection shows "Accepted" on both sides
- [ ] Message button appears for coach

### Assignments (7 min)
- [ ] Coach creates assignment (lesson → player)
- [ ] Player sees assignment in dashboard
- [ ] Player opens assignment
- [ ] Player marks as complete
- [ ] Coach sees "Completed" status
- [ ] Create 2nd assignment (puzzle)
- [ ] Stats show: Coach (2 assigned), Player (1 completed, 1 pending)

### Messaging - REALTIME TEST (8 min)
- [ ] Coach clicks message button
- [ ] Coach sends: "Hello!"
- [ ] Player opens messages (same connectionId)
- [ ] **Player sees "Hello!" within 2 seconds (NO REFRESH)**
- [ ] Player replies: "Hi coach!"
- [ ] **Coach sees reply within 2 seconds (NO REFRESH)**
- [ ] Send 3 more messages back and forth
- [ ] All messages appear in correct order
- [ ] Auto-scroll works
- [ ] Timestamps shown

---

## 🎯 Critical Tests (Must Pass)

### Realtime Messaging
- [ ] Send message from Coach → Appears on Player side without refresh
- [ ] Send message from Player → Appears on Coach side without refresh
- [ ] Latency under 2 seconds

### Security
- [ ] Player cannot access /coach/content
- [ ] Coach cannot access /player/assignments
- [ ] Cannot accept invite with wrong email (if Migration 008 applied)
- [ ] Cannot create duplicate connection

### Data Persistence
- [ ] Refresh page → Still logged in
- [ ] Close and reopen browser → Session restored
- [ ] Messages persist after page reload
- [ ] Assignment completion persists

---

## 📊 Dashboard Verification

### Coach Dashboard
- [ ] Content count: 2
- [ ] Connections count: 1
- [ ] Assignments count: 2

### Player Dashboard
- [ ] Total assignments: 2
- [ ] Completed assignments: 1
- [ ] Connections count: 1

---

## ⚠️ Common Issues to Check

- [ ] No TypeScript errors in console
- [ ] No failed network requests (check Network tab)
- [ ] localStorage has 'coachess_session' key
- [ ] WebSocket connection established (check Network → WS filter)
- [ ] No React hydration errors
- [ ] No infinite re-renders

---

## 🏁 Pass/Fail Criteria

**PASS if**:
- ✅ All features work as expected
- ✅ Realtime messaging delivers within 2 seconds
- ✅ No data loss or corruption
- ✅ No critical errors in console
- ✅ Role-based access works

**FAIL if**:
- ❌ Cannot create account
- ❌ Messages don't deliver in realtime
- ❌ Assignments don't save
- ❌ Data inconsistencies
- ❌ App crashes or becomes unresponsive

---

## 📝 Quick Notes Space

**Issues Found**:
1. 
2. 
3. 

**Outstanding Items**:
1. 
2. 
3. 

**Next Steps**:
1. 
2. 
3. 

---

**Estimated Time**: 30-45 minutes for full quick test

**For detailed step-by-step instructions**, see `TESTING_SCENARIOS.md`
