import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiPlus, FiEdit, FiTrash2, FiSave, FiEye, FiTag, FiClock, FiSearch
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    image: '',
    tags: '',
    read_time: '5 Min Read',
    published: false
  });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/portfolio/blogs');
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      toast.error('Failed to retrieve blog list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Slug generator helper
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(title) : prev.slug
    }));
  };

  const openBlogModal = (blog = null) => {
    setEditBlog(blog);
    setForm(blog ? {
      ...blog,
      published: !!blog.published
    } : {
      title: '',
      slug: '',
      summary: '',
      content: '',
      image: '',
      tags: '',
      read_time: '5 Min Read',
      published: false
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let url = '/portfolio/blogs';
    let method = editBlog ? 'put' : 'post';
    if (editBlog) url += `/${editBlog.id}`;

    try {
      const { data } = await api[method](url, form);
      if (data.success) {
        toast.success(`Blog ${editBlog ? 'updated' : 'created'} successfully!`);
        setModalOpen(false);
        fetchBlogs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Database entry error.');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const { data } = await api.delete(`/portfolio/blogs/${id}`);
      if (data.success) {
        toast.success('Article deleted successfully.');
        fetchBlogs();
      }
    } catch (err) {
      toast.error('Failed to delete blog.');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.tags.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Blog Editor Workspace</h1>
            <p className="text-slate-500 dark:text-slate-400 font-light text-sm mt-1">Draft, configure, and publish tech logs</p>
          </div>
          <button 
            onClick={() => openBlogModal()}
            className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold flex items-center gap-2 hover:scale-103 transition-transform"
          >
            <FiPlus /> Draft New Post
          </button>
        </div>

        {/* Search bar */}
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search article titles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs focus:ring-primary/50 focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Blogs Grids */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-3xl">
            <FiFileText size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400 font-light text-sm">No drafted blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map(blog => (
              <div 
                key={blog.id} 
                className="glass-panel rounded-3xl border border-white/20 dark:border-slate-900 overflow-hidden flex flex-col justify-between"
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={blog.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800'} alt={blog.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-slate-950/80 text-white text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm font-semibold">
                    {blog.published ? (
                      <span className="text-emerald-500 font-bold">Published</span>
                    ) : (
                      <span className="text-amber-500 font-bold">Draft</span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 mb-2 font-light">
                      <span className="flex items-center gap-0.5"><FiClock /> {blog.read_time}</span>
                      <span className="flex items-center gap-0.5"><FiEye /> {blog.views || 0}</span>
                    </div>
                    <h3 className="text-base font-bold mb-2 line-clamp-1">{blog.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-4 line-clamp-2 leading-relaxed">
                      {blog.summary}
                    </p>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 dark:border-slate-900 pt-4 gap-2">
                    <button 
                      onClick={() => openBlogModal(blog)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg hover:text-primary transition-colors flex items-center gap-1 font-semibold"
                    >
                      <FiEdit /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-2 bg-red-500/10 text-red-500 text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Draft editor modal popup */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full h-[90vh] glass-panel border border-white/20 dark:border-slate-800 rounded-3xl p-6 md:p-8 relative z-55 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-bold mb-4 capitalize">{editBlog ? 'Edit' : 'Draft New'} Tech Article</h2>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-px mb-6"></div>
              </div>

              {/* Form scroll box */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                  <input type="text" required value={form.title} onChange={handleTitleChange} className="input-premium text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Slug URL</label>
                    <input type="text" required value={form.slug} onChange={e => setForm({...form, slug: generateSlug(e.target.value)})} className="input-premium text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tags (Comma separated)</label>
                    <input type="text" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input-premium text-xs" placeholder="React, Router, SPA" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Read Time Estimate</label>
                    <input type="text" value={form.read_time} onChange={e => setForm({...form, read_time: e.target.value})} className="input-premium text-xs" placeholder="5 Min Read" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Image URL</label>
                    <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input-premium text-xs" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Short Summary (SEO)</label>
                  <input type="text" required value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} className="input-premium text-xs" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Content Body HTML *</label>
                  <textarea rows={8} required value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="input-premium text-xs resize-none font-mono" placeholder="<p>Write raw HTML paragraph</p>..." />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="accent-primary" />
                  <span className="text-xs text-slate-500 font-bold">Publish to Daniel Paul's Blog feed</span>
                </label>
              </form>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold flex items-center gap-1 shadow-md hover:bg-primary-dark transition-colors"
                >
                  <FiSave /> Save Article
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default BlogManager;
