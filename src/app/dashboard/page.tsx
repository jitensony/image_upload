'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

  const handleLogout = () => {
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const addFiles = (newFiles: File[]) => {
    // Validate: images only, max 5MB
    const validFiles = newFiles.filter(val => val.type.startsWith('image/') && val.size <= 5 * 1024 * 1024);
    
    if(validFiles.length < newFiles.length) {
      setMessage('Some files were rejected. Only images under 5MB are allowed.');
    } else {
      setMessage('');
    }
    
    setFiles(prev => {
      const merged = [...prev, ...validFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))];
      return merged.slice(0, 100); // 100 images limit per requirements
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
    if(e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleUpload = async () => {
    if(!companyName.trim()) {
      setMessage('Please enter a company name.');
      return;
    }
    if(files.length === 0) {
      setMessage('Please select at least one image.');
      return;
    }
    setUploading(true);
    setProgress(0);
    setMessage('');
    
    const formData = new FormData();
    formData.append('companyName', companyName.trim());
    files.forEach(f => formData.append('images', f.file));

    try {
      // Simulate progress bar visually during the network request delay
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90));
      }, 300);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(interval);
      setProgress(100);
      const data = await res.json();
      
      if(res.ok) {
        setMessage('Upload successful!');
        setFiles([]);
        setCompanyName('');
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch(err) {
      setMessage('Error communicating with the server.');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center glass-panel p-5 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white">StellR Dashboard</h1>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 border border-slate-600 rounded-lg bg-black/20 hover:bg-black/40">
            Log Out
          </button>
        </header>

        <div className="glass-panel p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Configuration / Form side */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Upload Settings</h2>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
              <input 
                type="text" 
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp" 
                className="glass-input" 
                disabled={uploading}
              />
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">Images will be stored in a folder matching the company name.</p>
            </div>
            
            <button 
              onClick={handleUpload} 
              disabled={uploading || files.length === 0 || !companyName}
              className={`glass-button w-full flex justify-center items-center h-12 uppercase tracking-wide text-sm ${uploading || files.length === 0 || !companyName ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
            >
              {uploading ? 'Processing...' : 'Upload Images'}
            </button>
            
            {progress > 0 && (
              <div className="w-full bg-slate-800/80 rounded-full h-2 mt-4 overflow-hidden border border-slate-700 p-[1px]">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            
            {message && (
              <div className={`p-4 rounded-xl text-sm border font-medium ${message.includes('success') ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 backdrop-blur-md' : 'bg-rose-500/20 border-rose-500/30 text-rose-300 backdrop-blur-md'}`}>
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
              className="border-2 border-dashed border-slate-500/50 rounded-2xl p-8 sm:p-12 text-center hover:bg-slate-800/20 hover:border-indigo-400/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px] bg-black/10 shadow-inner"
            >
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              
              <div className="w-16 h-16 bg-slate-800/60 shadow-lg rounded-2xl flex items-center justify-center mb-5 border border-white/5 backdrop-blur-md">
                <svg className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Drag & drop images here</h3>
              <p className="text-sm text-slate-400">Or click to browse from your device</p>
              <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Max 5MB / img</span>
                <span>•</span>
                <span>Up to 100 imgs</span>
              </div>
            </div>
            
            {/* Image Previews */}
            {files.length > 0 && (
              <div className="p-5 bg-slate-800/40 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                  <h4 className="font-semibold text-slate-200">Selected Files <span className="ml-2 bg-indigo-500/20 text-indigo-300 py-1 px-2 rounded-md text-xs">{files.length} / 100</span></h4>
                  <button onClick={() => setFiles([])} className="text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors">Clear All</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-600/50 bg-black/50 shadow-lg transition-transform hover:scale-105">
                      <img src={file.preview} alt={`preview-${i}`} className="object-cover w-full h-full" />
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transform hover:scale-110 transition-all shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
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
