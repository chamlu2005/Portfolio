import databaseService from '../services/databaseService.js';
import { parseVisitorMeta } from '../middleware/trackingMiddleware.js';
import { triggerPortfolioAlert } from '../services/notificationService.js';

/**
 * Log and Track Resume Downloads
 */
export const trackResumeDownload = async (req, res) => {
  const { name, email } = req.body;

  try {
    const meta = parseVisitorMeta(req);
    
    // Fallback geolocation if no client country provided (mocking)
    const country = req.body.country || 'India'; 

    // Store download in MySQL
    const downloadId = await databaseService.createResumeDownload({
      name: name || 'Guest Visitor',
      email: email || 'N/A',
      device: meta.deviceType,
      browser: meta.browser,
      os: meta.os,
      country,
      ip: meta.ip
    });

    // Link download log to visitor session if logged in
    if (req.user && req.user.visitorId) {
      await databaseService.createVisitorActionLog(
        req.user.visitorId, 
        'Download Resume', 
        `Downloaded resume. Log ID: ${downloadId}`
      );
    }

    // Trigger instant FCM Push and Nodemailer Email
    await triggerPortfolioAlert('Resume Download', {
      name: name || 'Guest Visitor',
      email: email || 'N/A',
      action: 'Downloaded Resume',
      browser: meta.browser,
      os: meta.os,
      device: meta.deviceType,
      country,
      ip: meta.ip,
      details: `Saved record ID: ${downloadId}`
    });

    res.json({
      success: true,
      message: 'Resume download event logged successfully.',
      downloadId
    });
  } catch (err) {
    console.error('Error logging resume download:', err);
    res.status(500).json({ success: false, message: 'Server error tracking resume download.' });
  }
};
