import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/10 glow-blob animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 glow-blob animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full glass-panel rounded-3xl p-8 text-center relative z-10 border border-white/20 dark:border-slate-800"
      >
        <div className="inline-flex p-4 rounded-full bg-red-500/10 text-red-500 mb-6">
          <FiAlertCircle size={40} className="animate-bounce" />
        </div>

        <h1 className="text-8xl font-black text-slate-800 dark:text-white leading-none mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">Page Not Found</h2>
        
        <p className="text-slate-500 dark:text-slate-400 font-light mb-8">
          The project endpoint or portfolio page you are seeking has been moved, archived, or is currently unavailable.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark font-medium shadow-lg shadow-primary/20 dark:shadow-primary/10 transition-all duration-200"
          >
            <FiHome />
            Return to Portfolio
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
