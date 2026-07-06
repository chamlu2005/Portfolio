import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMail, FiBookmark, FiTrash2, FiCalendar, FiMessageSquare, FiStar, FiFilter
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';

const MessagesManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // all, bookmarked, interviews, highly-rated

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messages');
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      toast.error('Failed to load recruiter messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleBookmark = async (id, currentStatus) => {
    try {
      await api.put(`/messages/${id}/bookmark`, { bookmarked: !currentStatus });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, bookmarked: !currentStatus ? 1 : 0 } : m));
      toast.success('Bookmark state updated.');
    } catch (err) {
      toast.error('Failed to change bookmark.');
    }
  };

  const handleUpdateRating = async (id, rating) => {
    try {
      await api.put(`/messages/${id}/rating`, { rating });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, rating } : m));
      toast.success('Rating adjusted.');
    } catch (err) {
      toast.error('Failed to update rating.');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this feedback permanently?')) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted.');
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  // Filter messages based on tab selection
  const filteredMessages = messages.filter(m => {
    if (filterMode === 'bookmarked') return m.bookmarked;
    if (filterMode === 'interviews') return m.interview_request;
    if (filterMode === 'highly-rated') return m.rating >= 4;
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header information */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-sm mt-1">Review feedback, interview requests, and bookmarked leads.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
          {[
            { id: 'all', name: 'All Inbox' },
            { id: 'bookmarked', name: 'Bookmarked Leads' },
            { id: 'interviews', name: 'Interview Schedules' },
            { id: 'highly-rated', name: 'Top Reviews (4+ Stars)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-550'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Loading / Messages view */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="glass-panel text-center py-20 rounded-3xl">
            <FiMessageSquare size={40} className="text-slate-400 mx-auto mb-4" />
            <p className="text-slate-450 font-light text-sm">No recruiter feedback logged in this view.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {filteredMessages.map(msg => (
              <div 
                key={msg.id} 
                className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Message details */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-base text-slate-900 dark:text-white">{msg.recruiter_name}</span>
                    {msg.company && (
                      <span className="px-2.5 py-1 bg-primary/10 text-primary dark:text-primary-light text-[10px] rounded-lg font-bold">
                        {msg.company}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-light">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-550 dark:text-slate-400 font-light">
                    <p className="mb-2"><span className="font-semibold text-slate-700 dark:text-slate-200">Email:</span> {msg.email}</p>
                    {msg.subject && <p className="mb-1 font-bold text-slate-800 dark:text-slate-200">Sub: {msg.subject}</p>}
                  </div>

                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-light bg-slate-100/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-900">
                    {msg.message}
                  </p>

                  {/* Interview block if exists */}
                  {msg.interview_request && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3 text-xs">
                      <FiCalendar className="text-indigo-500 shrink-0" size={18} />
                      <div>
                        <span className="font-bold text-indigo-500 block mb-0.5">Interview Date Request</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {msg.interview_date || 'Pending Schedule Coordination'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toolbar controls */}
                <div className="flex md:flex-col justify-end md:justify-start items-center gap-3 md:border-l md:border-slate-200/50 md:dark:border-slate-800/50 md:pl-6 shrink-0">
                  {/* Bookmark Button */}
                  <button 
                    onClick={() => handleToggleBookmark(msg.id, !!msg.bookmarked)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                      msg.bookmarked 
                        ? 'bg-amber-500/10 border-amber-500/25 text-amber-500' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <FiBookmark className={msg.bookmarked ? 'fill-amber-500' : ''} />
                    <span>Bookmark</span>
                  </button>

                  {/* Ratings updater */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => handleUpdateRating(msg.id, star)}
                        className="text-slate-300 dark:text-slate-800 hover:scale-105"
                      >
                        <FiStar size={14} className={star <= (msg.rating || 0) ? 'fill-amber-500 text-amber-500' : ''} />
                      </button>
                    ))}
                  </div>

                  {/* Delete message button */}
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors mt-auto md:w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default MessagesManager;
