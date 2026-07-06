import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import databaseService from './databaseService.js';
import dotenv from 'dotenv';

dotenv.config();

let fcmInitialized = false;

// Initialize Firebase Admin SDK
const initFirebase = () => {
  try {
    // If already initialized
    if (admin.apps.length > 0) {
      fcmInitialized = true;
      return;
    }

    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountVar) {
      let serviceAccount;
      if (serviceAccountVar.startsWith('{')) {
        serviceAccount = JSON.parse(serviceAccountVar);
      } else {
        // If it's a file path
        serviceAccount = serviceAccountVar;
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      fcmInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully!');
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT environment variable not set. Running FCM in mock/fallback mode.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
};

initFirebase();

// Nodemailer Config
const getTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'danielpaul2285@gmail.com',
      pass: process.env.EMAIL_PASS || 'mock-pass'
    }
  });
};

/**
 * Send FCM Push Notification to Admin
 */
export const sendPushNotification = async (title, body, dataPayload = {}) => {
  initFirebase();
  try {
    // Get Admin Device Token from Settings
    const settings = await databaseService.getSettings();
    const adminDeviceToken = settings.admin_device_token;

    if (!adminDeviceToken) {
      console.log(`📡 [Push Notification - No Device Registered] Title: "${title}" | Body: "${body}"`);
      return false;
    }

    if (fcmInitialized) {
      const message = {
        token: adminDeviceToken,
        notification: {
          title,
          body
        },
        data: dataPayload
      };
      
      const response = await admin.messaging().send(message);
      console.log('🚀 FCM push notification sent successfully:', response);
      return true;
    } else {
      console.log(`📡 [Push Notification - FCM Mock Mode] Title: "${title}" | Body: "${body}"`);
      return false;
    }
  } catch (err) {
    console.error('❌ Error sending push notification:', err.message);
    return false;
  }
};

/**
 * Send Email Notification to Daniel
 */
export const sendEmailNotification = async (subject, htmlContent) => {
  try {
    const adminEmail = 'danielpaul2285@gmail.com';
    const senderEmail = process.env.EMAIL_USER || 'danielpaul2285@gmail.com';

    // Prevent sending mail if email service is mocked
    if (process.env.EMAIL_PASS === 'mock-pass' || !process.env.EMAIL_PASS) {
      console.log(`📧 [Email Notification - Mock Mode] Subject: "${subject}"`);
      return false;
    }

    const transporter = getTransporter();
    const mailOptions = {
      from: `"Portfolio Alerts" <${senderEmail}>`,
      to: adminEmail,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email notification sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ Error sending email notification:', err.message);
    return false;
  }
};

/**
 * Helper to build custom alert formats
 */
export const triggerPortfolioAlert = async (type, meta = {}) => {
  const { name, email, action, browser, os, device, country, time, details } = meta;
  const timestamp = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const title = `🔔 New Portfolio Event: ${type}`;
  const pushBody = `Name: ${name || 'Guest'}\nAction: ${action}\nDevice: ${os || device || 'Unknown'}\nCountry: ${country || 'Unknown'}`;
  
  // 1. Send Push Notification
  await sendPushNotification(title, pushBody, {
    type,
    name: name || 'Guest',
    email: email || '',
    action,
    country: country || 'Unknown',
    time: timestamp
  });

  // 2. Build Email HTML
  const emailHtml = `
    <div style="font-family: sans-serif; padding: 20px; border-radius: 12px; background: #0f172a; color: #f8fafc; max-width: 600px;">
      <h2 style="color: #3b82f6; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-top: 0;">Portfolio Platform Alert</h2>
      <p style="font-size: 16px; margin: 15px 0;"><strong>Event Type:</strong> ${type}</p>
      <div style="background: #1e293b; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Name:</strong> ${name || 'Guest'}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${email || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Action:</strong> ${action}</p>
        <p style="margin: 5px 0;"><strong>IP Address:</strong> ${meta.ip || 'Unknown'}</p>
        <p style="margin: 5px 0;"><strong>Browser:</strong> ${browser || 'Unknown'}</p>
        <p style="margin: 5px 0;"><strong>OS / Device:</strong> ${os || 'Unknown'} (${device || 'Unknown'})</p>
        <p style="margin: 5px 0;"><strong>Country:</strong> ${country || 'Unknown'}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp}</p>
        ${details ? `<p style="margin: 10px 0 5px 0; border-top: 1px solid #475569; padding-top: 10px;"><strong>Details:</strong> ${details}</p>` : ''}
      </div>
      <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">Sent by Daniel Paul's Portfolio Platform System.</p>
    </div>
  `;

  // 2. Send Email Alert
  await sendEmailNotification(`[Portfolio Alert] ${name || 'Guest'} - ${action}`, emailHtml);
};
