'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 overflow-hidden">
      
      {/* Dynamic Sidebar */}
      <aside className="w-64 glass-panel m-4 hidden md:flex flex-col shadow-2xl z-10 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"></div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">StellR Admin</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          <Link href="/admin" className="block px-4 py-3 rounded-xl bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 font-medium shadow-inner transition-all hover:bg-indigo-500/30">
            📊 Dashboard
          </Link>
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            📤 Upload Station
          </Link>
        </nav>
        
        <div className="p-6 border-t border-white/10 bg-black/10 rounded-b-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-sm text-indigo-400">AD</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-200 truncate">Administrator</p>
              <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase">Active Session</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-500 border border-transparent hover:border-rose-400/50 transition-all shadow-sm">
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Scrollable Main Payload Content */}
      <main className="flex-1 h-screen overflow-y-auto w-full scroll-smooth custom-scrollbar relative">
        {/* Subtle background flair */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
        {children}
      </main>

    </div>
  );
}
