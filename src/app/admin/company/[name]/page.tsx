'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ImageObj {
  filename: string;
  url: string;
}

export default function CompanyDetail({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const companyName = resolvedParams.name;
  const router = useRouter();
  
  const [images, setImages] = useState<ImageObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/companies/${companyName}/images`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setImages(data.images || []);
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin');
      });
  }, [companyName, router]);

  const handleDownload = () => {
    window.open(`/api/admin/companies/${companyName}/download`, '_blank');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyName}/delete`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        alert('Failed to delete company');
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch(err) {
      alert('Error communicating with server');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="p-6 md:p-10 animate-fade-in w-full max-w-7xl mx-auto relative z-0">
      
      {/* Header & Breadcrumbs */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5">
        <div>
          <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-3 inline-flex items-center gap-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{decodeURIComponent(companyName)}</h1>
            {!loading && <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-md text-xs font-bold border border-slate-700">{images.length} files</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex bg-black/30 p-1.5 rounded-xl border border-white/5 shadow-inner w-full sm:w-auto overflow-hidden">
          <button 
            onClick={handleDownload} 
            disabled={images.length === 0}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md ${images.length === 0 ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            ZIP All Images
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="ml-2 flex flex-1 sm:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 hover:border-transparent hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Delete
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
           <div className="w-12 h-12 border-4 border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="glass-panel p-20 flex flex-col items-center text-center border-dashed border-2 border-slate-700/50">
           <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
           <h3 className="text-xl font-bold text-slate-300">No images hosted</h3>
           <p className="text-slate-500 mt-2 max-w-sm leading-relaxed">This company block exists securely on disk but does not contain any valid image assets.</p>
        </div>
      ) : (
        <div className="glass-panel p-6 bg-black/10 border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.map((img, i) => (
              <a href={img.url} target="_blank" rel="noreferrer" key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/50 block hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-[1.03] hover:border-indigo-500/50 hover:z-10">
                 <img src={img.url} alt={img.filename} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-300" loading="lazy" />
                 <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                   <p className="text-xs text-slate-200 truncate font-semibold" title={img.filename}>{img.filename}</p>
                 </div>
                 <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-2">
                   <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                 </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Layer */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in custom-scrollbar">
          <div className="glass-panel p-8 max-w-sm sm:max-w-md w-full border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)] relative overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 border border-rose-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Delete Directory?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              You are about to permanently eradicate <strong className="text-rose-400 font-bold">{decodeURIComponent(companyName)}</strong> and all {images.length} linked assets from the disk. This action bypasses the trash bin and is highly irreversible.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                disabled={deleting} 
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors border border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={deleting} 
                className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] focus:outline-none focus:ring-2 focus:ring-rose-500 ${deleting ? 'opacity-50 cursor-not-allowed shadow-none hover:bg-rose-600' : ''}`}
              >
                {deleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Purging...
                  </>
                ) : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
