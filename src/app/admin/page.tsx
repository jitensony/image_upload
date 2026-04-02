'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Company {
  name: string;
  imageCount: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'images'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/companies')
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = companies
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'images') return b.imageCount - a.imageCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalImages = companies.reduce((acc, c) => acc + c.imageCount, 0);

  return (
    <div className="p-6 md:p-10 animate-fade-in w-full max-w-7xl mx-auto space-y-10 relative z-0">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Admin Overview</h1>
          <p className="text-slate-400 text-sm">Analyze uploaded companies and manage system-wide storage securely.</p>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1 z-10">Companies</p>
          <p className="text-5xl font-black text-white z-10">{companies.length}</p>
        </div>
        
        <div className="glass-panel p-6 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1 z-10">Images Hosted</p>
          <p className="text-5xl font-black text-indigo-400 z-10">{totalImages}</p>
        </div>
      </div>

      {/* Interactive Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-black/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div className="relative w-full lg:max-w-md">
           <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           <input 
             type="text" 
             placeholder="Search by company name..." 
             className="glass-input w-full pl-12 h-12"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        
        <div className="flex bg-black/50 rounded-xl p-1.5 border border-white/5 w-full lg:w-auto overflow-hidden">
          <button onClick={() => setSortBy('date')} className={`flex-1 lg:w-32 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${sortBy === 'date' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>Latest</button>
          <button onClick={() => setSortBy('images')} className={`flex-1 lg:w-32 px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${sortBy === 'images' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>Volume</button>
        </div>
      </div>

      {/* Dynamic Data Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="font-semibold text-slate-400 tracking-wider text-sm">LOADING ARCHIVES...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
             <div className="col-span-full flex flex-col items-center justify-center p-20 glass-panel border-dashed border-2 border-slate-700/50">
               <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
               <h3 className="text-xl font-bold text-slate-300">No records found</h3>
               <p className="text-slate-500 mt-2 text-sm text-center max-w-sm">No company directories match your current query parameter or the disk is functionally completely empty.</p>
             </div>
          ) : (
             filtered.map((c, i) => (
               <Link href={`/admin/company/${c.name}`} key={i} className="glass-panel p-6 flex flex-col justify-between min-h-[160px] group hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-300 border-t border-t-white/20 border-l border-l-white/20">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="text-xl font-black text-slate-100 group-hover:text-indigo-300 transition-colors truncate" title={c.name}>{c.name}</h3>
                    <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap shadow-sm shadow-indigo-500/10">
                      {c.imageCount} imgs
                    </span>
                  </div>
                  
                  <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-4">
                     <div>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Index Registration</p>
                       <p className="text-sm font-semibold text-slate-300">{new Date(c.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-slate-500 transition-all shadow-md">
                       <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                     </div>
                  </div>
               </Link>
             ))
          )}
        </div>
      )}
    </div>
  );
}
