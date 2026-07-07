import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGithub, FiLinkedin, FiInstagram, FiMail, FiDownload, FiBriefcase, 
  FiMessageSquare, FiBookOpen, FiAward, FiMessageCircle, FiSun, FiMoon, 
  FiSearch, FiMenu, FiX, FiCheckCircle, FiExternalLink, FiChevronLeft, FiChevronRight, FiStar, FiImage, FiEye
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../utils/api.js';
import { useTheme } from '../context/ThemeContext.jsx';
import profileImage from '../assets/images/profile.jpg';

const defaultPlaceholder = "https://www.tandfonline.com/cms/asset/b967f2ba-a245-4503-bfdc-681e50dc8a9f/taut_a_2288483_f0006_oc.jpg";

const isPlaceholderImage = (img) => {
  if (!img) return true;
  const normalized = img.trim().toLowerCase();
  return normalized === '' || 
         normalized === '/assets/images/profile.png' || 
         normalized === '/assets/images/profile.jpg' ||
         normalized.includes('profileimage') ||
         normalized.includes('profile.jpg');
};

const ProjectImageModal = ({ src }) => {
  const [error, setError] = useState(false);
  const imageSrc = isPlaceholderImage(src) ? defaultPlaceholder : src;

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/80 text-center select-none">
        <FiImage className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-2" />
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Project Image Available</span>
      </div>
    );
  }
  return (
    <img 
      src={imageSrc} 
      alt="Project Cover"
      onError={() => setError(true)}
      className="w-full h-full object-cover"
    />
  );
};

const ProjectCard = ({ proj, handleProjectCardView, logClickEvent }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageSrc = isPlaceholderImage(proj.image) ? defaultPlaceholder : proj.image;

  return (
    <motion.div
      layout
      onClick={() => handleProjectCardView(proj.id, proj.title)}
      className="glass-panel group rounded-[24px] overflow-hidden flex flex-col h-full border border-white/10 dark:border-slate-800/80 bg-white/5 dark:bg-slate-950/40 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-primary/5 hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="h-[240px] w-full overflow-hidden relative bg-slate-900/50 shrink-0 rounded-t-[24px]">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/80 text-center select-none">
            <FiImage className="w-12 h-12 text-slate-400 dark:text-slate-650 mb-2" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">No Project Image Available</span>
          </div>
        ) : (
          <>
            <img 
              src={imageSrc} 
              alt={proj.title}
              onError={handleImageError}
              loading="lazy"
              className="w-full h-[240px] object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-[24px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          </>
        )}
        
        {/* Category tag on image */}
        <span className="absolute top-4 left-4 px-2.5 py-1 bg-primary/95 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-md">
          {proj.category}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-slate-100 transition-colors group-hover:text-primary dark:group-hover:text-primary-light">
          {proj.title}
        </h3>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-4 line-clamp-3 leading-relaxed">
          {proj.description}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {proj.tags && proj.tags.split(',').map(t => (
            <span key={t} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900/60 rounded-md text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40">
              {t.trim()}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/50 dark:border-slate-900 pt-4 mt-auto">
          <div className="flex flex-wrap gap-2">
            <a 
              href={proj.github_url} 
              target="_blank" 
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                logClickEvent('project_github_click', '1', proj.id.toString(), `GitHub repo: ${proj.title}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 border border-slate-200/50 dark:border-slate-800"
            >
              <FiGithub className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
            <a 
              href={proj.demo_url} 
              target="_blank" 
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                logClickEvent('project_demo_click', '1', proj.id.toString(), `Live demo: ${proj.title}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light dark:hover:text-white dark:bg-primary/10 dark:hover:bg-primary/20 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 border border-primary/20 dark:border-primary/20"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProjectCardView(proj.id, proj.title);
            }}
            className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-primary/10"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const { darkMode, toggleTheme } = useTheme();
  
  // Data State
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Static Assets Status
  const [resumeAvailable, setResumeAvailable] = useState(true);
  const [profileAvailable, setProfileAvailable] = useState(true);
  const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";

  // UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategory, setProjectCategory] = useState('All');
  const [projectSort, setProjectSort] = useState('newest');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Typing animation role state
  const roles = ["React Developer", "Full Stack Developer", "Spring Boot Developer", "AI Enthusiast", "IoT Developer"];
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Recruiter Contact Form State
  const [formData, setFormData] = useState({
    recruiter_name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    rating: 5,
    interview_request: false,
    interview_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Navigation Links
  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Certificates', href: '#certificates' },
    { name: 'Achievements', href: '#achievements' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ];

  // Active section for Navbar
  const [activeSection, setActiveSection] = useState('Home');

  // Scroll Intersection Observer for Navbar Active Link
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const match = navLinks.find(link => link.href === `#${id}`);
          if (match) {
            setActiveSection(match.name);
          }
        }
      });
    }, observerOptions);

    navLinks.forEach(link => {
      const el = document.querySelector(link.href);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [navLinks]);

  // Asset availability checks
  useEffect(() => {
    const verifyAssets = async () => {
      try {
        const resumeRes = await fetch('/resume.pdf', { method: 'HEAD' });
        const contentType = resumeRes.headers.get('content-type') || '';
        if (!resumeRes.ok || contentType.includes('text/html')) {
          setResumeAvailable(false);
        }
      } catch (err) {
        setResumeAvailable(false);
      }

      try {
        const profileRes = await fetch(profileImage, { method: 'HEAD' });
        const contentType = profileRes.headers.get('content-type') || '';
        if (!profileRes.ok || contentType.includes('text/html')) {
          setProfileAvailable(false);
        }
      } catch (err) {
        setProfileAvailable(false);
      }
    };
    verifyAssets();
  }, []);

  // Fetch all profile and portfolio database details on mount
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [profileRes, projRes, skillRes, expRes, eduRes, certRes, achRes, testRes, blogRes] = await Promise.all([
          api.get('/portfolio/profile'),
          api.get('/portfolio/projects'),
          api.get('/portfolio/skills'),
          api.get('/portfolio/experience'),
          api.get('/portfolio/education'),
          api.get('/portfolio/certificates'),
          api.get('/portfolio/achievements'),
          api.get('/portfolio/testimonials'),
          api.get('/portfolio/blogs')
        ]);

        if (profileRes.data.success) setProfile(profileRes.data.profile);
        if (projRes.data.success) setProjects(projRes.data.projects);
        if (skillRes.data.success) setSkills(skillRes.data.skills);
        if (expRes.data.success) setExperience(expRes.data.experience);
        if (eduRes.data.success) setEducation(eduRes.data.education);
        if (certRes.data.success) setCertificates(certRes.data.certificates);
        if (achRes.data.success) setAchievements(achRes.data.achievements);
        if (testRes.data.success) setTestimonials(testRes.data.testimonials);
        if (blogRes.data.success) setBlogs(blogRes.data.blogs.filter(b => b.published));
      } catch (err) {
        console.error('Failed to load portfolio items:', err);
      }
    };
    fetchPortfolioData();
  }, []);

  // Session Logging
  useEffect(() => {
    const logSession = async () => {
      if (sessionStorage.getItem('sess_registered')) return;

      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Determine Device Type
      let device = 'Desktop';
      if (/Mobi|Android|iPhone/i.test(userAgent)) device = 'Mobile';
      else if (/Tablet|iPad/i.test(userAgent)) device = 'Tablet';

      // Parse browser
      let browser = 'Chrome';
      if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
      else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
      else if (userAgent.indexOf('Edg') > -1) browser = 'Edge';

      // Parse OS
      let os = 'Windows';
      if (userAgent.indexOf('Macintosh') > -1) os = 'macOS';
      else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
      else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) os = 'iOS';
      else if (userAgent.indexOf('Android') > -1) os = 'Android';

      // Traffic Source
      let source = 'Direct';
      if (referrer) {
        if (referrer.indexOf('google') > -1) source = 'Google Search';
        else if (referrer.indexOf('linkedin') > -1) source = 'LinkedIn';
        else if (referrer.indexOf('github') > -1) source = 'GitHub';
        else source = 'Referral';
      }

      const session_id = 'sess-' + Math.random().toString(36).substring(2, 11);

      try {
        await api.post('/analytics/session', {
          session_id,
          device,
          os,
          browser,
          traffic_source: source,
          referrer,
          ip: ''
        });
        sessionStorage.setItem('sess_registered', 'true');
        sessionStorage.setItem('session_id', session_id);
      } catch (err) {
        console.warn('Could not register visitor trace:', err.message);
      }
    };

    logSession();
  }, []);

  // Text Typing Loop
  useEffect(() => {
    let timer;
    const activeRole = roles[roleIndex];

    if (!isDeleting) {
      // Typing
      timer = setTimeout(() => {
        setDisplayedText(activeRole.substring(0, displayedText.length + 1));
      }, 100);

      if (displayedText === activeRole) {
        // Wait at end
        timer = setTimeout(() => setIsDeleting(true), 1500);
      }
    } else {
      // Deleting
      timer = setTimeout(() => {
        setDisplayedText(activeRole.substring(0, displayedText.length - 1));
      }, 50);

      if (displayedText === '') {
        setIsDeleting(false);
        setRoleIndex(prev => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex]);

  // Click Event Analytics Logging
  const logClickEvent = async (name, value, targetId = '', info = '') => {
    try {
      await api.post('/analytics/event', {
        metric_name: name,
        metric_value: value,
        target_id: targetId,
        extra_info: info
      });
    } catch (err) {
      // fail silently
    }
  };

  const handleResumeClick = async (e, action) => {
    try {
      // Extract logged-in user profile details for download event logging
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      // Log analytics on success
      if (action === 'download') {
        try {
          await api.post('/resume/download', {
            name: currentUser?.name || 'Guest Visitor',
            email: currentUser?.email || 'N/A',
            country: currentUser?.country || 'India'
          });
        } catch (err) {
          console.warn('Logging resume tracking failed:', err.message);
        }
        logClickEvent('resume_download', '1', '', 'Direct PDF download');
      } else if (action === 'view') {
        logClickEvent('resume_view', '1', '', 'Direct PDF view');
      }
    } catch (err) {
      console.warn('Resume click tracking failed:', err.message);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recruiter_name || !formData.email || !formData.message) {
      toast.error('Please fill in all required contact details.');
      return;
    }
    
    setSubmitting(true);
    try {
      const { data } = await api.post('/messages', formData);
      if (data.success) {
        toast.success('Your message & review has been logged successfully!');
        setFormData({
          recruiter_name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
          rating: 5,
          interview_request: false,
          interview_date: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit contact request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and Sort Projects
  const filteredProjects = projects.filter(p => {
    const searchLower = projectSearch.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                          p.description.toLowerCase().includes(searchLower) ||
                          p.tags.toLowerCase().includes(searchLower);
    const matchesCategory = projectCategory === 'All' || 
                            p.category.toLowerCase().includes(projectCategory.toLowerCase()) || 
                            p.tags.toLowerCase().includes(projectCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (projectSort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (projectSort === 'views') return (b.views || 0) - (a.views || 0);
    return a.title.localeCompare(b.title);
  });

  const categories = ['All', 'React', 'Spring Boot', 'IoT', 'AI', 'Firebase', 'Full Stack'];

  const handleProjectCardView = async (id, title) => {
    // Record view in backend
    try {
      await api.post(`/portfolio/projects/${id}/view`);
    } catch (err) {}

    // Find the project object and set it to open the details modal
    const proj = projects.find(p => p.id === id);
    if (proj) {
      setSelectedProject(proj);
    }
  };

  // Testimonials Carousel Controls
  const prevTestimonial = () => {
    setTestimonialIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };
  const nextTestimonial = () => {
    setTestimonialIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative z-10 overflow-hidden">
      {/* Floating Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 dark:bg-primary/10 glow-blob animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-accent/5 dark:bg-accent/10 glow-blob animate-pulse-slow"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/5 glow-blob animate-spin-slow"></div>
      </div>

      {/* FLOATING NAVIGATION MENU */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1600px] z-50 min-h-[78px] h-[78px] px-[28px] py-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-lg rounded-[20px] transition-all duration-300">
        <div className="flex items-center justify-between h-full w-full">
          {/* LEFT SECTION: Logo */}
          <div className="w-[250px] min-w-[250px] flex items-center justify-start shrink-0 gap-3">
            <a href="#home" className="text-[30px] font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-[0.5px] leading-none select-none">
              DANIEL PAUL S
            </a>
          </div>

          {/* CENTER SECTION: Perfect Center Navigation Links */}
          <div className="hidden min-[992px]:flex items-center justify-evenly flex-1 h-full w-full px-4">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setActiveSection(link.name)}
                className={`relative py-2 text-[14px] min-[1200px]:text-[16px] font-medium leading-[1.4] tracking-[0.3px] whitespace-nowrap transition-all duration-300 hover:-translate-y-[2px] cursor-pointer ${
                  activeSection === link.name 
                    ? 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {link.name}
                {activeSection === link.name && (
                  <>
                    <motion.span 
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(37,99,235,0.7)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                  </>
                )}
              </a>
            ))}
          </div>

          {/* RIGHT SECTION: Dark/Light Mode toggle and hamburger menu alignment */}
          <div className="w-[100px] min-w-[100px] flex items-center justify-end shrink-0 gap-[3px]">
            {/* Dark/Light toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors shrink-0"
              aria-label="Toggle Theme"
            >
              {darkMode ? <FiSun className="text-amber-500" /> : <FiMoon />}
            </button>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="min-[992px]:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 shrink-0"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Slide-out Mobile/Tablet Drawer Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 min-[992px]:hidden"
              />

              {/* Drawer Panel */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-[300px] sm:w-[350px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/50 shadow-2xl p-8 z-50 min-[992px]:hidden flex flex-col justify-between"
              >
                <div>
                  {/* Header inside drawer */}
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                      PORTFOLIO
                    </span>
                    <button 
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  {/* Navigation Links inside drawer */}
                  <div className="flex flex-col gap-4">
                    {navLinks.map(link => (
                      <a 
                        key={link.name} 
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium py-3 px-4 rounded-xl transition-all ${
                          activeSection === link.name 
                            ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold' 
                            : 'text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Footer / Theme toggle inside drawer */}
                <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-900 pt-6">
                  <span className="text-xs text-slate-400">Change Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 flex items-center justify-center"
                  >
                    {darkMode ? <FiSun className="text-amber-500" /> : <FiMoon />}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-28 pb-16 px-6 relative">
        <div className="max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Hero Profile Image */}

            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-primary-light text-xs font-semibold uppercase tracking-wider mb-6 inline-block">
              Available For Opportunities
            </span>

            <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white mb-6 tracking-tight leading-none">
              Hi, I'm <span className="bg-gradient-to-r from-primary via-blue-500 to-accent bg-clip-text text-transparent">DANIEL PAUL S</span>
            </h1>

            {/* Role Typing Animation */}
            <h2 className="text-xl md:text-3xl font-light text-slate-600 dark:text-slate-300 mb-8 min-h-[40px]">
              I am a <span className="font-semibold text-primary dark:text-primary-light typing-cursor">{displayedText}</span>
            </h2>

            <p className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 font-light text-base md:text-lg mb-10 leading-relaxed">
              {profile?.bio || 'I develop responsive websites, scalable web applications, AI-powered solutions, and IoT projects using modern technologies. I enjoy transforming ideas into practical digital products with clean code and exceptional user experiences.'}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {resumeAvailable ? (
                <motion.a
                  href="/resume.pdf"
                  download="Daniel_Paul_S_Resume.pdf"
                  onClick={(e) => handleResumeClick(e, 'download')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-medium shadow-lg shadow-primary/20 dark:shadow-primary/10 cursor-pointer"
                >
                  <FiDownload />
                  Download Resume
                </motion.a>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-850 text-slate-400 dark:text-slate-500 font-medium cursor-not-allowed border border-slate-300 dark:border-slate-800"
                  >
                    <FiDownload />
                    Download Resume
                  </button>
                  <span className="text-[10px] text-red-500 font-bold tracking-wide">Resume is currently unavailable.</span>
                </div>
              )}

              <motion.a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleResumeClick(e, 'view')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium transition-all cursor-pointer"
              >
                <FiExternalLink />
                View Resume
              </motion.a>

              <a href="#projects">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-all"
                >
                  View Projects
                </motion.button>
              </a>

              <a href="#contact">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-primary-dark text-white font-medium shadow-md transition-all"
                >
                  Hire Me
                </motion.button>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center items-center gap-6">
              <a href={profile?.github || 'https://github.com'} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <FiGithub size={24} />
              </a>
              <a href={profile?.linkedin || 'https://linkedin.com'} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                <FiLinkedin size={24} />
              </a>
              {/* <a href={profile?.instagram || 'https://instagram.com'} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
                <FiInstagram size={24} />
              </a> */}
              <a href={`mailto:${profile?.email || 'daniel@danielpaul.dev'}`} className="text-slate-400 hover:text-accent transition-colors">
                <FiMail size={24} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* Left Column Profile Pic */}
          <div className="md:col-span-4 flex justify-center">
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-1 transform hover:rotate-0 transition-transform duration-300">
              <img 
                src={profileAvailable ? profileImage : defaultAvatar} 
                alt="Daniel Paul S avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
          </div>

          {/* Right Column Profile Stats */}
          <div className="md:col-span-8">
            <div className="glass-panel rounded-3xl p-8 border border-white/20 dark:border-slate-900">
              <h3 className="text-2xl font-bold mb-6 text-slate-850 dark:text-slate-200">DANIEL PAUL S</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light mb-6 leading-relaxed">
                I am currently pursuing my Bachelor of Technology in Information Technology at Sri Krishna College of Technology (SKCT), Coimbatore. I enjoy solving real-world problems through software development and intelligent systems. My goal is to become a software engineer who builds scalable applications with meaningful impact.
              </p>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Age</span>
                  <span className="text-base font-semibold">{profile?.age || '21'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Location</span>
                  <span className="text-base font-semibold">{profile?.location || 'Coimbatore, India'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Degree</span>
                  <span className="text-base font-semibold">{profile?.degree || 'B.Tech IT'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider block">Grade</span>
                  <span className="text-base font-semibold">{profile?.cgpa || '7.2'} CGPA</span>
                </div>
              </div>

              {/* Interests Tags */}
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Interests</span>
                <div className="flex flex-wrap gap-2">
                  {(profile?.interests || 'Artificial Intelligence, Web Development, UI/UX, Cloud Computing')
                    .split(',')
                    .map(int => (
                      <span key={int} className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-medium text-slate-500 dark:text-slate-300">
                        {int.trim()}
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS COUNTERS */}
      <section className="py-12 px-6 max-w-5xl mx-auto relative z-10 border-t border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          <div>
            <h4 className="text-4xl font-black text-primary mb-2">3</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projects Completed</span>
          </div>
          <div>
            <h4 className="text-4xl font-black text-accent mb-2">2</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Internships</span>
          </div>
          <div>
            <h4 className="text-4xl font-black text-purple-500 mb-2">7</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Certifications</span>
          </div>
          <div>
            <h4 className="text-4xl font-black text-green-500 mb-2">15+</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Technologies</span>
          </div>
          <div>
            <h4 className="text-4xl font-black text-amber-500 mb-2">1</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hackathons</span>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section id="skills" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">Technical Skills</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Group by category */}
        {(() => {
          const preferredOrder = ['Programming Languages', 'Frontend', 'Backend', 'Database', 'Tools', 'Concepts'];
          const existingCats = Array.from(new Set(skills.map(s => s.category.trim())));
          
          const sortedCats = existingCats.sort((a, b) => {
            const indexA = preferredOrder.findIndex(p => p.toLowerCase() === a.toLowerCase());
            const indexB = preferredOrder.findIndex(p => p.toLowerCase() === b.toLowerCase());
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          
          return sortedCats.map(cat => {
            const catSkills = skills.filter(s => s.category.trim().toLowerCase() === cat.trim().toLowerCase());
            if (catSkills.length === 0) return null;
            
            return (
              <div key={cat} className="mb-10">
              <h3 className="text-xl font-bold mb-6 text-slate-400 border-b border-slate-200/50 dark:border-slate-900 pb-2">{cat}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catSkills.map(skill => (
                  <div key={skill.id} className="glass-panel rounded-2xl p-5 border border-white/20 dark:border-slate-900 flex items-center justify-between">
                    <div className="flex-1 pr-6">
                      <span className="text-sm font-semibold block mb-1">{skill.name}</span>
                      {/* Animated Progress Bar Container */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000"
                          style={{ width: `${skill.proficiency}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500">{skill.proficiency}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        });
      })()}
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">My Projects</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-slate-100 text-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setProjectCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  projectCategory === cat 
                    ? 'bg-primary text-white' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProjects.map(proj => (
            <ProjectCard 
              key={proj.id} 
              proj={proj} 
              handleProjectCardView={handleProjectCardView} 
              logClickEvent={logClickEvent} 
            />
          ))}
        </div>
      </section>

      {/* CAREER TIMELINE */}
      <section id="timeline" className="py-24 px-6 max-w-4xl mx-auto relative z-10 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">Career Timeline</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="relative border-l-2 border-primary/30 dark:border-primary/20 pl-8 ml-4 space-y-10">
          {[
            { year: '2026', title: 'Joined Grevya Technologies & Started practicing AI/ML workflows and software development practices' },
            { year: '2025', title: 'Software Development Internship, Built ERP & CRM on Jewellery Management System using React.js and SQL' },
            { year: '2024', title: 'Core Organizer - Avantaa' },
            { year: '2023', title: 'Started B.Tech Information Technology' }
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
              <h3 className="text-xl font-bold text-primary mb-1">{item.year}</h3>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE TIMELINE */}
      <section id="experience" className="py-24 px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Work Experience</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-8 ml-4 space-y-12">
          {experience.map(exp => (
            <div key={exp.id} className="relative">
              {/* Timeline circle */}
              <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-slate-100 border border-slate-300 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-primary dark:text-primary-light">
                <FiBriefcase size={14} />
              </div>

              <div className="glass-panel rounded-2xl p-6 border border-white/20 dark:border-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">{exp.role}</h3>
                    <span className="text-sm font-semibold text-primary dark:text-primary-light">{exp.company}</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg text-slate-500 font-medium">
                    {exp.start_date} - {exp.end_date}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-2">{exp.location}</p>
                <p className="text-sm text-slate-600 dark:text-slate-350 font-light leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION TIMELINE */}
      <section id="education" className="py-24 px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">Education Details</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-8 ml-4 space-y-12">
          {education.map(edu => (
            <div key={edu.id} className="relative">
              <div className="absolute -left-12 top-1.5 w-8 h-8 rounded-full bg-slate-100 border border-slate-300 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-center text-accent dark:text-accent-light">
                <FiBookOpen size={14} />
              </div>

              <div className="glass-panel rounded-2xl p-6 border border-white/20 dark:border-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">{edu.degree}</h3>
                    <span className="text-sm font-semibold text-accent dark:text-accent-light">{edu.institution}</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded-lg text-slate-500 font-medium">
                    {edu.start_date} - {edu.end_date}
                  </span>
                </div>
                {edu.field && <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-2">Field: {edu.field}</p>}
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Grade: {edu.grade}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATES SECTION */}
      <section id="certificates" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="glass-panel rounded-2xl p-6 border border-white/20 dark:border-slate-900 hover-card-trigger">
              <span className="text-[10px] font-bold text-primary tracking-widest block mb-2">{cert.issuer}</span>
              <h3 className="text-base font-bold mb-3 line-clamp-1">{cert.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-light">Issued: {cert.issue_date}</p>
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] text-slate-400">ID: {cert.credential_id}</span>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={cert.verification_url || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => logClickEvent('certificate_view', '1', cert.id.toString(), cert.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light text-[10px] font-bold transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <FiEye size={12} className="shrink-0" />
                    <span>View Certificate</span>
                  </a>
                  <a 
                    href={cert.verification_url || '#'} 
                    download={`${cert.title.replace(/\s+/g, '_')}_Certificate.pdf`}
                    onClick={() => logClickEvent('certificate_download', '1', cert.id.toString(), cert.title)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 dark:border-slate-800"
                  >
                    <FiDownload size={12} className="shrink-0" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section id="achievements" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Achievements</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.map(ach => (
            <div key={ach.id} className="glass-panel rounded-2xl p-6 border border-white/20 dark:border-slate-900 flex gap-4 hover-card-trigger">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl h-fit">
                <FiAward size={24} />
              </div>
              <div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-md uppercase tracking-wider mb-2 inline-block">
                  {ach.type}
                </span>
                <h3 className="text-base font-bold mb-2">{ach.title}</h3>
                <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                  <span>{ach.organization}</span>
                  <span>&bull;</span>
                  <span>{ach.date}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                  {ach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 px-6 bg-slate-100/50 dark:bg-slate-950/40 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">Recruiter Feedback</h2>
              <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
            </div>

            <div className="relative glass-panel rounded-3xl p-8 md:p-12 border border-white/30 dark:border-slate-900">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-4 border-primary/20">
                  <img 
                    src={testimonials[testimonialIndex].image || defaultAvatar} 
                    alt="Reviewer avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                </div>
                <p className="text-lg md:text-xl font-light italic leading-relaxed text-slate-700 dark:text-slate-350 mb-8 max-w-2xl">
                  "{testimonials[testimonialIndex].feedback}"
                </p>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{testimonials[testimonialIndex].client_name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light mt-1">
                    {testimonials[testimonialIndex].position} at <span className="font-semibold text-primary">{testimonials[testimonialIndex].company}</span>
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 md:-left-6">
                <button onClick={prevTestimonial} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <FiChevronLeft />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4 md:-right-6">
                <button onClick={nextTestimonial} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BLOGS SUBSECTION */}
      {blogs.length > 0 && (
        <section id="blogs" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16 flex flex-col items-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Articles</h2>
            <div className="w-16 h-1.5 bg-primary rounded-full mb-6"></div>
            <Link to="/blogs" className="text-sm font-semibold text-primary dark:text-primary-light hover:underline flex items-center gap-1.5">
              Browse All Tech Articles <FiChevronRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.slice(0, 2).map(blog => (
              <div key={blog.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col h-full border border-white/20 dark:border-slate-900 hover-card-trigger">
                <div className="h-44 overflow-hidden">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-widest block mb-2">{blog.read_time}</span>
                  <h3 className="text-lg font-bold mb-3 hover:text-primary transition-colors line-clamp-1">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light mb-4 line-clamp-2 leading-relaxed">
                    {blog.summary}
                  </p>
                  <Link to={`/blogs/${blog.slug}`} className="text-xs font-semibold text-primary dark:text-primary-light hover:underline mt-auto">
                    Read Article &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT SECTION WITH RATING & INTERVIEW SCHEDULER */}
      <section id="contact" className="py-24 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans">Contact & Feedback</h2>
          <div className="w-16 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column Information */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6">Let's build together</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light mb-8 leading-relaxed">
                If you are a recruiter, tech lead, or fellow developer, feel free to drop a rating, schedule a calendar interview session, or submit generic suggestions.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <FiMail />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Email</span>
                    <a href={`mailto:${profile?.email || 'daniel@danielpaul.dev'}`} className="font-semibold text-sm hover:underline">
                      {profile?.email || 'daniel@danielpaul.dev'}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Work Availability</span>
                    <span className="font-semibold text-sm">Full-Time / Freelance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map placeholder */}
            <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 mt-8 flex items-center justify-center text-center p-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location Map</p>
                <p className="text-sm font-semibold">Coimbatore, Tamil Nadu, India</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-light">Latitude: 11.0168° N | Longitude: 76.9558° E</p>
              </div>
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 border border-white/20 dark:border-slate-900 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.recruiter_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, recruiter_name: e.target.value }))}
                    className="input-premium text-sm"
                    placeholder="Enter name"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-premium text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Company</label>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="input-premium text-sm"
                    placeholder="e.g. Stripe, Linear"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="input-premium text-sm"
                    placeholder="Interview Request, Project Offer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Message *</label>
                <textarea 
                  rows={4} 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-premium text-sm resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              {/* Star Rating selector */}
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">Rate my Portfolio</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform"
                    >
                      <FiStar 
                        size={22} 
                        className={star <= formData.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 dark:text-slate-700'} 
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 ml-2 font-medium">({formData.rating} Stars selected)</span>
                </div>
              </div>

              {/* Calendar Interview Scheduler Toggle */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input 
                    type="checkbox"
                    checked={formData.interview_request}
                    onChange={(e) => setFormData(prev => ({ ...prev, interview_request: e.target.checked }))}
                    className="w-4.5 h-4.5 accent-primary cursor-pointer rounded"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-350">Request Interview & Schedule Calendar</span>
                </label>

                {formData.interview_request && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Proposed Interview Date & Time</label>
                    <input 
                      type="datetime-local"
                      value={formData.interview_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, interview_date: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-semibold text-sm transition-colors shadow-lg shadow-primary/20 dark:shadow-primary/10 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending message...
                  </>
                ) : (
                  <>
                    <FiMessageSquare />
                    Send Message & Book Session
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/50 dark:border-slate-900 py-12 px-6 relative z-10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-black text-slate-800 dark:text-white block mb-1">Daniel Paul</span>
            <span className="text-xs text-slate-400 font-light">Full Stack Engineer &amp; AI Enthusiast</span>
          </div>

          <div className="flex gap-6 text-sm text-slate-400 dark:text-slate-500">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
            <Link to="/blogs" className="hover:text-primary transition-colors">Blogs</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Visitor Login</Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} Daniel Paul. Crafted with React, Tailwind, and Node.js.
          </p>
        </div>
      </footer>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/40 hover:bg-slate-950/60 text-white backdrop-blur-sm transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Modal Image Header */}
              <div className="h-64 md:h-80 w-full relative bg-slate-950 shrink-0">
                <ProjectImageModal src={selectedProject.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {selectedProject.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {selectedProject.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3">Project Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags && selectedProject.tags.split(',').map(t => (
                      <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-4">
                    <a 
                      href={selectedProject.github_url} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={() => logClickEvent('project_github_click', '1', selectedProject.id.toString(), `GitHub repo (modal): ${selectedProject.title}`)}
                      className="inline-flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl transition-all border border-slate-200 dark:border-slate-800"
                    >
                      <FiGithub className="w-4 h-4" />
                      View Repository
                    </a>
                    <a 
                      href={selectedProject.demo_url} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={() => logClickEvent('project_demo_click', '1', selectedProject.id.toString(), `Live demo (modal): ${selectedProject.title}`)}
                      className="inline-flex items-center gap-2 text-sm bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 font-medium"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
