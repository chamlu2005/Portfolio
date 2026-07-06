import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import databaseService from '../services/databaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  try {
    let fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.body.type || (req.file.fieldname === 'resume' ? 'resume' : 'image');

    if (fileType === 'resume') {
      const publicResumePath = path.join(__dirname, '../../client/public/resume.pdf');
      
      // Ensure the directory exists (just in case)
      const dir = path.dirname(publicResumePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Copy the uploaded file to client/public/resume.pdf
      fs.copyFileSync(req.file.path, publicResumePath);
      fileUrl = '/resume.pdf';

      // Log resume upload details in system settings/analytics
      await databaseService.updateProfile({ resume_url: fileUrl });
      await databaseService.createNotification('📄 Updated main portfolio resume file.', 'system');
      await databaseService.logEvent('resume_upload', '1', '', `New resume uploaded: ${req.file.filename}`);
    }

    res.json({
      success: true,
      message: 'File uploaded successfully!',
      fileUrl,
      fileInfo: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('File upload controller error:', err);
    res.status(500).json({ success: false, message: 'Failed to process uploaded file.' });
  }
};
