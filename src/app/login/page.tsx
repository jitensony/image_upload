'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      if (email === 'jack@stellrit.com' && password === 'StellR@54835') {
        document.cookie = "auth=true; path=/";
        document.cookie = "admin=true; path=/";
        router.push('/admin');
        return;
      }
      
      const usersStr = localStorage.getItem('stellr_users') || '[]';
      const users = JSON.parse(usersStr);
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        document.cookie = "auth=true; path=/";
        router.push('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
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
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
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
          <button type="submit" className="glass-button w-full mt-2">
            Sign In
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
