import databaseService from '../services/databaseService.js';

/**
 * Middleware to track visitor activity.
 * Updates the 'last_activity' timestamp in the visitors table for logged-in sessions.
 */
export const trackVisitorActivity = async (req, res, next) => {
  if (req.user && req.user.visitorId) {
    try {
      await databaseService.updateVisitorActivity(req.user.visitorId);
    } catch (err) {
      // Fail silently to prevent interrupting request cycle
      console.error('⚠️ Visitor tracking error:', err.message);
    }
  }
  next();
};

/**
 * Utility helper to parse headers and extract visitor OS, browser, device, and IP.
 */
export const parseVisitorMeta = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  
  // Clean IPv6 encapsulation locally
  const cleanIp = ip.includes('::ffff:') ? ip.split('::ffff:')[1] : ip;

  // OS Parsing
  let os = 'Unknown OS';
  if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';

  // Browser Parsing
  let browser = 'Unknown Browser';
  if (/Edg/i.test(userAgent)) browser = 'Edge';
  else if (/Chrome/i.test(userAgent) && !/Chromium/i.test(userAgent)) browser = 'Chrome';
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/MSIE|Trident/i.test(userAgent)) browser = 'Internet Explorer';

  // Device Parsing
  let deviceType = 'Desktop';
  if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';
  else if (/Mobi|Android|iPhone/i.test(userAgent)) deviceType = 'Mobile';

  return {
    ip: cleanIp,
    os,
    browser,
    deviceType
  };
};
