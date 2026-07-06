import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiGrid, FiDatabase, FiFileText, FiMessageSquare, FiTrendingUp, FiSettings, 
  FiLogOut, FiMenu, FiX, FiBell, FiSun, FiMoon, FiCheck, FiTrash, FiUsers
} from 'react-icons/fi';
import profileImage from '../assets/images/profile.jpg';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../utils/api.js';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiGrid /> },
    { name: 'Visitor Analytics', path: '/admin/analytics', icon: <FiUsers /> },
    { name: 'Manage Portfolio', path: '/admin/portfolio', icon: <FiDatabase /> },
    { name: 'Manage Blogs', path: '/admin/blogs', icon: <FiFileText /> },
    { name: 'Recruiter Work', path: '/admin/messages', icon: <FiMessageSquare /> },
    { name: 'AI Workspace', path: '/admin/ai', icon: <FiTrendingUp /> },
    { name: 'System Settings', path: '/admin/settings', icon: <FiSettings /> }
  ];

  // Fetch real-time notifications on load
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/system/notifications');
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for simulated real-time updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/system/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.warn('Failed to read notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/system/notifications');
      setNotifications([]);
      setNotifDropdownOpen(false);
    } catch (err) {
      console.warn('Failed to clear notifications');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/admin/login');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-row transition-colors duration-300">
      
      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 hidden md:flex flex-col justify-between py-6 relative`}
      >
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="absolute right-[-14px] top-6 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all text-xs"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>

        <div>
          {/* Logo & Sidebar Profile image */}
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-primary/20 shrink-0 bg-slate-950">
              <img 
                src={profileImage} 
                alt="DP" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
                }}
              />
            </div>
            {sidebarOpen && (
              <span className="font-black text-sm tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CMS CONTROL
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`flex items-center gap-4 py-3.5 px-6 text-sm transition-all relative ${
                    isActive 
                      ? 'sidebar-link-active' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout at bottom */}
        <div className="px-3">
          <button 
            onClick={handleLogoutClick}
            className={`w-full flex items-center gap-4 py-3 px-3.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <FiLogOut className="text-lg" />
            {sidebarOpen && <span className="font-medium">Logout Session</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER & SLIDEOVER */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-35">
          {/* Breadcrumb / Section Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(prev => !prev)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <FiMenu />
            </button>
            <span className="font-bold text-sm text-slate-500 capitalize">
              {location.pathname.split('/').slice(-1)[0]}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg"
            >
              {darkMode ? <FiSun className="text-amber-500" /> : <FiMoon />}
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifDropdownOpen(prev => !prev)}
                className="p-2 text-slate-500 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg relative"
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-900 mb-3">
                    <span className="font-bold text-xs">Notifications ({unreadCount})</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAll}
                        className="text-[10px] text-red-500 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FiTrash /> Clear All
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6 font-light">No new notifications.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-2.5 rounded-xl text-xs flex gap-2 justify-between items-start transition-all cursor-pointer ${
                            notif.is_read 
                              ? 'bg-slate-50 dark:bg-slate-950/20 text-slate-400' 
                              : 'bg-primary/5 dark:bg-primary/10 text-slate-700 dark:text-slate-200 border-l-2 border-primary font-medium'
                          }`}
                        >
                          <p className="line-clamp-2 leading-relaxed flex-1">{notif.message}</p>
                          {!notif.is_read && <FiCheck className="text-primary mt-0.5 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar info */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 shrink-0 bg-slate-950">
                <img 
                  src={profileImage} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
                  }}
                />
              </div>
              <span className="text-xs font-bold hidden sm:inline">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
        </header>

        {/* CMS CHILD INTERFACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
