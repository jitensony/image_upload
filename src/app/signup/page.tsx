'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
      setError('Passwords do not match');
      return;
    }
    
    if (name && email && password) {
      setLoading(true);
      setError('');
      try {
        // Authenticate creation via Firebase Cloud Services natively securely
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Document generation via Cloud Firestore inside generic 'users' block
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name, 
          email: email.toLowerCase(), 
          createdAt: new Date().toISOString(),
          isAdmin: false
        });

        document.cookie = "auth=true; path=/";
        router.push('/dashboard');
        
      } catch (err: any) {
        console.error('Firebase Auth Create Error:', err);
        setError(err.message || 'Email already exists. Please log in.');
        setLoading(false);
      }
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
          <div className="mb-4 p-4 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-sm text-center shadow-[0_0_10px_rgba(244,63,94,0.2)]">
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
          <button type="submit" disabled={loading} className={`glass-button w-full mt-6 font-bold tracking-wide ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? 'Creating Credentials...' : 'Sign Up'}
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
