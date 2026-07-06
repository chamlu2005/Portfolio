import express from 'express';
import {
  getProfile, updateProfile,
  getProjects, createProject, updateProject, deleteProject, incrementProjectViews,
  getSkills, createSkill, updateSkill, deleteSkill,
  getExperiences, createExperience, updateExperience, deleteExperience,
  getEducation, createEducation, updateEducation, deleteEducation,
  getCertificates, createCertificate, updateCertificate, deleteCertificate,
  getAchievements, createAchievement, updateAchievement, deleteAchievement,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getBlogs, createBlog, updateBlog, deleteBlog, incrementBlogViews
} from '../controllers/portfolioController.js';
import { uploadFile } from '../controllers/uploadController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Profile ---
router.get('/profile', getProfile);
router.put('/profile', verifyToken, updateProfile);

// --- Projects ---
router.get('/projects', getProjects);
router.post('/projects', verifyToken, createProject);
router.put('/projects/:id', verifyToken, updateProject);
router.delete('/projects/:id', verifyToken, deleteProject);
router.post('/projects/:id/view', incrementProjectViews);

// --- Skills ---
router.get('/skills', getSkills);
router.post('/skills', verifyToken, createSkill);
router.put('/skills/:id', verifyToken, updateSkill);
router.delete('/skills/:id', verifyToken, deleteSkill);

// --- Experience ---
router.get('/experience', getExperiences);
router.post('/experience', verifyToken, createExperience);
router.put('/experience/:id', verifyToken, updateExperience);
router.delete('/experience/:id', verifyToken, deleteExperience);

// --- Education ---
router.get('/education', getEducation);
router.post('/education', verifyToken, createEducation);
router.put('/education/:id', verifyToken, updateEducation);
router.delete('/education/:id', verifyToken, deleteEducation);

// --- Certificates ---
router.get('/certificates', getCertificates);
router.post('/certificates', verifyToken, createCertificate);
router.put('/certificates/:id', verifyToken, updateCertificate);
router.delete('/certificates/:id', verifyToken, deleteCertificate);

// --- Achievements ---
router.get('/achievements', getAchievements);
router.post('/achievements', verifyToken, createAchievement);
router.put('/achievements/:id', verifyToken, updateAchievement);
router.delete('/achievements/:id', verifyToken, deleteAchievement);

// --- Testimonials ---
router.get('/testimonials', getTestimonials);
router.post('/testimonials', verifyToken, createTestimonial);
router.put('/testimonials/:id', verifyToken, updateTestimonial);
router.delete('/testimonials/:id', verifyToken, deleteTestimonial);

// --- Blogs ---
router.get('/blogs', getBlogs);
router.post('/blogs', verifyToken, createBlog);
router.put('/blogs/:id', verifyToken, updateBlog);
router.delete('/blogs/:id', verifyToken, deleteBlog);
router.post('/blogs/:id/view', incrementBlogViews);

// --- Uploads ---
router.post('/upload', verifyToken, upload.single('file'), uploadFile);
router.post('/upload/resume', verifyToken, upload.single('resume'), uploadFile);

export default router;
