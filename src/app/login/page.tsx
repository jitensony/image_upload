'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
        // Authenticate Standard User identically securely against Google Firebase DB
        await signInWithEmailAndPassword(auth, sanitizedEmail, sanitizedPassword);
        
        document.cookie = "auth=true; path=/";
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Firebase Auth Error:', err);
        setError('Invalid connection credentials. Double check your email and password.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">StellR Upload</h1>
          <p className="text-slate-400 text-sm">Sign in to access your dashboard</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm text-center shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="glass-input w-full" 
              placeholder="you@example.com"
              suppressHydrationWarning
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="glass-input w-full" 
              placeholder="••••••••"
              suppressHydrationWarning
            />
          </div>
          <div className="flex items-center space-x-2 pt-1 pb-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-900" 
            />
            <label htmlFor="remember" className="text-sm text-slate-300 select-none cursor-pointer">
              Remember Me
            </label>
          </div>
          <button type="submit" disabled={loading} className={`glass-button w-full mt-2 font-bold tracking-wide ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
