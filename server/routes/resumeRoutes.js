import express from 'express';
import { trackResumeDownload } from '../controllers/resumeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow optional token verification so guests can download but logged in sessions link records
router.post('/download', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.split(' ')[1]) {
    return verifyToken(req, res, next);
  }
  next();
}, trackResumeDownload);

export default router;
