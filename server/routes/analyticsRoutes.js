import express from 'express';
import { trackSession, logEvent, getAnalyticsSummary } from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/session', trackSession);
router.post('/event', logEvent);
router.get('/summary', verifyToken, getAnalyticsSummary);

export default router;
