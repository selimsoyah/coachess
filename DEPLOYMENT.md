# CoaChess Deployment Guide

This guide will help you deploy your CoaChess MVP to production.

## 🚀 Quick Deployment (Vercel + Supabase)

### Prerequisites
- [x] Supabase project created and configured
- [x] All migrations applied (001, 002, 003, 004)
- [x] Environment variables ready
- [x] GitHub repository set up

---

## Step 1: Apply Database Migrations

### Method A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:

```sql
-- Run these in order:
-- 1. supabase/migrations/001_initial_schema.sql
-- 2. supabase/migrations/002_rls_policies.sql
-- 3. supabase/migrations/003_seed_data.sql (optional)
-- 4. supabase/migrations/004_fix_connections_rls.sql
```

4. Verify tables exist:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Expected tables:
- users
- connections
- content
- assignments
- messages
- sessions
- audit_log

### Method B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

---

## Step 2: Configure Environment Variables

Create `.env.local` for development:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)
5. Click **Deploy**

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

---

## Step 4: Post-Deployment Configuration

### Update Supabase Auth Settings

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add your Vercel domain to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

### Test Authentication Flow

1. Visit your deployed app
2. Sign up as a coach
3. Create test content
4. Generate invite link
5. Accept invite as player (use incognito/different browser)

---

## Step 5: Verify RLS Policies

Run these test queries in Supabase SQL Editor:

```sql
-- Test 1: Users can see their own profile
SELECT * FROM users WHERE id = auth.uid();

-- Test 2: Content is isolated by creator
SELECT * FROM content WHERE creator_id = auth.uid();

-- Test 3: Connections are visible to participants
SELECT * FROM connections 
WHERE coach_id = auth.uid() OR player_id = auth.uid();
```

---

## 🔧 Configuration Checklist

### Supabase
- [x] Project created
- [x] Database migrations applied (001-004)
- [x] RLS policies enabled on all tables
- [x] Auth redirect URLs configured
- [x] API keys noted (anon + service role)

### Vercel
- [x] Project deployed
- [x] Environment variables set
- [x] Domain configured
- [x] Build successful
- [x] Preview deployments enabled

### DNS (Optional)
- [ ] Custom domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate verified

---

## 🐛 Troubleshooting

### Issue: "Not authenticated" errors

**Solution**: Check environment variables are set correctly in Vercel:
```bash
vercel env ls
```

### Issue: RLS policy errors

**Solution**: Verify migration 004 was applied:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'connections';
```

Should show:
- connections_select_own
- connections_insert_coach
- connections_update_own
- connections_delete_own
- connections_select_by_token
- connections_accept_invite

### Issue: Invite links not working

**Solution**: 
1. Check the invite token is being generated
2. Verify RLS policy `connections_select_by_token` exists
3. Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Issue: Content not loading

**Solution**:
1. Check RLS policies for content table
2. Verify user is authenticated
3. Check browser console for errors
4. Test query directly in Supabase SQL Editor

---

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable in your Vercel dashboard:
1. Go to Project Settings
2. Enable **Web Analytics**
3. View traffic and performance metrics

### Supabase Monitoring

1. Go to **Database** → **Backups**
   - Enable daily backups
2. Go to **Settings** → **API**
   - Monitor API usage
3. Use **SQL Editor** for custom queries

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure in `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 🔒 Security Checklist

### Before Production
- [x] RLS policies enabled on all tables
- [x] Auth redirect URLs configured
- [x] Environment variables set (never commit `.env.local`)
- [x] Service role key stored securely (not in client code)
- [x] CORS configured correctly
- [x] Rate limiting considered (Supabase has built-in)

### After Deployment
- [ ] Test authentication with real email
- [ ] Verify only coaches can create content
- [ ] Verify only connected users see each other's data
- [ ] Test invite flow end-to-end
- [ ] Check mobile responsiveness
- [ ] Run security audit (optional)

---

## 🚦 Go-Live Checklist

### Pre-Launch
- [ ] All migrations applied
- [ ] RLS policies verified
- [ ] Environment variables configured
- [ ] Authentication tested
- [ ] Content creation tested
- [ ] Invite flow tested
- [ ] Mobile testing complete
- [ ] Performance tested (Lighthouse >90)

### Launch Day
- [ ] Deploy to production
- [ ] Verify SSL certificate
- [ ] Test all critical flows
- [ ] Monitor error logs
- [ ] Check analytics setup
- [ ] Announce to users

### Post-Launch (First Week)
- [ ] Monitor errors daily
- [ ] Check Supabase usage
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan next features

---

## 📈 Scaling Considerations

### Database
- Supabase free tier: 500MB, 2GB bandwidth
- Add indexes for frequently queried columns
- Consider upgrading to Pro for larger user base

### Hosting
- Vercel free tier: Generous for MVP
- Upgrade to Pro for:
  - Team collaboration
  - Advanced analytics
  - More build minutes

### Performance
- Optimize images with Next.js Image component
- Enable Vercel Edge caching
- Consider CDN for static assets

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel auto-deploys when you push to GitHub:

- **main branch** → Production
- **dev branch** → Preview
- **feature branches** → Preview deployments

### Manual Deployments

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Rollback
vercel rollback
```

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Plan**: See PROJECT_PLAN.md
- **Progress Report**: See PROGRESS_REPORT.md

---

## 🎉 Success!

Your CoaChess MVP is now live! 

Next steps:
1. Share with beta testers
2. Gather feedback
3. Implement Phase 4 (Assignments)
4. Continue building features from PROJECT_PLAN.md

---

**Last Updated**: October 25, 2025
