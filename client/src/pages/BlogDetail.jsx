import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiEye, FiCalendar, FiUser } from 'react-icons/fi';
import api from '../utils/api.js';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await api.get('/portfolio/blogs');
        if (data.success) {
          const match = data.blogs.find(b => b.slug === slug);
          if (match) {
            setBlog(match);
            // Increment view count in backend
            await api.post(`/portfolio/blogs/${match.id}/view`);
          }
        }
      } catch (err) {
        console.error('Error fetching blog details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-light animate-pulse">Loading article contents...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <Link to="/blogs" className="text-primary dark:text-primary-light flex items-center gap-1">
          <FiArrowLeft /> Back to Blogs Log
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/5 glow-blob"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/5 glow-blob"></div>

      <header className="py-6 border-b border-slate-200/50 dark:border-slate-900 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>All Articles</span>
          </Link>
          <span className="text-xs uppercase tracking-widest font-black text-primary dark:text-primary-light">Daniel Paul</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Tag and Title */}
          <div className="mb-6">
            <span className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-light text-xs font-semibold rounded-lg uppercase tracking-wider">
              {blog.tags.split(',')[0]}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            {blog.title}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-6 border-y border-slate-200 dark:border-slate-900 py-4 mb-8 text-sm text-slate-500 dark:text-slate-400 font-light">
            <div className="flex items-center gap-2"><FiUser className="text-primary" /> <span>Daniel Paul</span></div>
            <div className="flex items-center gap-2"><FiCalendar /> <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
            <div className="flex items-center gap-2"><FiClock /> <span>{blog.read_time || '5 Min Read'}</span></div>
            <div className="flex items-center gap-2"><FiEye /> <span>{blog.views || 0} Views</span></div>
          </div>

          {/* Featured Image */}
          <div className="rounded-3xl overflow-hidden aspect-video shadow-xl mb-12">
            <img
              src={blog.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800'}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Contents */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-350 leading-relaxed font-light text-base md:text-lg space-y-6"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tag cloud */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-wrap gap-2">
            {blog.tags.split(',').map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
                #{tag.trim()}
              </span>
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
};

export default BlogDetail;
