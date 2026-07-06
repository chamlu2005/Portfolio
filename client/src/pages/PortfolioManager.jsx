import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiBriefcase, FiBookOpen, FiDatabase, FiAward, FiMessageSquare, 
  FiPlus, FiEdit, FiTrash, FiSave, FiUpload, FiCheckCircle, FiTrash2
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';
import profileImage from '../assets/images/profile.jpg';

const PortfolioManager = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Database lists
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Modal / Editing states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // project, skill, experience, education, certificate, achievement, testimonial
  const [editItem, setEditItem] = useState(null); // holds item being edited, or null for new
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form states matching schemas
  const [projForm, setProjForm] = useState({ title: '', description: '', image: '', github_url: '', demo_url: '', tags: '', category: 'Full Stack' });
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', proficiency: 80, icon: '' });
  const [expForm, setExpForm] = useState({ company: '', role: '', location: '', start_date: '', end_date: '', description: '', current: false });
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field: '', start_date: '', end_date: '', grade: '' });
  const [certForm, setCertForm] = useState({ title: '', issuer: '', issue_date: '', verification_url: '', credential_id: '' });
  const [achForm, setAchForm] = useState({ title: '', organization: '', date: '', description: '', type: 'Hackathon' });
  const [testForm, setTestForm] = useState({ client_name: '', position: '', company: '', feedback: '', rating: 5, image: '' });

  // Load active lists
  const loadActiveLists = async () => {
    setLoading(true);
    try {
      const [profRes, projRes, skillRes, expRes, eduRes, certRes, achRes, testRes] = await Promise.all([
        api.get('/portfolio/profile'),
        api.get('/portfolio/projects'),
        api.get('/portfolio/skills'),
        api.get('/portfolio/experience'),
        api.get('/portfolio/education'),
        api.get('/portfolio/certificates'),
        api.get('/portfolio/achievements'),
        api.get('/portfolio/testimonials')
      ]);

      if (profRes.data.success) setProfile(profRes.data.profile || {});
      if (projRes.data.success) setProjects(projRes.data.projects);
      if (skillRes.data.success) setSkills(skillRes.data.skills);
      if (expRes.data.success) setExperience(expRes.data.experience);
      if (eduRes.data.success) setEducation(eduRes.data.education);
      if (certRes.data.success) setCertificates(certRes.data.certificates);
      if (achRes.data.success) setAchievements(achRes.data.achievements);
      if (testRes.data.success) setTestimonials(testRes.data.testimonials);
    } catch (err) {
      toast.error('Failed to load portfolio dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveLists();
  }, []);

  // --- CRUD ACTIONS ---

  // Profile update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/portfolio/profile', profile);
      if (data.success) {
        toast.success('Profile details saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save profile changes.');
    }
  };

  // Profile/Resume Upload triggers
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type === 'resume' ? 'resume' : 'file', file);
    formData.append('type', type);

    setUploadingFile(true);
    try {
      const uploadUrl = type === 'resume' ? '/portfolio/upload/resume' : '/portfolio/upload';
      const { data } = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success(`${type} uploaded successfully!`);
        if (type === 'resume') {
          setProfile(prev => ({ ...prev, resume_url: data.fileUrl }));
        } else if (type === 'avatar') {
          setProfile(prev => ({ ...prev, avatar_url: data.fileUrl }));
        } else if (type === 'project') {
          setProjForm(prev => ({ ...prev, image: data.fileUrl }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploadingFile(false);
    }
  };

  // Generic Open Modal helper
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);

    // Initialize forms
    if (type === 'project') {
      setProjForm(item ? { ...item } : { title: '', description: '', image: '', github_url: '', demo_url: '', tags: '', category: 'Full Stack' });
    } else if (type === 'skill') {
      setSkillForm(item ? { ...item } : { name: '', category: 'Frontend', proficiency: 80, icon: '' });
    } else if (type === 'experience') {
      setExpForm(item ? { ...item, current: !!item.current } : { company: '', role: '', location: '', start_date: '', end_date: '', description: '', current: false });
    } else if (type === 'education') {
      setEduForm(item ? { ...item } : { institution: '', degree: '', field: '', start_date: '', end_date: '', grade: '' });
    } else if (type === 'certificate') {
      setCertForm(item ? { ...item } : { title: '', issuer: '', issue_date: '', verification_url: '', credential_id: '' });
    } else if (type === 'achievement') {
      setAchForm(item ? { ...item } : { title: '', organization: '', date: '', description: '', type: 'Hackathon' });
    } else if (type === 'testimonial') {
      setTestForm(item ? { ...item } : { client_name: '', position: '', company: '', feedback: '', rating: 5, image: '' });
    }

    setModalOpen(true);
  };

  // Submit Modal details
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    let url = `/portfolio/${modalType}s`;
    let method = editItem ? 'put' : 'post';
    if (editItem) url += `/${editItem.id}`;

    let body = {};
    if (modalType === 'project') body = projForm;
    else if (modalType === 'skill') body = skillForm;
    else if (modalType === 'experience') body = expForm;
    else if (modalType === 'education') body = eduForm;
    else if (modalType === 'certificate') body = certForm;
    else if (modalType === 'achievement') body = achForm;
    else if (modalType === 'testimonial') body = testForm;

    try {
      const { data } = await api[method](url, body);
      if (data.success) {
        toast.success(`${modalType} logged successfully!`);
        setModalOpen(false);
        loadActiveLists();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Database transaction failed.');
    }
  };

  // Delete Action
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const { data } = await api.delete(`/portfolio/${type}s/${id}`);
      if (data.success) {
        toast.success(`Removed ${type} successfully.`);
        loadActiveLists();
      }
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
          {[
            { id: 'profile', name: 'Profile Editor', icon: <FiUser /> },
            { id: 'projects', name: 'Projects', icon: <FiDatabase /> },
            { id: 'skills', name: 'Skills', icon: <FiAward /> },
            { id: 'experience', name: 'Experience', icon: <FiBriefcase /> },
            { id: 'education', name: 'Education', icon: <FiBookOpen /> },
            { id: 'certificates', name: 'Certificates', icon: <FiCheckCircle /> },
            { id: 'achievements', name: 'Achievements', icon: <FiPlus /> },
            { id: 'testimonials', name: 'Testimonials', icon: <FiMessageSquare /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* LOADING CHECK */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="mt-4">
            
            {/* TABS 1: PROFILE EDITOR */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 max-w-3xl">
                <h2 className="text-lg font-bold">Daniel Paul Profile Summary</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name || ''} 
                      onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Title Role Summary</label>
                    <input 
                      type="text" 
                      value={profile.role_summary || ''} 
                      onChange={e => setProfile(prev => ({ ...prev, role_summary: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Age</label>
                    <input 
                      type="number" 
                      value={profile.age || 22} 
                      onChange={e => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                      className="input-premium text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Location</label>
                    <input 
                      type="text" 
                      value={profile.location || ''} 
                      onChange={e => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">CGPA</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={profile.cgpa || 7.2} 
                      onChange={e => setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) }))}
                      className="input-premium text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Languages (Comma separated)</label>
                    <input 
                      type="text" 
                      value={profile.languages || ''} 
                      onChange={e => setProfile(prev => ({ ...prev, languages: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">Interests (Comma separated)</label>
                    <input 
                      type="text" 
                      value={profile.interests || ''} 
                      onChange={e => setProfile(prev => ({ ...prev, interests: e.target.value }))}
                      className="input-premium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">Profile Bio</label>
                  <textarea 
                    rows={4} 
                    value={profile.bio || ''} 
                    onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="input-premium text-sm resize-none"
                  />
                </div>

                {/* Upload Avatars / Resume files */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Avatar Upload */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-3">Avatar Image Profile</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-950">
                        <img 
                          src={profile.avatar_url || profileImage} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
                          }}
                        />
                      </div>
                      <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs rounded-xl font-bold cursor-pointer inline-flex items-center gap-2 transition-colors">
                        <FiUpload /> Upload Image
                        <input type="file" onChange={e => handleFileUpload(e, 'avatar')} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-3">Main Resume File</label>
                    <div className="flex flex-col gap-2">
                      <label className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs rounded-xl font-bold cursor-pointer inline-flex items-center justify-center gap-2 transition-colors border border-dashed border-slate-300 dark:border-slate-700">
                        <FiUpload /> Upload Resume (PDF)
                        <input type="file" onChange={e => handleFileUpload(e, 'resume')} className="hidden" accept=".pdf,.doc,.docx" />
                      </label>
                      {profile.resume_url && (
                        <span className="text-[10px] text-slate-400 truncate">Current: {profile.resume_url}</span>
                      )}
                    </div>
                  </div>

                </div>

                <div className="border-t border-slate-150 dark:border-slate-800 pt-6">
                  <button type="submit" className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-primary-dark transition-colors">
                    <FiSave /> Save Profile details
                  </button>
                </div>
              </form>
            )}

            {/* TAB-2: DATA GRIDS (CRUD for arrays: Projects, Skills, Exp, Edu, Cert, Ach, Testimonials) */}
            {activeTab !== 'profile' && (
              <div className="space-y-6">
                
                {/* Header Action Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold capitalize">{activeTab} Database</h2>
                  <button 
                    onClick={() => openModal(activeTab.slice(0, -1))}
                    className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold flex items-center gap-2 hover:scale-103 transition-transform"
                  >
                    <FiPlus /> Add new item
                  </button>
                </div>

                {/* Table Layout */}
                <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 font-bold uppercase border-b border-slate-200/50 dark:border-slate-800">
                        {activeTab === 'projects' && (
                          <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Tags</th>
                            <th className="p-4">Views</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'skills' && (
                          <tr>
                            <th className="p-4">Skill Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Proficiency</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'experience' && (
                          <tr>
                            <th className="p-4">Company</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'education' && (
                          <tr>
                            <th className="p-4">Institution</th>
                            <th className="p-4">Degree</th>
                            <th className="p-4">Grade</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'certificates' && (
                          <tr>
                            <th className="p-4">Certificate Name</th>
                            <th className="p-4">Issuer</th>
                            <th className="p-4">Credential ID</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'achievements' && (
                          <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Organization</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'testimonials' && (
                          <tr>
                            <th className="p-4">Client Name</th>
                            <th className="p-4">Company</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        )}
                      </thead>

                      <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                        {activeTab === 'projects' && projects.map(proj => (
                          <tr key={proj.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{proj.title}</td>
                            <td className="p-4">{proj.category}</td>
                            <td className="p-4 truncate max-w-[150px]">{proj.tags}</td>
                            <td className="p-4">{proj.views || 0} views</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('project', proj)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('project', proj.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'skills' && skills.map(skill => (
                          <tr key={skill.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{skill.name}</td>
                            <td className="p-4">{skill.category}</td>
                            <td className="p-4 font-semibold">{skill.proficiency}%</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('skill', skill)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('skill', skill.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'experience' && experience.map(exp => (
                          <tr key={exp.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{exp.company}</td>
                            <td className="p-4 font-semibold">{exp.role}</td>
                            <td className="p-4">{exp.start_date} - {exp.end_date}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('experience', exp)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('experience', exp.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'education' && education.map(edu => (
                          <tr key={edu.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{edu.institution}</td>
                            <td className="p-4 font-semibold">{edu.degree}</td>
                            <td className="p-4">{edu.grade}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('education', edu)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('education', edu.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'certificates' && certificates.map(cert => (
                          <tr key={cert.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{cert.title}</td>
                            <td className="p-4 font-semibold">{cert.issuer}</td>
                            <td className="p-4">{cert.credential_id}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('certificate', cert)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('certificate', cert.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'achievements' && achievements.map(ach => (
                          <tr key={ach.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{ach.title}</td>
                            <td className="p-4">{ach.organization}</td>
                            <td className="p-4">{ach.type}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('achievement', ach)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('achievement', ach.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'testimonials' && testimonials.map(test => (
                          <tr key={test.id} className="hover:bg-slate-100/10 transition-colors">
                            <td className="p-4 font-bold">{test.client_name}</td>
                            <td className="p-4 font-semibold">{test.company}</td>
                            <td className="p-4 font-semibold">{test.rating}/5 ⭐</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openModal('testimonial', test)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:text-primary"><FiEdit /></button>
                              <button onClick={() => handleDeleteItem('testimonial', test.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg"><FiTrash2 /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* DETAILED CRUD MODALS POPUP */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full glass-panel border border-white/20 dark:border-slate-800 rounded-3xl p-6 md:p-8 relative z-55 my-8"
            >
              <h2 className="text-lg font-bold mb-6 capitalize">{editItem ? 'Edit' : 'Add new'} {modalType}</h2>
              
              <form onSubmit={handleModalSubmit} className="space-y-4">
                
                {/* 1. Project Form */}
                {modalType === 'project' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                      <input type="text" required value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
                      <textarea rows={3} required value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} className="input-premium text-xs resize-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Project Screenshot Image</label>
                      <div className="flex gap-2">
                        <input type="text" value={projForm.image} onChange={e => setProjForm({...projForm, image: e.target.value})} className="input-premium text-xs flex-1" placeholder="URL or path" />
                        <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs flex items-center justify-center cursor-pointer"><FiUpload /><input type="file" onChange={e => handleFileUpload(e, 'project')} className="hidden" /></label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">GitHub Repo</label>
                        <input type="text" value={projForm.github_url} onChange={e => setProjForm({...projForm, github_url: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Live Demo</label>
                        <input type="text" value={projForm.demo_url} onChange={e => setProjForm({...projForm, demo_url: e.target.value})} className="input-premium text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tags (Comma Sep)</label>
                        <input type="text" value={projForm.tags} onChange={e => setProjForm({...projForm, tags: e.target.value})} className="input-premium text-xs" placeholder="React, Node" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                        <select value={projForm.category} onChange={e => setProjForm({...projForm, category: e.target.value})} className="input-premium text-xs bg-white dark:bg-slate-900">
                          <option>Full Stack</option>
                          <option>Frontend</option>
                          <option>Backend</option>
                          <option>Enterprise</option>
                          <option>Machine Learning</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. Skill Form */}
                {modalType === 'skill' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Skill Name</label>
                      <input type="text" required value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Category</label>
                        <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} className="input-premium text-xs bg-white dark:bg-slate-900">
                          <option>Frontend</option>
                          <option>Backend</option>
                          <option>Database</option>
                          <option>Tools</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proficiency %</label>
                        <input type="number" min="0" max="100" required value={skillForm.proficiency} onChange={e => setSkillForm({...skillForm, proficiency: parseInt(e.target.value)})} className="input-premium text-xs" />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. Experience Form */}
                {modalType === 'experience' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Company</label>
                      <input type="text" required value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role Title</label>
                      <input type="text" required value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Start Date</label>
                        <input type="text" placeholder="May 2025" value={expForm.start_date} onChange={e => setExpForm({...expForm, start_date: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">End Date</label>
                        <input type="text" placeholder="Present" value={expForm.end_date} onChange={e => setExpForm({...expForm, end_date: e.target.value})} className="input-premium text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description Details</label>
                      <textarea rows={3} value={expForm.description} onChange={e => setExpForm({...expForm, description: e.target.value})} className="input-premium text-xs resize-none" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input type="checkbox" checked={expForm.current} onChange={e => setExpForm({...expForm, current: e.target.checked})} className="accent-primary" />
                      <span className="text-xs text-slate-500 font-semibold">Active/Current Position</span>
                    </label>
                  </>
                )}

                {/* 4. Education Form */}
                {modalType === 'education' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Institution</label>
                      <input type="text" required value={eduForm.institution} onChange={e => setSelf => setEduForm({...eduForm, institution: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Degree</label>
                        <input type="text" required value={eduForm.degree} onChange={e => setEduForm({...eduForm, degree: e.target.value})} className="input-premium text-xs" placeholder="B.Tech" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Field</label>
                        <input type="text" value={eduForm.field} onChange={e => setEduForm({...eduForm, field: e.target.value})} className="input-premium text-xs" placeholder="Information Technology" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Start Year</label>-
                        <input type="text" value={eduForm.start_date} onChange={e => setEduForm({...eduForm, start_date: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">End Year</label>
                        <input type="text" value={eduForm.end_date} onChange={e => setEduForm({...eduForm, end_date: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Grade</label>
                        <input type="text" value={eduForm.grade} onChange={e => setEduForm({...eduForm, grade: e.target.value})} className="input-premium text-xs" placeholder="6.7 CGPA" />
                      </div>
                    </div>
                  </>
                )}

                {/* 5. Certificates Form */}
                {modalType === 'certificate' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title Name</label>
                      <input type="text" required value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Issuer Organization</label>
                      <input type="text" required value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Issue Date</label>
                        <input type="text" value={certForm.issue_date} onChange={e => setCertForm({...certForm, issue_date: e.target.value})} className="input-premium text-xs" placeholder="Aug 2025" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Credential ID</label>
                        <input type="text" value={certForm.credential_id} onChange={e => setCertForm({...certForm, credential_id: e.target.value})} className="input-premium text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Verification URL Link</label>
                      <input type="text" value={certForm.verification_url} onChange={e => setCertForm({...certForm, verification_url: e.target.value})} className="input-premium text-xs" />
                    </div>
                  </>
                )}

                {/* 6. Achievements Form */}
                {modalType === 'achievement' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                      <input type="text" required value={achForm.title} onChange={e => setAchForm({...achForm, title: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Organization</label>
                        <input type="text" value={achForm.organization} onChange={e => setAchForm({...achForm, organization: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Date</label>
                        <input type="text" value={achForm.date} onChange={e => setAchForm({...achForm, date: e.target.value})} className="input-premium text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type Classification</label>
                      <select value={achForm.type} onChange={e => setAchForm({...achForm, type: e.target.value})} className="input-premium text-xs bg-white dark:bg-slate-900">
                        <option>Hackathon</option>
                        <option>Coding Competition</option>
                        <option>Award</option>
                        <option>College Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description Details</label>
                      <textarea rows={3} value={achForm.description} onChange={e => setAchForm({...achForm, description: e.target.value})} className="input-premium text-xs resize-none" />
                    </div>
                  </>
                )}

                {/* 7. Testimonials Form */}
                {modalType === 'testimonial' && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Client / Reviewer Name</label>
                      <input type="text" required value={testForm.client_name} onChange={e => setTestForm({...testForm, client_name: e.target.value})} className="input-premium text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Company</label>
                        <input type="text" value={testForm.company} onChange={e => setTestForm({...testForm, company: e.target.value})} className="input-premium text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Position</label>
                        <input type="text" value={testForm.position} onChange={e => setTestForm({...testForm, position: e.target.value})} className="input-premium text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Review Feedback Content</label>
                      <textarea rows={3} required value={testForm.feedback} onChange={e => setTestForm({...testForm, feedback: e.target.value})} className="input-premium text-xs resize-none" />
                    </div>
                  </>
                )}

                {/* Modal CTA buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold flex items-center gap-1 shadow-md hover:bg-primary-dark transition-colors"
                  >
                    <FiSave /> Save Data
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default PortfolioManager;
