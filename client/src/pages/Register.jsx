import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiGlobe, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [profession, setProfession] = useState('');
  const [company, setCompany] = useState('');
  const [terms, setTerms] = useState(false);

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!terms) {
      setError('You must accept the terms and conditions to proceed.');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name,
        email,
        phone,
        password,
        confirmPassword,
        country,
        profession,
        company
      });

      if (result.success) {
        toast.success(`Welcome to Daniel Paul's Portfolio Platform, ${name}!`);
        navigate('/');
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 py-12">
      {/* Decorative Glow Mesh blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-primary/10 glow-blob animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-accent/10 glow-blob animate-pulse-slow"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full glass-panel border border-white/10 rounded-3xl p-8 relative z-10 bg-slate-900/60 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-accent items-center justify-center text-white font-extrabold text-xl mb-4 hover:scale-105 transition-transform shadow-md">
            P
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Visitor Profile</h1>
          <p className="text-slate-400 font-light text-sm mt-1.5 leading-relaxed">
            Register your profile to enable project bookmarking, resume tracking downloads, and premium developer updates.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2.5 font-medium">
            <FiAlertCircle className="shrink-0 text-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="john@email.com"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Country</label>
              <div className="relative">
                <FiGlobe className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="India"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Profession</label>
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="Software Recruiter"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Company (Optional)</label>
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="Google / Freelancer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950/85 text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 py-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="terms"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-800 bg-slate-950 focus:ring-primary text-primary"
            />
            <label htmlFor="terms" className="text-xs text-slate-400 leading-normal">
              I agree to allow the portfolio to track log visits, message submissions, and download events securely inside the MySQL database.
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary-dark text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Profile'
            )}
          </motion.button>
        </form>

        <div className="text-center border-t border-slate-850 pt-5 text-sm text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-accent hover:text-accent-light transition-colors">
            Login &rarr;
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
