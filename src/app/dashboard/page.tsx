'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FileWithPreview {
  file: File;
  preview: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(val => val.type.startsWith('image/') && val.size <= 5 * 1024 * 1024);

    if (validFiles.length < newFiles.length) {
      setMessage('Some files were rejected. Only images under 5MB are allowed.');
    } else {
      setMessage('');
    }

    setFiles(prev => {
      const merged = [...prev, ...validFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))];
      return merged.slice(0, 100);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleUpload = async () => {
    const safeCompany = companyName.trim();
    if (!safeCompany) {
      setMessage('Please enter a company name.');
      return;
    }
    if (files.length === 0) {
      setMessage('Please select at least one image.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage('');

    let completedCount = 0;
    const totalFiles = files.length;

    try {
      for (const f of files) {
        const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const safeOriginalName = f.file.name.replace(/[^a-z0-9.]/gi, '_');
        const bucketPath = `${safeCompany}/${uniqueId}_${safeOriginalName}`;

        // Push object dynamically into native Supabase Storage blocks
        const { error: uploadError } = await supabase.storage
          .from('companies')
          .upload(bucketPath, f.file, { upsert: false });

        if (uploadError) throw uploadError;

        // Resolve absolute dynamic public URL generated from Storage Edge servers
        const { data: { publicUrl } } = supabase.storage
          .from('companies')
          .getPublicUrl(bucketPath);

        // Use secure server-side API proxy to completely bypass strict Supabase SQL RLS policies inherently
        const syncResponse = await fetch('/api/image/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: safeCompany,
            file_name: safeOriginalName,
            file_url: publicUrl,
            created_at: new Date().toISOString()
          })
        });

        if (!syncResponse.ok) {
          const syncData = await syncResponse.json();
          throw new Error(syncData.error || 'Server-side Postgres synchronization natively blocked.');
        }

        completedCount++;
        setProgress(Math.round((completedCount / totalFiles) * 100));
      }

      setMessage(`Successfully executed bulk transmission mapping ${completedCount} images securely to Supabase!`);
      setFiles([]);
      setCompanyName('');
    } catch (err: any) {
      console.error("Supabase Protocol Upload Exception:", err);
      setMessage(`Secure transmission intercept: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 4000);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 animate-fade-in bg-gradient-to-b from-slate-900 via-[#0a0a0f] to-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="flex justify-between items-center glass-panel p-5 sm:p-6 border border-white/5 bg-black/40 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-lg shadow-emerald-500/30"></div>
            <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400 tracking-tight">StellR IT Image Transmit</h1>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all px-5 py-2.5 border border-slate-600/50 rounded-lg bg-black/20 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            Logout
          </button>
        </header>

        <div className="glass-panel p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-[#0d0d12]/80 border-white/5 backdrop-blur-2xl">
          {/* Upload Configuration */}
          <div className="space-y-6 lg:col-span-1 border-r border-transparent lg:border-white/5 lg:pr-6">
            <div>
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                Settings
              </h2>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest leading-relaxed">Business Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="glass-input font-bold tracking-wide border-emerald-500/20 focus:border-emerald-500 focus:ring-emerald-500/20"
                disabled={uploading}
              />
              <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">Secure Image Transmission System by StellR IT LLC. Please upload up to 100 images below, each with a maximum size of 5 MB.</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0 || !companyName}
              className={`glass-button w-full flex justify-center items-center h-14 uppercase tracking-widest text-sm font-black transition-all ${uploading || files.length === 0 || !companyName ? 'opacity-40 cursor-not-allowed shadow-none grayscale filter bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50 hover:scale-105'}`}
            >
              {uploading ? 'Transmitting Data...' : 'Upload Image'}
            </button>

            {progress > 0 && (
              <div className="w-full bg-slate-900 rounded-full h-3 mt-5 overflow-hidden border border-black/50 shadow-inner p-[2px]">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold tracking-wide border ${message.includes('success') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-orange-500/10 border-orange-500/30 text-orange-400 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.15)]'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Drag & Drop Zone */}
          <div className="lg:col-span-2 space-y-5">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600/50 rounded-2xl p-8 sm:p-12 text-center hover:bg-[#12121a]/80 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-[1.01] cursor-pointer flex flex-col items-center justify-center min-h-[250px] bg-black/20 shadow-inner group"
            >
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

              <div className="w-20 h-20 bg-slate-900/80 shadow-2xl rounded-2xl flex items-center justify-center mb-6 border border-white/5 backdrop-blur-md group-hover:rotate-6 transition-transform">
                <svg className="w-10 h-10 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Upload Image</h3>
              <p className="text-sm text-slate-400 font-semibold">Drag & drop encrypted artifacts directly into this dropzone interface.</p>
              <div className="mt-6 flex gap-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-5 py-2.5 rounded-lg border border-emerald-500/20">
                <span>Hard Cap: 5MB</span>
                <span>•</span>
                <span>Volume Range: 100 </span>
              </div>
            </div>

            {/* Image Previews */}
            {files.length > 0 && (
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-5">
                  <h4 className="font-black text-slate-200 uppercase tracking-widest text-sm">Upload Matrix <span className="ml-3 bg-emerald-500/20 text-emerald-400 py-1.5 px-3 rounded-md text-xs font-black border border-emerald-500/30">{files.length} ITEMS</span></h4>
                  <button onClick={() => setFiles([])} className="text-xs font-black uppercase tracking-widest text-rose-500 hover:text-white transition-colors px-4 py-2 border border-rose-500/30 rounded-xl hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]">Clear Allocations</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/80 shadow-lg transition-transform hover:scale-110 hover:z-10 hover:border-emerald-500 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)]">
                      <img src={file.preview} alt={`preview-${i}`} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="bg-rose-600 text-white rounded-full p-2 hover:bg-rose-500 transform hover:scale-125 transition-all shadow-[0_0_15px_rgba(244,63,94,0.8)] border border-rose-400/50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
