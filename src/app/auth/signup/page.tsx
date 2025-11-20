'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth/auth-raw';
import type { UserRole } from '@/types/database.types';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Starting signup for:', email);
      
      const result = await signUp({
        email,
        password,
        displayName,
        role,
      });
      
      console.log('Signup successful:', result);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.message || 'Failed to sign up';
      
      if (errorMessage.includes('rate limit')) {
        setError('Too many attempts. Please wait a moment or try a different email.');
      } else if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
        setError('Database permission error. Please contact support or check the setup guide.');
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(`Error: ${errorMessage}`);
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
              Create Account
            </h1>
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-amber-400 hover:text-amber-300 transition-colors underline">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-3 font-light">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('coach')}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-300 ${
                    role === 'coach'
                      ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-white shadow-lg shadow-amber-500/25'
                      : 'border-gray-600/30 hover:border-amber-500/50 bg-white/5 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-3">♟️</div>
                  <div className="text-sm tracking-[0.1em] uppercase font-medium mb-1">Coach</div>
                  <div className="text-xs text-current opacity-70">Create & assign content</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-300 ${
                    role === 'player'
                      ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-white shadow-lg shadow-amber-500/25'
                      : 'border-gray-600/30 hover:border-amber-500/50 bg-white/5 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="text-2xl mb-3">🎓</div>
                  <div className="text-sm tracking-[0.1em] uppercase font-medium mb-1">Player</div>
                  <div className="text-xs text-current opacity-70">Learn & practice</div>
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="displayName" className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-light">
                  Full Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600/30 rounded-xl focus:border-amber-500/50 focus:outline-none transition-all duration-200 text-white placeholder-gray-500"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-light">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600/30 rounded-xl focus:border-amber-500/50 focus:outline-none transition-all duration-200 text-white placeholder-gray-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2 font-light">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600/30 rounded-xl focus:border-amber-500/50 focus:outline-none transition-all duration-200 text-white placeholder-gray-500"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">Minimum 6 characters required</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm tracking-[0.1em] uppercase font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 rounded-xl shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

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
