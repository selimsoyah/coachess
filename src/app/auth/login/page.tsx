'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth/auth-raw';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn({ email, password });
      
      // Wait for localStorage to sync
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const storedSession = localStorage.getItem('coachess_session');
      
      if (!storedSession) {
        // Try to store it manually
        try {
          const manualSession = {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
            expires_at: result.session.expires_at,
            user: result.user,
          };
          localStorage.setItem('coachess_session', JSON.stringify(manualSession));
          
          const verifyAgain = localStorage.getItem('coachess_session');
          if (!verifyAgain) {
            throw new Error('localStorage.setItem is not working. Check browser settings or privacy mode.');
          }
        } catch (manualError: any) {
          throw new Error('Cannot store session: ' + manualError.message);
        }
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else if (errorMessage.includes('Invalid')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-12">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Link href="/" className="flex flex-col items-center space-y-2">
            {/* Chess Pieces Logo */}
            <div className="flex items-end space-x-1 text-white">
              <svg className="w-8 h-10" viewBox="0 0 40 50" fill="currentColor">
                <rect x="8" y="35" width="24" height="4" />
                <rect x="12" y="20" width="16" height="15" />
                <rect x="14" y="15" width="12" height="5" />
                <rect x="16" y="10" width="8" height="5" />
              </svg>
              <svg className="w-10 h-12" viewBox="0 0 50 60" fill="currentColor">
                <rect x="10" y="45" width="30" height="5" />
                <rect x="15" y="25" width="20" height="20" />
                <circle cx="25" cy="15" r="8" />
                <polygon points="25,5 22,10 28,10" />
              </svg>
              <svg className="w-8 h-10" viewBox="0 0 40 50" fill="currentColor">
                <rect x="8" y="35" width="24" height="4" />
                <rect x="12" y="20" width="16" height="15" />
                <rect x="14" y="15" width="12" height="5" />
                <rect x="16" y="10" width="8" height="5" />
              </svg>
            </div>
            <span className="text-2xl font-light tracking-[0.3em] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">SMART CHESS ACADEMY</span>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-700/60 to-gray-800/80 backdrop-blur-xl border border-gray-600/30 rounded-3xl p-10 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-amber-400 hover:text-amber-300 transition-colors underline">
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/30 bg-red-500/10 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-light">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-gray-600/30 rounded-xl focus:border-amber-500/50 focus:outline-none transition-all duration-200 text-white placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-light">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-gray-600/30 rounded-xl focus:border-amber-500/50 focus:outline-none transition-all duration-200 text-white placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm tracking-[0.1em] uppercase font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 rounded-xl shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 p-6 border border-gray-600/30 rounded-xl bg-white/5">
            <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-3 font-light">Demo Accounts:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white/5 border border-gray-600/30 rounded-lg">
                <span className="text-gray-400">Coach:</span>
                <span className="text-white font-mono">coach1@test.com</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white/5 border border-gray-600/30 rounded-lg">
                <span className="text-gray-400">Player:</span>
                <span className="text-white font-mono">player1@test.com</span>
              </div>
              <div className="text-center pt-2">
                <span className="text-gray-400">Password: </span>
                <span className="text-gray-300 font-mono">Test123!</span>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2">
              <span>←</span>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
