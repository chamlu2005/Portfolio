import databaseService from '../services/databaseService.js';

// --- Helper response handlers ---
const handleGetList = async (serviceMethod, req, res, name) => {
  try {
    const list = await serviceMethod();
    res.json({ success: true, count: list.length, [name]: list });
  } catch (err) {
    console.error(`Error fetching ${name}:`, err);
    res.status(500).json({ success: false, message: `Failed to fetch ${name}.` });
  }
};

const handleCreate = async (serviceMethod, req, res, name) => {
  try {
    const newItem = await serviceMethod(req.body);
    await databaseService.createNotification(`Added new item in ${name}: ${req.body.title || req.body.name || 'Untitled'}`, 'content');
    res.status(201).json({ success: true, message: `${name} created successfully.`, data: newItem });
  } catch (err) {
    console.error(`Error creating ${name}:`, err);
    res.status(500).json({ success: false, message: `Failed to create ${name}.` });
  }
};

const handleUpdate = async (serviceMethod, req, res, name) => {
  const { id } = req.params;
  try {
    const updatedItem = await serviceMethod(id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ success: false, message: `${name} item not found.` });
    }
    res.json({ success: true, message: `${name} updated successfully.`, data: updatedItem });
  } catch (err) {
    console.error(`Error updating ${name}:`, err);
    res.status(500).json({ success: false, message: `Failed to update ${name}.` });
  }
};

const handleDelete = async (serviceMethod, req, res, name) => {
  const { id } = req.params;
  try {
    await serviceMethod(id);
    await databaseService.createNotification(`Deleted item from ${name} (ID: ${id})`, 'content');
    res.json({ success: true, message: `${name} deleted successfully.` });
  } catch (err) {
    console.error(`Error deleting ${name}:`, err);
    res.status(500).json({ success: false, message: `Failed to delete ${name}.` });
  }
};

// --- Profile ---
export const getProfile = async (req, res) => {
  try {
    const profile = await databaseService.getProfile();
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile details.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await databaseService.updateProfile(req.body);
    await databaseService.createNotification('Profile details updated', 'system');
    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

// --- Projects ---
export const getProjects = (req, res) => handleGetList(databaseService.getProjects.bind(databaseService), req, res, 'projects');
export const createProject = (req, res) => handleCreate(databaseService.createProject.bind(databaseService), req, res, 'project');
export const updateProject = (req, res) => handleUpdate(databaseService.updateProject.bind(databaseService), req, res, 'project');
export const deleteProject = (req, res) => handleDelete(databaseService.deleteProject.bind(databaseService), req, res, 'project');

export const incrementProjectViews = async (req, res) => {
  const { id } = req.params;
  try {
    await databaseService.incrementProjectViews(id);
    // Log view analytic event
    await databaseService.logEvent('project_view', '1', id, `Project ID: ${id} viewed`);
    res.json({ success: true, message: 'Views incremented.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Skills ---
export const getSkills = (req, res) => handleGetList(databaseService.getSkills.bind(databaseService), req, res, 'skills');
export const createSkill = (req, res) => handleCreate(databaseService.createSkill.bind(databaseService), req, res, 'skill');
export const updateSkill = (req, res) => handleUpdate(databaseService.updateSkill.bind(databaseService), req, res, 'skill');
export const deleteSkill = (req, res) => handleDelete(databaseService.deleteSkill.bind(databaseService), req, res, 'skill');

// --- Experience ---
export const getExperiences = (req, res) => handleGetList(databaseService.getExperiences.bind(databaseService), req, res, 'experience');
export const createExperience = (req, res) => handleCreate(databaseService.createExperience.bind(databaseService), req, res, 'experience');
export const updateExperience = (req, res) => handleUpdate(databaseService.updateExperience.bind(databaseService), req, res, 'experience');
export const deleteExperience = (req, res) => handleDelete(databaseService.deleteExperience.bind(databaseService), req, res, 'experience');

// --- Education ---
export const getEducation = (req, res) => handleGetList(databaseService.getEducation.bind(databaseService), req, res, 'education');
export const createEducation = (req, res) => handleCreate(databaseService.createEducation.bind(databaseService), req, res, 'education');
export const updateEducation = (req, res) => handleUpdate(databaseService.updateEducation.bind(databaseService), req, res, 'education');
export const deleteEducation = (req, res) => handleDelete(databaseService.deleteEducation.bind(databaseService), req, res, 'education');

// --- Certificates ---
export const getCertificates = (req, res) => handleGetList(databaseService.getCertificates.bind(databaseService), req, res, 'certificates');
export const createCertificate = (req, res) => handleCreate(databaseService.createCertificate.bind(databaseService), req, res, 'certificate');
export const updateCertificate = (req, res) => handleUpdate(databaseService.updateCertificate.bind(databaseService), req, res, 'certificate');
export const deleteCertificate = (req, res) => handleDelete(databaseService.deleteCertificate.bind(databaseService), req, res, 'certificate');

// --- Achievements ---
export const getAchievements = (req, res) => handleGetList(databaseService.getAchievements.bind(databaseService), req, res, 'achievements');
export const createAchievement = (req, res) => handleCreate(databaseService.createAchievement.bind(databaseService), req, res, 'achievement');
export const updateAchievement = (req, res) => handleUpdate(databaseService.updateAchievement.bind(databaseService), req, res, 'achievement');
export const deleteAchievement = (req, res) => handleDelete(databaseService.deleteAchievement.bind(databaseService), req, res, 'achievement');

// --- Testimonials ---
export const getTestimonials = (req, res) => handleGetList(databaseService.getTestimonials.bind(databaseService), req, res, 'testimonials');
export const createTestimonial = (req, res) => handleCreate(databaseService.createTestimonial.bind(databaseService), req, res, 'testimonial');
export const updateTestimonial = (req, res) => handleUpdate(databaseService.updateTestimonial.bind(databaseService), req, res, 'testimonial');
export const deleteTestimonial = (req, res) => handleDelete(databaseService.deleteTestimonial.bind(databaseService), req, res, 'testimonial');

// --- Blogs ---
export const getBlogs = (req, res) => handleGetList(databaseService.getBlogs.bind(databaseService), req, res, 'blogs');
export const createBlog = (req, res) => handleCreate(databaseService.createBlog.bind(databaseService), req, res, 'blog');
export const updateBlog = (req, res) => handleUpdate(databaseService.updateBlog.bind(databaseService), req, res, 'blog');
export const deleteBlog = (req, res) => handleDelete(databaseService.deleteBlog.bind(databaseService), req, res, 'blog');

export const incrementBlogViews = async (req, res) => {
  const { id } = req.params;
  try {
    await databaseService.incrementBlogViews(id);
    await databaseService.logEvent('blog_view', '1', id, `Blog ID: ${id} viewed`);
    res.json({ success: true, message: 'Views incremented.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
