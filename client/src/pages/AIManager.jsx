import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrendingUp, FiUpload, FiCheckCircle, FiAlertCircle, FiHelpCircle, FiArrowRight, FiBookOpen
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';

const AIManager = () => {
  const [loading, setLoading] = useState(true);
  const [analyzingPortfolio, setAnalyzingPortfolio] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  // AI report states
  const [portfolioReport, setPortfolioReport] = useState(null);
  const [resumeReport, setResumeReport] = useState(null);
  
  // Local file attachment state
  const [resumeFile, setResumeFile] = useState(null);

  const fetchAIWorkspaceData = async () => {
    setLoading(true);
    try {
      // Load latest suggestions cache
      const { data } = await api.get('/ai/suggestions');
      if (data.success && data.suggestions.length > 0) {
        // Find latest portfolio suggest
        const portSug = data.suggestions.find(s => s.type === 'portfolio');
        if (portSug) {
          // Parse JSON if SQL stringified
          const recs = typeof portSug.recommendations === 'string' ? JSON.parse(portSug.recommendations) : portSug.recommendations;
          const strengths = typeof portSug.strengths === 'string' ? JSON.parse(portSug.strengths) : portSug.strengths;
          const weaknesses = typeof portSug.weaknesses === 'string' ? JSON.parse(portSug.weaknesses) : portSug.weaknesses;
          
          setPortfolioReport({
            score: portSug.score,
            recommendations: recs,
            strengths: strengths,
            weaknesses: weaknesses,
            action_items: []
          });
        }
        
        // Find latest resume suggest
        const resSug = data.suggestions.find(s => s.type === 'resume');
        if (resSug) {
          const recs = typeof resSug.recommendations === 'string' ? JSON.parse(resSug.recommendations) : resSug.recommendations;
          const strengths = typeof resSug.strengths === 'string' ? JSON.parse(resSug.strengths) : resSug.strengths;
          const weaknesses = typeof resSug.weaknesses === 'string' ? JSON.parse(resSug.weaknesses) : resSug.weaknesses;
          const keywords = typeof resSug.action_items === 'string' ? JSON.parse(resSug.action_items) : resSug.action_items;

          setResumeReport({
            score: resSug.score,
            suggestions: recs,
            strengths: strengths,
            layoutIssues: weaknesses,
            missingKeywords: keywords,
            fileFormat: 'PDF',
            fileSize: '340 KB',
            suggestedSummary: 'Result-driven Full-stack Developer with B.Tech degree in IT. Specialized in React.js and Node.js.'
          });
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve AI analysis logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIWorkspaceData();
  }, []);

  // Trigger full portfolio scan
  const handlePortfolioScan = async () => {
    setAnalyzingPortfolio(true);
    try {
      const { data } = await api.post('/ai/analyze');
      if (data.success) {
        setPortfolioReport(data.report);
        toast.success('AI portfolio audit completed successfully!');
      }
    } catch (err) {
      toast.error('AI portfolio audit failed.');
    } finally {
      setAnalyzingPortfolio(false);
    }
  };

  // Trigger resume upload and ATS check
  const handleResumeATSSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please attach a resume file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setUploadingResume(true);
    try {
      const { data } = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setResumeReport(data.report);
        toast.success('ATS resume evaluation completed successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'ATS analysis upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Page title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Audit Workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-sm mt-1">
            Audit your portfolio completeness, run ATS checks on your resume, and review learning roadmaps.
          </p>
        </div>

        {/* WORKSPACE SECTIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Portfolio Health Auditor */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <FiTrendingUp className="text-primary" /> Portfolio Health Gauge
                </h2>
                <button
                  onClick={handlePortfolioScan}
                  disabled={analyzingPortfolio}
                  className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold flex items-center gap-1 shadow-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {analyzingPortfolio ? 'Auditing...' : 'Run Diagnostics'}
                </button>
              </div>

              {portfolioReport ? (
                <div className="space-y-6">
                  {/* Gauge score visualization */}
                  <div className="flex items-center gap-6 p-4 bg-slate-100/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <div className="text-center shrink-0">
                      <span className="text-3xl font-black text-primary dark:text-primary-light block">{portfolioReport.score}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Health Score</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-light flex-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Audit status: {portfolioReport.score >= 80 ? 'Excellent' : 'Improvement Needed'}</p>
                      <p>Completed portfolio structure metadata is weighted and computed automatically.</p>
                    </div>
                  </div>

                  {/* Recommendations checklists */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Checkpoints</h3>
                    
                    {/* Strengths */}
                    {portfolioReport.strengths?.map((str, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-slate-650 dark:text-slate-350">
                        <FiCheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                        <p>{str}</p>
                      </div>
                    ))}

                    {/* Weaknesses */}
                    {portfolioReport.weaknesses?.map((weak, idx) => (
                      <div key={idx} className="flex gap-2.5 text-xs text-slate-650 dark:text-slate-350">
                        <FiAlertCircle className="text-amber-500 shrink-0 mt-0.5" />
                        <p>{weak}</p>
                      </div>
                    ))}
                  </div>

                  {/* Action items suggestions */}
                  <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-2xl">
                    <h4 className="text-xs font-bold text-primary dark:text-primary-light mb-2 flex items-center gap-1"><FiBookOpen /> Priority Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-350 font-light">
                      {portfolioReport.recommendations?.slice(0, 3).map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiHelpCircle size={40} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-light">No diagnostic report cached. Click 'Run Diagnostics' above to audit.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Resume ATS Tracker */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
              <h2 className="text-base font-bold flex items-center gap-2">
                📂 ATS Resume Analyzer
              </h2>

              {/* Upload Input form */}
              <form onSubmit={handleResumeATSSubmit} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <label className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors text-slate-500">
                    <FiUpload /> {resumeFile ? resumeFile.name : 'Select Resume Document'}
                    <input 
                      type="file" 
                      onChange={e => setResumeFile(e.target.files[0])} 
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={uploadingResume || !resumeFile}
                    className="px-5 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl disabled:opacity-50 transition-colors shadow-md shadow-primary/20"
                  >
                    {uploadingResume ? 'Analyzing...' : 'Audit Resume'}
                  </button>
                </div>
              </form>

              {resumeReport ? (
                <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
                  {/* ATS score card */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="p-4 bg-accent/10 text-accent rounded-2xl text-center">
                      <span className="text-3xl font-black block">{resumeReport.score}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">ATS Rating</span>
                    </div>
                    <div className="col-span-2 text-xs text-slate-500 dark:text-slate-400 font-light space-y-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">File format: {resumeReport.fileFormat}</p>
                      <p>File weight size: {resumeReport.fileSize}</p>
                    </div>
                  </div>

                  {/* Section checklists */}
                  <div className="space-y-3 text-xs">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parsing Observations</h3>
                    
                    {resumeReport.strengths?.slice(0, 2).map((str, idx) => (
                      <div key={idx} className="flex gap-2 text-slate-650 dark:text-slate-350">
                        <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                        <p>{str}</p>
                      </div>
                    ))}

                    {resumeReport.layoutIssues?.map((issue, idx) => (
                      <div key={idx} className="flex gap-2 text-slate-650 dark:text-slate-350">
                        <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" />
                        <p>{issue}</p>
                      </div>
                    ))}
                  </div>

                  {/* Keyword analysis */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keyword Density Audits</h3>
                    <div className="p-4 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl text-xs space-y-3">
                      <div>
                        <span className="font-semibold text-slate-400 block mb-1.5">Missing Industry Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeReport.missingKeywords?.length === 0 ? (
                            <span className="text-slate-400 font-light text-[10px]">No major skill gaps parsed.</span>
                          ) : (
                            resumeReport.missingKeywords?.map(kw => (
                              <span key={kw} className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-[10px] font-bold">
                                {kw}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resume summary draft suggestion */}
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/15 rounded-2xl">
                    <h4 className="text-xs font-bold text-indigo-500 mb-2">Suggested Summary Draft</h4>
                    <p className="text-xs font-light text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{resumeReport.suggestedSummary}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiHelpCircle size={40} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-xs text-slate-400 font-light">Attach a resume and scan to check ATS compliance scores.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default AIManager;
