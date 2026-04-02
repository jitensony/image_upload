'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email && password) {
      setLoading(true);
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      // Priority intercept for Super Administrator
      if (sanitizedEmail === 'jack@stellrit.com' && sanitizedPassword === 'StellR@54835') {
        document.cookie = "auth=true; path=/";
        document.cookie = "admin=true; path=/";
        router.push('/admin');
        return;
      }

      try {
        // Authenticate via robust Supabase API Network
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: sanitizedPassword
        });

        if (signInError) {
          setError(signInError.message || 'Invalid connection credentials. Double check your email and password.');
          setLoading(false);
          return;
        }

        document.cookie = "auth=true; path=/";
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Supabase Connect Error:', err);
        setError('Invalid connection credentials. Double check your email and password.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">StellR Upload</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm text-center shadow-[0_0_10px_rgba(249,115,22,0.2)] font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="glass-input w-full font-medium"
              placeholder="you@example.com"
              suppressHydrationWarning
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide">Password</label>
              <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold tracking-wide">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="glass-input w-full font-medium"
              placeholder="••••••••"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-center space-x-2 pt-2 pb-2">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-900"
            />
            <label htmlFor="remember" className="text-sm font-medium text-slate-400 select-none cursor-pointer hover:text-slate-200 transition-colors">
              Remember Authentication
            </label>
          </div>
          <button type="submit" disabled={loading} className={`glass-button w-full mt-2 font-bold tracking-widest uppercase ${loading ? 'opacity-70 cursor-not-allowed shadow-none' : ''}`}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-400 mt-8 tracking-wide">
          Don't have a Account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
