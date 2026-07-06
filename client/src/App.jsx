import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import NotFound from './pages/NotFound.jsx';
import ResumePreview from './pages/ResumePreview.jsx';

// Admin & Auth Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminAnalytics from './pages/AdminAnalytics.jsx';
import PortfolioManager from './pages/PortfolioManager.jsx';
import BlogManager from './pages/BlogManager.jsx';
import MessagesManager from './pages/MessagesManager.jsx';
import AIManager from './pages/AIManager.jsx';
import SettingsManager from './pages/SettingsManager.jsx';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, role = 'admin' }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-light tracking-wider animate-pulse">Verifying secure session...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Portfolio Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/resume" element={<ResumePreview />} />

            {/* Unified Authentication Gates */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            {/* Protected Admin CMS Dashboard Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/portfolio" element={<ProtectedRoute><PortfolioManager /></ProtectedRoute>} />
            <Route path="/admin/blogs" element={<ProtectedRoute><BlogManager /></ProtectedRoute>} />
            <Route path="/admin/messages" element={<ProtectedRoute><MessagesManager /></ProtectedRoute>} />
            <Route path="/admin/ai" element={<ProtectedRoute><AIManager /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />

            {/* Fallback 404 Route */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        
        {/* Toast Toastifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;