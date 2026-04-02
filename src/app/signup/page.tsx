'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('System Error: Passwords do not correlate');
      return;
    }
    
    if (name && email && password) {
      setLoading(true);
      setError('');
      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, admin: false }
          }
        });

        if (signUpError) throw signUpError;

        // Bypassing middleware generic loop handling synchronously locally
        document.cookie = "auth=true; path=/";
        router.push('/dashboard');
      } catch (err: any) {
        console.error('Supabase Insert Error:', err);
        setError(err.message || 'Verification Error. Contact administrator.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create Record</h1>
          <p className="text-slate-400 font-medium tracking-wide text-sm">Join StellR Supabase Servers</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm text-center shadow-[0_0_10px_rgba(249,115,22,0.2)] font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Public Identifier</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="glass-input w-full font-medium" 
              placeholder="Jack Daniels"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Email Target</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="glass-input w-full font-medium" 
              placeholder="you@corporate.com"
              suppressHydrationWarning
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Secure Hash Code</label>
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
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Verify Hash</label>
            <input 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={e => {
                setConfirmPassword(e.target.value);
                setError('');
              }} 
              className="glass-input w-full font-medium" 
              placeholder="••••••••"
              suppressHydrationWarning
            />
          </div>
          <button type="submit" disabled={loading} className={`glass-button w-full mt-6 font-bold tracking-widest uppercase ${loading ? 'opacity-70 cursor-not-allowed shadow-none' : ''}`}>
            {loading ? 'Transmitting Data...' : 'Confirm Injection'}
          </button>
        </form>
        
        <p className="text-center text-sm font-medium text-slate-400 mt-6 tracking-wide">
          Registry active?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
            Bind Connection
          </Link>
        </p>
      </div>
    </div>
  );
}
