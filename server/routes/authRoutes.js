import express from 'express';
import { 
  login, 
  register, 
  guestLogin, 
  logout, 
  registerDeviceToken, 
  forgotPassword, 
  resetPassword, 
  checkAuth 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { trackVisitorActivity } from '../middleware/trackingMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest-login', guestLogin);
router.post('/logout', verifyToken, logout);
router.post('/device-token', verifyToken, registerDeviceToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Verify secure session states, tracking activity dynamically
router.get('/verify', verifyToken, trackVisitorActivity, checkAuth);

export default router;
