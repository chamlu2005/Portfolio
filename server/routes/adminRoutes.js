import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { 
  getAdminDashboard, 
  getAdminAnalyticsData, 
  getAdminUsers, 
  deleteAdminUser 
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', verifyToken, requireRole('admin'), getAdminDashboard);
router.get('/analytics', verifyToken, requireRole('admin'), getAdminAnalyticsData);
router.get('/users', verifyToken, requireRole('admin'), getAdminUsers);
router.delete('/users/:id', verifyToken, requireRole('admin'), deleteAdminUser);

export default router;
