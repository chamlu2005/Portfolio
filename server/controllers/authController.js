import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import databaseService from '../services/databaseService.js';
import { parseVisitorMeta } from '../middleware/trackingMiddleware.js';
import { triggerPortfolioAlert } from '../services/notificationService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'daniel_paul_premium_portfolio_cms_secret_key_123';

/**
 * Handle Visitor Registration
 */
export const register = async (req, res) => {
  const { name, email, phone, password, confirmPassword, country, profession, company } = req.body;

  if (!name || !email || !password || !confirmPassword || !phone) {
    return res.status(400).json({ success: false, message: 'All fields (Name, Email, Phone, Password, Confirm Password) are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await databaseService.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Register user record
    const userId = await databaseService.createUser(email, passwordHash, 'visitor');
    
    // Update user profile fields (extending DB details)
    await databaseService.execute(
      'UPDATE users SET name = ?, phone = ?, country = ?, profession = ?, company = ? WHERE id = ?',
      [name, phone, country || 'Unknown', profession || '', company || '', userId]
    );

    // Log visitor session details
    const meta = parseVisitorMeta(req);
    const visitorId = await databaseService.createVisitor({
      user_id: userId,
      name,
      email,
      phone,
      country: country || 'Unknown',
      company: company || '',
      ip_address: meta.ip,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType
    });

    await databaseService.createVisitorActionLog(visitorId, 'Register', `New user registered: ${email}`);

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, role: 'visitor', visitorId, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Trigger Push & Email Alerts
    await triggerPortfolioAlert('Register', {
      name,
      email,
      action: 'Registered',
      browser: meta.browser,
      os: meta.os,
      device: meta.deviceType,
      country: country || 'Unknown',
      ip: meta.ip
    });

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully.',
      token,
      user: { id: userId, email, name, role: 'visitor', visitorId }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * Handle Visitor & Admin Login
 */
export const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
  }

  try {
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Log Visitor Session details
    const meta = parseVisitorMeta(req);
    const visitorId = await databaseService.createVisitor({
      user_id: user.id,
      name: user.name || 'Admin',
      email: user.email,
      phone: user.phone || '',
      country: user.country || 'Unknown',
      company: user.company || '',
      ip_address: meta.ip,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType
    });

    await databaseService.createVisitorActionLog(visitorId, 'Login', `User logged in: ${email}`);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, visitorId, name: user.name || 'Admin' },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Trigger Push & Email Alerts (Skip Admin to reduce noise, or track all)
    await triggerPortfolioAlert(user.role === 'admin' ? 'Admin Login' : 'Login', {
      name: user.name || 'Admin',
      email: user.email,
      action: 'Logged In',
      browser: meta.browser,
      os: meta.os,
      device: meta.deviceType,
      country: user.country || 'Unknown',
      ip: meta.ip
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || 'Admin',
        role: user.role,
        visitorId
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * Handle Guest Login
 */
export const guestLogin = async (req, res) => {
  try {
    const meta = parseVisitorMeta(req);
    
    // Create Visitor Session log for Guest
    const visitorId = await databaseService.createVisitor({
      user_id: null,
      name: 'Guest Visitor',
      email: 'guest@portfolio.dev',
      phone: '',
      country: 'Unknown',
      company: '',
      ip_address: meta.ip,
      browser: meta.browser,
      os: meta.os,
      device_type: meta.deviceType
    });

    await databaseService.createVisitorActionLog(visitorId, 'Guest Login', 'Entered as guest');

    // Generate transient guest token
    const token = jwt.sign(
      { id: 0, email: 'guest@portfolio.dev', role: 'guest', visitorId, name: 'Guest' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Guest session created.',
      token,
      user: { id: 0, email: 'guest@portfolio.dev', name: 'Guest', role: 'guest', visitorId }
    });
  } catch (err) {
    console.error('Guest login error:', err);
    res.status(500).json({ success: false, message: 'Server error creating guest session.' });
  }
};

/**
 * Handle Logout
 */
export const logout = async (req, res) => {
  try {
    if (req.user && req.user.visitorId) {
      await databaseService.updateVisitorLogout(req.user.visitorId);
      await databaseService.createVisitorActionLog(req.user.visitorId, 'Logout', 'User logged out');
    }
    res.json({ success: true, message: 'Logout successful.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
};

/**
 * Handle Admin Registration of Device Token for Push Notifications
 */
export const registerDeviceToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'FCM Token is required.' });
  }

  try {
    // Only admins can register notification tokens
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    await databaseService.updateSetting('admin_device_token', token);
    res.json({ success: true, message: 'Admin push token registered successfully.' });
  } catch (err) {
    console.error('FCM registration error:', err);
    res.status(500).json({ success: false, message: 'Server error setting push token.' });
  }
};

/**
 * Forgot Password Init
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  try {
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      // Respond with success to prevent user enumeration security disclosure
      return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
    }

    // Generate short reset code / token valid for 30 minutes
    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    // Update settings cache/recent activity
    await databaseService.createNotification(`Password reset request by: ${email}`, 'auth');
    
    // Simulate sending email log, or trigger real if mail transporter configuration is set
    console.log(`🔑 [Reset Password Token Generated] Target: ${email} | Code: ${resetToken}`);

    res.json({
      success: true,
      message: 'Reset verification code has been dispatched.',
      token: resetToken // Output code/token for client-side routing
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error generating code.' });
  }
};

/**
 * Reset Password Handler
 */
export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, Verification Token, and New Password are required.' });
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== email) {
      return res.status(400).json({ success: false, message: 'Invalid token verification details.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user entry
    await databaseService.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, decoded.id]);
    await databaseService.createNotification(`Password updated for user: ${email}`, 'auth');

    res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
  }
};

/**
 * Verify Session & Get Current Profile
 */
export const checkAuth = async (req, res) => {
  try {
    const user = await databaseService.getUserById(req.user.id);
    if (!user) {
      // Guest or mock session checks
      if (req.user.role === 'guest') {
        return res.json({ success: true, user: { id: 0, email: req.user.email, role: 'guest', name: 'Guest', visitorId: req.user.visitorId } });
      }
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Return extended details
    const extendedUser = await databaseService.query('SELECT name, phone, country, profession, company FROM users WHERE id = ?', [user.id]);
    const details = extendedUser[0] || {};
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        visitorId: req.user.visitorId,
        name: details.name || user.email.split('@')[0],
        phone: details.phone,
        country: details.country,
        profession: details.profession,
        company: details.company
      }
    });
  } catch (err) {
    console.error('Check auth error:', err);
    res.status(500).json({ success: false, message: 'Server error verification.' });
  }
};
