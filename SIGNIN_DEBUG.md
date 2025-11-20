# Debugging Sign-In Issues

## Quick Fixes Applied

1. ✅ Fixed localStorage key in `useAuth` hook (was `'supabase.auth.token'`, now `'coachess_session'`)
2. ✅ Added detailed console logging to `signIn()` function

---

## How to Debug Your Sign-In Issue

### Step 1: Clear Everything and Try Fresh

1. **Open Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Clear localStorage**:
   ```javascript
   localStorage.clear()
   ```
4. **Refresh the page** (Ctrl+R or Cmd+R)
5. **Try to sign in** and watch the console

---

### Step 2: Check Console Logs

After trying to sign in, you should see:

**✅ Success logs:**
```
Signing in with raw fetch... {email: "your@email.com"}
Sign in successful, user: <uuid>
Session stored in localStorage
```

**❌ Error logs (what to look for):**

**Error 1: "Invalid login credentials"**
```
Sign in failed: Error: Invalid login credentials
```
→ **Solution**: Wrong email or password. Reset password or check email.

**Error 2: "Email not confirmed"**
```
Sign in failed: Error: Email not confirmed
```
→ **Solution**: Check your email for confirmation link from Supabase. If testing, disable email confirmation in Supabase settings.

**Error 3: "Too many requests"** / **Rate limit**
```
Sign in failed: Error: Too many requests
```
→ **Solution**: Wait 5-10 minutes before trying again. Supabase has rate limits.

**Error 4: "Request failed with status 400"**
```
Sign in failed: Error: Request failed with status 400
```
→ **Solution**: Check if the user exists. May need to sign up first.

---

### Step 3: Check Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/egbetefiwmefsoynyemz
2. **Navigate to**: Authentication → Users
3. **Find your email** in the list
4. **Check the user status**:
   - ✅ If you see the user → User exists, check if email is confirmed
   - ❌ If you don't see the user → Need to sign up first

---

### Step 4: Check Email Confirmation Settings

If email is not confirmed:

1. **Supabase Dashboard** → Authentication → Settings
2. **Email Auth** section
3. Check **"Confirm email"** setting:
   - If enabled → Users must confirm email before logging in
   - If disabled → Users can login immediately

**For testing, you can disable email confirmation:**
1. Go to: Authentication → Settings → Email Auth
2. **Uncheck "Confirm email"**
3. Try signing in again

---

### Step 5: Check Network Tab

1. **Developer Tools (F12)** → **Network tab**
2. **Try to sign in**
3. **Look for request to**: `.../auth/v1/token?grant_type=password`
4. **Click on it** and check:
   - **Status**: Should be `200 OK` (success) or `400/401` (error)
   - **Response tab**: Shows error message if failed
   - **Payload tab**: Shows what was sent (email, password)

---

### Step 6: Verify Environment Variables

Check that your `.env.local` file has the correct values:

```bash
# In terminal, from project root:
cat .env.local
```

Should show:
```
NEXT_PUBLIC_SUPABASE_URL=https://egbetefiwmefsoynyemz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

If missing or wrong:
1. Create/update `.env.local` file
2. Restart dev server: `npm run dev`

---

## Common Issues and Solutions

### Issue 1: "Sign in button does nothing"

**Symptoms**: Click sign in, nothing happens

**Debug**:
1. Open console (F12)
2. Do you see "Signing in with raw fetch..."?
   - **NO** → Form not submitting. Check for JavaScript errors in console.
   - **YES** → Continue to next step

**Solution**: Check console for errors

### Issue 2: "Infinite redirect loop"

**Symptoms**: Page keeps redirecting to `/auth/login` or `/dashboard`

**Debug**:
1. Check localStorage: `localStorage.getItem('coachess_session')`
2. If null → Session not being saved
3. If exists → Check if session has `user` object

**Solution**: Clear localStorage and try again

### Issue 3: "Already signed in but can't access pages"

**Symptoms**: Can sign in, but redirected back to login when accessing dashboard

**Debug**:
1. Check: `localStorage.getItem('coachess_session')`
2. Parse it: `JSON.parse(localStorage.getItem('coachess_session'))`
3. Does it have:
   - `access_token`? ✓
   - `user` object? ✓
   - `user.id`? ✓

**Solution**: If any missing, clear localStorage and sign in again

---

## Manual Test Cases

### Test 1: Sign in with existing account

1. Go to `/auth/login`
2. Enter email and password
3. Click "Sign in"
4. **Expected**: Redirect to `/dashboard`
5. **Verify**: Dashboard loads and shows your email in header

### Test 2: Sign in with wrong password

1. Go to `/auth/login`
2. Enter correct email, wrong password
3. Click "Sign in"
4. **Expected**: Error message "Invalid email or password"
5. **Verify**: Stays on login page, shows error

### Test 3: Sign in with non-existent email

1. Go to `/auth/login`
2. Enter email that doesn't exist
3. Click "Sign in"
4. **Expected**: Error message "Invalid email or password"
5. **Verify**: Stays on login page, shows error

---

## Emergency: Create Test Account

If you can't sign in to any account, create a fresh test account:

1. **Go to**: `/auth/signup`
2. **Fill in**:
   - Email: `testcoach@example.com`
   - Password: `Test123456!`
   - Display Name: `Test Coach`
   - Role: Coach
3. **Click**: "Sign up"
4. **Expected**: Redirect to dashboard

If signup also fails, check console for errors and tell me what you see.

---

## What to Tell Me

If still not working, please provide:

1. **Console logs**: Copy/paste everything from console when you click sign in
2. **Network request**: 
   - F12 → Network tab → Find `token?grant_type=password` request
   - Right-click → Copy → Copy as cURL
   - Or screenshot the Response tab
3. **Error message**: Exact error shown in UI
4. **Account status**: Can you see the user in Supabase Dashboard → Authentication → Users?

---

## Summary

✅ **localStorage key fixed** in hooks.ts  
✅ **Console logging added** to signIn function  
📋 **Debugging steps** provided above  

Try the steps above and let me know which specific error you're seeing!
