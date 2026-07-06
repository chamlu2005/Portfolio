import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle, FiGithub, FiUser, FiArrowLeft, FiSend, FiKey } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import { requestFCMToken } from '../utils/firebase.js';

const Login = () => {
  const { login, enterAsGuest, forgotPassword, resetPassword, user, registerDeviceToken } = useAuth();
  const navigate = useNavigate();

  // Mode states: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Reset Form States
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI Loading/Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, route them appropriately
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        // Attempt FCM token request for Admin
        requestFCMToken().then(token => {
          if (token) registerDeviceToken(token);
        }).catch(err => console.log('FCM token setup error:', err));

        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, rememberMe);
      if (result.success) {
        toast.success(`Welcome back, ${email.split('@')[0]}!`);
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError('Network connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestClick = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await enterAsGuest();
      if (result.success) {
        toast.success('Entered as guest visitor.');
        navigate('/');
      } else {
        setError(result.message || 'Failed to enter as guest.');
      }
    } catch (err) {
      setError('Network error entering guest session.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        toast.success('Verification token has been generated.');
        // Set verification token if returned (for local dev simulation)
        if (result.token) {
          setResetToken(result.token);
        }
        setMode('reset');
      } else {
        setError(result.message || 'Failed to request reset token.');
      }
    } catch (err) {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !resetToken || !newPassword) {
      setError('All fields are required to reset your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email, resetToken, newPassword);
      if (result.success) {
        toast.success('Your password has been updated. Please login.');
        setPassword('');
        setMode('login');
      } else {
        setError(result.message || 'Invalid or expired verification token.');
      }
    } catch (err) {
      setError('Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4">
      {/* Dynamic Glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 glow-blob animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[65%] h-[65%] rounded-full bg-accent/10 glow-blob animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full glass-panel border border-white/10 rounded-3xl p-8 relative z-10 bg-slate-900/60 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent items-center justify-center text-white font-extrabold text-xl mb-4 hover:scale-105 transition-transform shadow-md">
            P
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'reset' && 'Enter New Password'}
          </h1>
          <p className="text-slate-400 font-light text-sm mt-1.5 leading-relaxed">
            {mode === 'login' && 'Sign in to access your custom visitor profile'}
            {mode === 'forgot' && 'We will generate a verification token to update your security credentials'}
            {mode === 'reset' && 'Provide your reset verification token and choose a strong new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 font-medium">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setMode('forgot'); }}
                    className="text-[10px] font-bold text-primary hover:text-primary-light uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 focus:ring-primary text-primary"
                  />
                  Remember Me
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Login'
                )}
              </motion.button>
            </motion.form>
          )}

          {mode === 'forgot' && (
            <motion.form
              key="forgot-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleForgotPasswordSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Registered Email address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setMode('login'); }}
                  className="flex-1 py-3.5 border border-slate-800 text-slate-400 hover:text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                >
                  <FiArrowLeft /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Send Code <FiSend /></>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          {mode === 'reset' && (
            <motion.form
              key="reset-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleResetPasswordSubmit}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Verification Token</label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="Enter Token"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="Choose New Password"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setError(''); setMode('forgot'); }}
                  className="flex-1 py-3.5 border border-slate-800 text-slate-400 hover:text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                >
                  <FiArrowLeft /> Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Reset Password'
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {mode === 'login' && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-1 h-[1px] bg-slate-800"></div>
              <span className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or access with</span>
              <div className="flex-1 h-[1px] bg-slate-800"></div>
            </div>

            {/* Guest entrance */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestClick}
              disabled={loading}
              className="w-full py-3.5 border border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/50 text-slate-350 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all mb-4"
            >
              <FiUser className="text-base text-slate-500" />
              Continue as Guest
            </motion.button>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900/40 text-xs transition-colors">
                <FaGoogle className="text-red-500" /> Google
              </button>
              <button className="py-2.5 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900/40 text-xs transition-colors">
                <FiGithub className="text-white" /> GitHub
              </button>
            </div>

            <div className="text-center border-t border-slate-850 pt-5 text-sm text-slate-400">
              New visitor?{' '}
              <Link to="/register" className="font-bold text-accent hover:text-accent-light transition-colors">
                Create Profile &rarr;
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
