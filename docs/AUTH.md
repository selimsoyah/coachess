# Authentication & Access Control - Implementation Guide

## Overview

CoaChess uses **Supabase Auth** for authentication with custom user profiles stored in our `users` table. This approach combines Supabase's secure auth infrastructure with our application-specific user data and role-based access control.

## Architecture

```
┌─────────────────┐
│  Supabase Auth  │  ← Handles passwords, sessions, tokens
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Users Table    │  ← Stores role, profile, timezone
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  RLS Policies   │  ← Enforces access rules
└─────────────────┘
```

## User Roles

Three roles are supported:

- **Coach** - Creates content, invites players, assigns content, tracks progress
- **Player** - Receives assignments, completes work, messages coach
- **Admin** - Moderates content and users (Phase 2)

Roles are stored in the `users.role` column and enforced via RLS policies.

## Implementation

### 1. Auth Functions (`src/lib/auth/auth.ts`)

Core authentication operations:

- `signUp(data)` - Register new user with role selection
- `signIn(data)` - Email/password login
- `signOut()` - End session
- `getSession()` - Get current session
- `getCurrentUser()` - Get user profile with role
- `updateProfile(userId, updates)` - Update user profile
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Set new password

### 2. React Hooks (`src/lib/auth/hooks.ts`)

Client-side hooks for components:

- `useAuth()` - Get current user, session, loading state, role helpers
- `useRequireAuth()` - Protect routes (redirect to login if not authenticated)
- `useRequireRole(roles)` - Protect routes by role (e.g., coach-only pages)

### 3. Auth Context (`src/components/providers/AuthProvider.tsx`)

Global auth state provider wrapping the app. Listens to Supabase auth state changes and updates user context automatically.

## Pages

### Landing Page (`/`)
- Public home page with features and CTAs
- Links to `/auth/login` and `/auth/signup`

### Login (`/auth/login`)
- Email/password form
- Error handling
- Redirect to `/dashboard` on success

### Signup (`/auth/signup`)
- Email/password form
- **Role selection UI** (coach vs player)
- Display name input
- Auto-detects timezone
- Creates Supabase auth user + profile row
- Redirect to `/dashboard` on success

### Dashboard (`/dashboard`)
- Role-based router:
  - Coach → `/coach`
  - Player → `/player`
  - Admin → `/admin`

### Coach Dashboard (`/coach`)
- Protected route (coach-only via `useRequireRole`)
- Stats overview (content, players, assignments)
- Quick action buttons (placeholders for MVP)

### Player Dashboard (`/player`)
- Protected route (player-only)
- Stats overview (assignments, completed, coaches)
- Assignments list (empty state for now)

## Authentication Flow

### Signup Flow

```
1. User visits /auth/signup
2. Selects role (coach or player)
3. Enters email, password, display name
4. Form submits to signUp()
   ├─ Create Supabase auth user
   ├─ Insert row in users table (id = auth user id)
   └─ Set role, timezone, display_name
5. Auto sign-in and redirect to /dashboard
6. Dashboard redirects to /coach or /player based on role
```

### Login Flow

```
1. User visits /auth/login
2. Enters email/password
3. signIn() validates credentials with Supabase
4. Session created, user profile fetched
5. Redirect to /dashboard → role-based page
```

### Session Persistence

Supabase Auth automatically:
- Stores session in localStorage
- Refreshes tokens before expiry
- Restores session on page reload

The `useAuth` hook listens to `onAuthStateChange` and updates React state.

## Protected Routes

Use hooks to protect pages:

```tsx
// Require any authenticated user
function MyPage() {
  const { user, loading } = useRequireAuth();
  if (loading) return <Spinner />;
  if (!user) return null; // hook redirects
  return <div>Protected content</div>;
}

// Require specific role(s)
function CoachOnlyPage() {
  const { user, loading } = useRequireRole(['coach']);
  if (loading) return <Spinner />;
  if (!user) return null;
  return <div>Coach content</div>;
}
```

## Row-Level Security (RLS)

All database tables have RLS policies enforcing:

- Users can only view/update their own profile
- Coaches can create content, connections, assignments
- Players can view assigned content and update assignment status
- Messages restricted to connection participants

See `supabase/migrations/002_rls_policies.sql` for full policy definitions.

## Password Reset (Future)

Implemented but not yet wired to UI:

1. User clicks "Forgot Password" on login
2. Calls `resetPassword(email)`
3. Supabase sends email with reset link
4. Link redirects to `/auth/reset-password` with token
5. User enters new password
6. `updatePassword(newPassword)` updates credential

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key (optional, for admin ops)
```

## Security Considerations

✅ Passwords hashed by Supabase (bcrypt)  
✅ Session tokens HTTP-only  
✅ RLS policies enforce data access  
✅ Email verification disabled for MVP (enable in Supabase dashboard for prod)  
✅ Rate limiting on Supabase side  
⚠️ MFA not implemented (Phase 2)  
⚠️ OAuth providers not implemented (Phase 2)  

## Testing

### Manual Test Flow

1. **Signup as Coach**
   - Visit http://localhost:3000/auth/signup
   - Select "Coach", enter details, submit
   - Should redirect to `/coach` dashboard

2. **Signup as Player**
   - Repeat with "Player" role
   - Should redirect to `/player` dashboard

3. **Sign Out and Sign In**
   - Click "Sign Out" button
   - Visit `/auth/login`
   - Enter credentials
   - Should redirect to correct dashboard

4. **Protected Routes**
   - While signed out, try visiting `/coach` directly
   - Should redirect to `/auth/login`

### Test Credentials (from seed data)

If you ran `003_seed_data.sql`:

- Coach: `coach@test.com` / (set password via Supabase dashboard)
- Player: `player@test.com` / (set password via Supabase dashboard)
- Admin: `admin@test.com` / (set password via Supabase dashboard)

Note: Supabase seed data doesn't auto-create auth users, only DB rows. You'll need to create matching auth users manually or just sign up fresh accounts.

## Next Steps

After auth is working:

1. **Content Creation** - Build PGN/FEN editor for coaches
2. **Connections** - Implement invite flow for coach-player connections
3. **Assignments** - Let coaches assign content to players
4. **Messaging** - Real-time chat between coach and player

## Troubleshooting

**Error: "Missing Supabase environment variables"**  
→ Check `.env.local` has correct keys from Supabase dashboard

**Signup succeeds but can't fetch user profile**  
→ Ensure `users` table exists and RLS policies allow user to read own row

**Infinite redirect loop**  
→ Check that protected pages don't redirect authenticated users back to login

**Session not persisting**  
→ Clear localStorage and cookies, ensure Supabase client is singleton

## Files Created

```
src/
├── lib/
│   └── auth/
│       ├── auth.ts              # Core auth functions
│       └── hooks.ts             # React hooks (useAuth, useRequireAuth, useRequireRole)
├── components/
│   └── providers/
│       └── AuthProvider.tsx     # Auth context provider
└── app/
    ├── auth/
    │   ├── login/
    │   │   └── page.tsx         # Login page
    │   └── signup/
    │       └── page.tsx         # Signup with role selection
    ├── dashboard/
    │   └── page.tsx             # Role-based router
    ├── coach/
    │   └── page.tsx             # Coach dashboard
    └── player/
        └── page.tsx             # Player dashboard
```

---

**Status**: ✅ Auth system complete and ready for MVP  
**Next Task**: Content creation (PGN/FEN editor) or Connections (invite flow)
