'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (name && email && password) {
      const usersStr = localStorage.getItem('stellr_users') || '[]';
      const users = JSON.parse(usersStr);
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists. Please log in.');
        return;
      }
      
      users.push({ name, email, password });
      localStorage.setItem('stellr_users', JSON.stringify(users));

      document.cookie = "auth=true; path=/";
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm">Join StellR Upload today</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="glass-input w-full" 
              placeholder="John Doe"
              suppressHydrationWarning
            />
          </div>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => {
                setConfirmPassword(e.target.value);
                setError('');
              }} 
              className="glass-input w-full" 
              placeholder="••••••••"
              suppressHydrationWarning
            />
          </div>
          <button type="submit" className="glass-button w-full mt-6">
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
