import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowLeft, FiClock, FiEye, FiTag } from 'react-icons/fi';
import api from '../utils/api.js';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/portfolio/blogs');
        if (data.success) {
          // Only show published articles for public view
          setBlogs(data.blogs.filter(b => b.published));
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter logic
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) || 
                          blog.summary.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? blog.tags.split(',').map(t => t.trim().toLowerCase()).includes(selectedTag.toLowerCase()) : true;
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags
  const allTags = Array.from(new Set(
    blogs.flatMap(blog => blog.tags ? blog.tags.split(',').map(t => t.trim()) : [])
  ));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 glow-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 glow-blob"></div>

      <header className="py-8 border-b border-slate-200/50 dark:border-slate-900 sticky top-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors group">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portfolio</span>
          </Link>
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Daniel Paul's Tech Log</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Search & Tag Filter bar */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search tech articles, summaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !selectedTag 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white border border-slate-200 dark:border-slate-800 text-slate-500 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Topics
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white border border-slate-200 dark:border-slate-800 text-slate-500 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton grids */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(x => (
              <div key={x} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-900 animate-pulse"></div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl">
            <FiTag className="mx-auto text-slate-400 mb-4" size={40} />
            <p className="text-slate-500 dark:text-slate-400 font-light">No published posts found matching your parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredBlogs.map((blog, idx) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-panel hover-card-trigger rounded-3xl overflow-hidden flex flex-col h-full border border-white/20 dark:border-slate-900"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={blog.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800'}
                    alt={blog.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1 font-medium">
                    <FiTag size={12} className="text-accent" />
                    <span>{blog.tags.split(',')[0]}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3 font-light">
                    <span className="flex items-center gap-1"><FiClock /> {blog.read_time || '5 Min Read'}</span>
                    <span className="flex items-center gap-1"><FiEye /> {blog.views || 0} Views</span>
                    <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 hover:text-primary dark:hover:text-primary-light transition-colors line-clamp-2">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h2>

                  <p className="text-slate-600 dark:text-slate-400 text-sm font-light mb-6 flex-1 line-clamp-3">
                    {blog.summary}
                  </p>

                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary-light hover:underline"
                  >
                    Read Full Article &rarr;
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;
