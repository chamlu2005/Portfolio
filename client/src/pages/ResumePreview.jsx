import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ResumePreview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Verify file existence on mount
    const checkResume = async () => {
      try {
        const res = await fetch('/resume.pdf', { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || contentType.includes('text/html')) {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    checkResume();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Header bar */}
      <header className="h-16 px-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Portfolio
        </Link>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest sm:block hidden">
          Document Viewer &bull; resume.pdf
        </span>
        {!error && !loading && (
          <a
            href="/resume.pdf"
            download="Daniel_Paul_S_Resume.pdf"
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-colors"
          >
            <FiDownload />
            Download
          </a>
        )}
      </header>

      {/* Viewer Panel */}
      <main className="flex-1 w-full relative flex items-center justify-center bg-slate-900/30">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-450 animate-pulse font-light">Loading resume document preview...</p>
          </div>
        ) : error ? (
          <div className="glass-panel border border-red-500/20 rounded-3xl p-8 max-w-md text-center space-y-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit mx-auto">
              <FiAlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-bold">Resume Unavailable</h2>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              The requested resume PDF document could not be located in the server public resources. Please verify that the file exists at <code>client/public/resume.pdf</code>.
            </p>
            <Link 
              to="/" 
              className="inline-block px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <iframe 
            src="/resume.pdf#toolbar=1" 
            title="Daniel Paul S Resume"
            className="absolute inset-0 w-full h-full border-none"
          />
        )}
      </main>
    </div>
  );
};

export default ResumePreview;
