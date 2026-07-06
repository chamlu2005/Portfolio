import databaseService from '../services/databaseService.js';
import nodemailer from 'nodemailer';
import { parseVisitorMeta } from '../middleware/trackingMiddleware.js';
import { triggerPortfolioAlert } from '../services/notificationService.js';

// Simple helper to send notifications to email if Nodemailer credentials exist
const sendEmailAlert = async (messageData) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return; // Skip email if SMTP not configured
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"Portfolio CMS Alert" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
      subject: `New Recruiter Message: ${messageData.subject || 'Portfolio Feedback'}`,
      text: `
        Name: ${messageData.recruiter_name}
        Email: ${messageData.email}
        Company: ${messageData.company || 'Not Specified'}
        Rating: ${messageData.rating || 'N/A'}/5
        Interview Request: ${messageData.interview_request ? 'YES' : 'NO'}
        
        Message:
        ${messageData.message}
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📬 Notification email sent successfully.');
  } catch (err) {
    console.warn('⚠️ Nodemailer failed to send notification email. Error:', err.message);
  }
};

export const submitMessage = async (req, res) => {
  const { recruiter_name, email, company, subject, message, rating, interview_request, interview_date } = req.body;

  if (!recruiter_name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide recruiter_name, email, and message.' });
  }

  try {
    const newMsg = await databaseService.createMessage({
      recruiter_name,
      email,
      company: company || '',
      subject: subject || 'Portfolio Response',
      message,
      rating: rating || 0,
      interview_request: !!interview_request,
      interview_date: interview_date || ''
    });

    // Create real-time notification in CMS
    let notificationText = `✉️ New message from ${recruiter_name} (${company || 'Freelancer'})`;
    if (interview_request) {
      notificationText = `📅 Interview requested by ${recruiter_name} from ${company || 'Recruiter'}!`;
    }
    
    await databaseService.createNotification(notificationText, interview_request ? 'interview' : 'message');
    await databaseService.logEvent('recruiter_contact', '1', newMsg.id.toString(), `Contacted by ${recruiter_name}`);

    // Trigger SMTP Email and Firebase Push notification
    const meta = parseVisitorMeta(req);
    await triggerPortfolioAlert('Contact Form Submission', {
      name: recruiter_name,
      email,
      action: 'Submitted Contact Form',
      browser: meta.browser,
      os: meta.os,
      device: meta.deviceType,
      ip: meta.ip,
      details: `Subject: ${subject || 'N/A'}\nMessage: ${message}`
    });

    res.status(201).json({ success: true, message: 'Message sent successfully!', data: newMsg });
  } catch (err) {
    console.error('Error submitting message:', err);
    res.status(500).json({ success: false, message: 'Failed to record your message.' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await databaseService.getMessages();
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

export const toggleBookmark = async (req, res) => {
  const { id } = req.params;
  const { bookmarked } = req.body;

  try {
    await databaseService.updateMessageBookmark(id, bookmarked);
    res.json({ success: true, message: `Bookmark status updated for message ID: ${id}` });
  } catch (err) {
    console.error('Error updating bookmark:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRating = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  try {
    await databaseService.updateMessageRating(id, rating);
    res.json({ success: true, message: 'Rating updated.' });
  } catch (err) {
    console.error('Error updating rating:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    await databaseService.deleteMessage(id);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
};
