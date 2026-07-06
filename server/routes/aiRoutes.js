import express from 'express';
import { analyzePortfolio, analyzeResume, getSuggestions } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze', verifyToken, analyzePortfolio);
router.post('/analyze-resume', verifyToken, upload.single('resume'), analyzeResume);
router.get('/suggestions', verifyToken, getSuggestions);

export default router;
