import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiSettings, FiSliders, FiCpu, FiMail, FiDownload, FiUpload, FiCheckCircle, FiSave, FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';
import profileImage from '../assets/images/profile.jpg';

const SettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  // Settings states matching DB values
  const [settings, setSettings] = useState({
    theme: 'dark',
    ai_provider: 'offline',
    openai_key: '',
    gemini_key: '',
    ollama_host: 'http://localhost:11434',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    notification_email: ''
  });

  // Local state for attached import file
  const [importFile, setImportFile] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/system/settings');
      if (data.success && data.settings) {
        setSettings(prev => ({
          ...prev,
          ...data.settings
        }));
      }
    } catch (err) {
      toast.error('Failed to retrieve system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/system/settings', { settings });
      if (data.success) {
        toast.success('System parameters saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // Full DB State Export
  const handleExportBackup = async () => {
    try {
      const { data } = await api.get('/system/backup/export');
      if (data.success && data.backup) {
        const jsonStr = JSON.stringify(data.backup, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio_backup_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Database state exported successfully!');
      }
    } catch (err) {
      toast.error('Database export failed.');
    }
  };

  // Full DB State Import/Restore
  const handleImportBackup = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a valid backup JSON file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        if (!backupData.data) {
          toast.error('Invalid backup file schema: data object missing.');
          return;
        }

        if (!window.confirm('WARNING: Importing this backup will overwrite your current portfolio database entries. Proceed?')) {
          return;
        }

        setImporting(true);
        const { data } = await api.post('/system/backup/import', { data: backupData.data });
        if (data.success) {
          toast.success('Database state restored successfully!');
          setImportFile(null);
          window.location.reload(); // reload client to refresh memory structures
        }
      } catch (err) {
        toast.error('Backup restoration failed: ' + (err.response?.data?.message || err.message));
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(importFile);
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
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-sm mt-1">Configure AI engine models, SMTP messaging accounts, and trigger database restorations.</p>
        </div>

        {/* WORKSPACE SECTIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: AI and SMTP settings */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSaveSettings} className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* AI provider section */}
              <div className="space-y-4">
                <h2 className="text-base font-bold flex items-center gap-2 text-primary">
                  <FiCpu /> AI Service Configurations
                </h2>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-px"></div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Primary AI Provider</label>
                  <select 
                    value={settings.ai_provider}
                    onChange={e => setSettings({ ...settings, ai_provider: e.target.value })}
                    className="input-premium text-xs bg-white dark:bg-slate-900"
                  >
                    <option value="offline">Offline Rules Engine (Zero Setup Fallback)</option>
                    <option value="openai">OpenAI GPT-4o-Mini</option>
                    <option value="gemini">Google Gemini 1.5 Flash</option>
                    <option value="ollama">Ollama (Offline Local LLM)</option>
                  </select>
                </div>

                {settings.ai_provider === 'openai' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">OpenAI API Key</label>
                    <input 
                      type="password" 
                      value={settings.openai_key}
                      onChange={e => setSettings({ ...settings, openai_key: e.target.value })}
                      placeholder="sk-..."
                      className="input-premium text-xs"
                    />
                  </div>
                )}

                {settings.ai_provider === 'gemini' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Google Gemini API Key</label>
                    <input 
                      type="password" 
                      value={settings.gemini_key}
                      onChange={e => setSettings({ ...settings, gemini_key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="input-premium text-xs"
                    />
                  </div>
                )}

                {settings.ai_provider === 'ollama' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Ollama Server Host Port</label>
                    <input 
                      type="text" 
                      value={settings.ollama_host}
                      onChange={e => setSettings({ ...settings, ollama_host: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="input-premium text-xs"
                    />
                  </div>
                )}
              </div>

              {/* SMTP options */}
              <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h2 className="text-base font-bold flex items-center gap-2 text-accent">
                  <FiMail /> Nodemailer SMTP Accounts
                </h2>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-px"></div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">SMTP Host Server</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host}
                      onChange={e => setSettings({ ...settings, smtp_host: e.target.value })}
                      className="input-premium text-xs"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">SMTP Port</label>
                    <input 
                      type="text" 
                      value={settings.smtp_port}
                      onChange={e => setSettings({ ...settings, smtp_port: e.target.value })}
                      className="input-premium text-xs"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">SMTP Account Username</label>
                    <input 
                      type="text" 
                      value={settings.smtp_user}
                      onChange={e => setSettings({ ...settings, smtp_user: e.target.value })}
                      className="input-premium text-xs"
                      placeholder="alerts@domain.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">SMTP Password</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass}
                      onChange={e => setSettings({ ...settings, smtp_pass: e.target.value })}
                      className="input-premium text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Forward Notification Mail To</label>
                  <input 
                    type="email" 
                    value={settings.notification_email}
                    onChange={e => setSettings({ ...settings, notification_email: e.target.value })}
                    className="input-premium text-xs"
                    placeholder="daniel@danielpaul.dev"
                  />
                </div>
              </div>

              {/* Save Trigger */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md hover:bg-primary-dark transition-colors"
                >
                  <FiSave /> {saving ? 'Saving changes...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Database state utility imports/exports */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Export block */}
            <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FiDownload /> Backup Database State
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed">
                Download a complete serialized JSON schema file representing your portfolio settings, projects, and feedback logs.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-350 dark:border-slate-700"
              >
                <FiDownload /> Download Backup JSON
              </button>
            </div>

            {/* Import block */}
            <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2 text-amber-500">
                <FiAlertTriangle /> Restore Database State
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed">
                Restore database configurations from a previously exported backup file. This will overwrite active tables.
              </p>

              <form onSubmit={handleImportBackup} className="space-y-3">
                <label className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-950/20 hover:bg-slate-200 border border-dashed border-slate-350 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold cursor-pointer text-slate-500 transition-colors">
                  <FiUpload /> {importFile ? importFile.name : 'Select Backup File'}
                  <input 
                    type="file" 
                    onChange={e => setImportFile(e.target.files[0])} 
                    className="hidden" 
                    accept=".json"
                  />
                </label>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="w-full py-3 bg-amber-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <FiCheckCircle /> {importing ? 'Restoring DB...' : 'Restore Backup'}
                </button>
              </form>
            </div>

            {/* Active Profile Image */}
            <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 space-y-4 text-center">
              <h2 className="text-sm font-bold flex items-center justify-center gap-2">
                Active Profile Image
              </h2>
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto border-4 border-primary/25 relative group bg-slate-950">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default SettingsManager;
