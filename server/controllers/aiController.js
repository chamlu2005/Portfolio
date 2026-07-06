import aiService from '../services/aiService.js';
import databaseService from '../services/databaseService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const analyzePortfolio = async (req, res) => {
  try {
    const report = await aiService.analyzePortfolio();
    await databaseService.createNotification('🤖 AI successfully audited your portfolio quality.', 'ai');
    res.json({ success: true, report });
  } catch (err) {
    console.error('Portfolio AI audit error:', err);
    res.status(500).json({ success: false, message: 'AI Portfolio evaluation failed: ' + err.message });
  }
};

export const analyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a resume file first.' });
  }

  try {
    const uploadPath = path.join(__dirname, '../../uploads', req.file.filename);
    const atsReport = await aiService.runOfflineATSResumeAnalysis(uploadPath);

    // Save suggestion trace in db
    await databaseService.createAISuggestion({
      suggestionType: 'resume',
      score: atsReport.score,
      recommendations: atsReport.suggestions,
      strengths: atsReport.strengths,
      weaknesses: atsReport.layoutIssues,
      action_items: atsReport.missingKeywords
    });

    await databaseService.createNotification('🤖 AI parsed your resume and computed your ATS rating.', 'ai');

    res.json({
      success: true,
      message: 'ATS analysis completed successfully!',
      report: atsReport
    });
  } catch (err) {
    console.error('ATS audit error:', err);
    res.status(500).json({ success: false, message: 'AI ATS evaluation failed: ' + err.message });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const list = await databaseService.getAISuggestions();
    res.json({ success: true, count: list.length, suggestions: list });
  } catch (err) {
    console.error('Fetch AI logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve AI analysis cache.' });
  }
};
