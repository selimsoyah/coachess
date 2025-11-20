# Smart Chess Academy - Chess Coaching Platform

A scalable MVP platform for chess coaches to deliver custom content (PGN/FEN lessons and puzzles), connect with players, assign content, track progress, and communicate in real-time.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Chess Logic**: chess.js
- **State Management**: TanStack Query (React Query)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
cd /home/salim/Desktop/coachess
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon/Public key
   - (Optional) Service role key for admin operations

3. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_data.sql` (optional, adds test data)

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
coachess/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   │   └── providers/          # Context providers (React Query)
│   ├── lib/
│   │   └── supabase/           # Supabase client and server utilities
│   └── types/                  # TypeScript types and interfaces
├── supabase/
│   └── migrations/             # Database schema and policies
├── public/                     # Static assets
└── PROJECT_PLAN.md             # Detailed development plan
```

## MVP Features - Current Status

### ✅ Phase 1: Core Platform & Authentication (COMPLETE)
- ✅ User roles (Coach, Player, Admin) with Supabase Auth
- ✅ User profiles with timezone support
- ✅ Role-based dashboards
- ✅ Session management with localStorage

### ✅ Phase 2: Content Creation & Management (COMPLETE)
- ✅ PGN/FEN content editor with live validation
- ✅ Interactive chess board viewer with playback controls
- ✅ Content library management (CRUD operations)
- ✅ Search and filter functionality
- ✅ Support for lessons (PGN) and puzzles (FEN)

### ✅ Phase 3: Connection & Invite System (COMPLETE)
- ✅ Coach-player connection system with unique invite tokens
- ✅ Invite creation and sharing
- ✅ Invite acceptance flow
- ✅ Connection status management (pending/accepted/revoked)
- ✅ Connection library for coaches

### 🚧 Phase 4: Assignments & Tracking (IN PROGRESS)
- 🚧 Content assignment flow
- 🚧 Player assignment dashboard
- 🚧 Progress tracking (assigned → completed)
- 🚧 Coach tracking dashboard
- 🚧 Realtime notifications

### 🚧 Phase 5: Communication & Polish (PLANNED)
- 🚧 Real-time messaging between coach and player
- 🚧 Message history and unread counts
- 🚧 Session scheduling interface
- 🚧 UX polish and refinements

### 🚧 Phase 6: Testing & Deployment (PLANNED)
- 🚧 Unit tests with Jest
- 🚧 E2E tests with Playwright
- 🚧 CI/CD pipeline setup
- 🚧 Production deployment to Vercel

## Development Roadmap

See `PROJECT_PLAN.md` for the complete development plan including:
- Detailed task breakdown
- Sprint plan (6-week MVP)
- Architecture diagrams
- API specifications
- Testing strategy
- Deployment checklist

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

This is currently in active MVP development. See the todo list and project plan for upcoming tasks.

## License

Private project - All rights reserved.
