import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiEye, FiUsers, FiDownload, FiMessageSquare, FiTrendingUp, FiActivity, FiMapPin, FiCalendar
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import AdminLayout from '../components/AdminLayout.jsx';
import api from '../utils/api.js';
import { Link } from 'react-router-dom';
import profileImage from '../assets/images/profile.jpg';

// Register ChartJS modules
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [chartsData, setChartsData] = useState({});
  const [recentRecruiters, setRecentRecruiters] = useState([]);
  const [healthScore, setHealthScore] = useState(0);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        const { data } = await api.get('/analytics/summary');
        if (data.success) {
          setSummary(data.summary);
          setChartsData(data.charts);
          setRecentRecruiters(data.recruiterActivities.slice(0, 5));
        }

        // Fetch AI suggestions to display the profile health score
        const aiRes = await api.get('/ai/suggestions');
        if (aiRes.data.success && aiRes.data.suggestions.length > 0) {
          const latestPortScore = aiRes.data.suggestions.find(s => s.type === 'portfolio');
          if (latestPortScore) {
            setHealthScore(latestPortScore.score);
          } else {
            setHealthScore(85); // Seed fallback
          }
        } else {
          setHealthScore(85);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardDetails();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-light animate-pulse text-sm">Collating analytical databases...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Line Chart: Daily Views
  const dailyViewsLabels = Object.keys(chartsData?.dailyViews || {});
  const dailyViewsValues = Object.values(chartsData?.dailyViews || {});
  
  const lineChartData = {
    labels: dailyViewsLabels,
    datasets: [{
      label: 'Visitor Sessions',
      data: dailyViewsValues,
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.05)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointBackgroundColor: '#2563EB',
      pointBorderColor: '#fff',
      pointHoverRadius: 6
    }]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, border: { dash: [5, 5] }, ticks: { stepSize: 5 } },
      x: { grid: { display: false } }
    }
  };

  // 2. Doughnut Chart: Traffic Sources
  const trafficLabels = Object.keys(chartsData?.trafficSources || {});
  const trafficValues = Object.values(chartsData?.trafficSources || {});

  const doughnutChartData = {
    labels: trafficLabels,
    datasets: [{
      data: trafficValues,
      backgroundColor: ['#2563EB', '#06B6D4', '#6366F1', '#3B82F6', '#10B981'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
    }
  };

  // 3. Bar Chart: Project Views
  const projectLabels = Object.keys(chartsData?.projectViews || {}).map(id => `Proj #${id}`);
  const projectValues = Object.values(chartsData?.projectViews || {});

  const barChartData = {
    labels: projectLabels.length > 0 ? projectLabels : ['Proj #1', 'Proj #2', 'Proj #3'],
    datasets: [{
      label: 'Clicks',
      data: projectValues.length > 0 ? projectValues : [12, 8, 5],
      backgroundColor: '#06B6D4',
      borderRadius: 8,
      borderWidth: 0
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, border: { dash: [5, 5] } },
      x: { grid: { display: false } }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* WELCOME SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
          {/* Welcome Card & Profile Summary */}
          <div className="flex-1 glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 bg-white dark:bg-slate-900 shadow-sm">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-slate-950">
              <img 
                src={profileImage} 
                alt="Daniel Paul S" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2364748B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/></svg>";
                }}
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-extrabold tracking-tight">CMS Overview</h1>
              <p className="text-slate-500 dark:text-slate-400 font-light text-sm mt-1">
                Welcome back. Real-time visitor activity and resume auditing charts are logged below.
              </p>
            </div>
          </div>

          {/* Health score widget */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl py-6 px-6 flex items-center gap-4 shrink-0 bg-white dark:bg-slate-900 shadow-sm w-full lg:w-80">
            <div>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Portfolio Health</span>
              <span className="text-xl font-black text-primary dark:text-primary-light mt-1 block">{healthScore}/100</span>
            </div>
            <div className="flex-1 w-full h-1.5 bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${healthScore}%` }}></div>
            </div>
          </div>
        </div>

        {/* METRICS HEADERS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold mb-1">Total Hits</span>
              <span className="text-2xl font-black">{summary.totalSessions || 0}</span>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl"><FiEye size={20} /></div>
          </div>

          <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold mb-1">Unique Visitors</span>
              <span className="text-2xl font-black">{summary.uniqueVisitors || 0}</span>
            </div>
            <div className="p-3 bg-accent/10 text-accent rounded-2xl"><FiUsers size={20} /></div>
          </div>

          <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold mb-1">Downloads</span>
              <span className="text-2xl font-black">{summary.resumeDownloads || 0}</span>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><FiDownload size={20} /></div>
          </div>

          <div className="glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold mb-1">Pending Messages</span>
              <span className="text-2xl font-black">{summary.totalMessages || 0}</span>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><FiMessageSquare size={20} /></div>
          </div>

        </div>

        {/* CHARTS CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Daily views line chart */}
          <div className="lg:col-span-8 glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold flex items-center gap-2">
                <FiActivity className="text-primary" /> Traffic Engagement
              </h2>
              <span className="text-xs text-slate-400">Past 7 Days</span>
            </div>
            <div className="h-72">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Traffic source doughnut */}
          <div className="lg:col-span-4 glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6">
            <h2 className="text-base font-bold mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-accent" /> Traffic Channels
            </h2>
            <div className="h-72 flex items-center justify-center">
              {trafficValues.length === 0 ? (
                <p className="text-xs text-slate-400 font-light">No referrer logs logged.</p>
              ) : (
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              )}
            </div>
          </div>

        </div>

        {/* ADDITIONAL CHARTS & LOGS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Project clicks bar */}
          <div className="lg:col-span-6 glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6">
            <h2 className="text-base font-bold mb-6">Most Viewed Projects</h2>
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Right: Recruiter logs summary */}
          <div className="lg:col-span-6 glass-panel border border-white/20 dark:border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold mb-6">Recruiter Activity Stream</h2>
              <div className="space-y-4">
                {recentRecruiters.length === 0 ? (
                  <p className="text-xs text-slate-400 font-light py-6 text-center">No recent recruiter feedback logs.</p>
                ) : (
                  recentRecruiters.map((rec, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 last:pb-0">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-850 dark:text-slate-200">
                          {rec.name} ({rec.company || 'Freelancer'})
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-light">
                          <FiCalendar /> {new Date(rec.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {rec.interview ? (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">Interview Requested</span>
                        ) : null}
                        <span className="font-semibold text-slate-500 flex items-center gap-0.5">
                          {rec.rating}/5 ⭐
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* View messages redirect link */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
              <Link to="/admin/messages" className="text-xs font-semibold text-primary dark:text-primary-light hover:underline flex items-center justify-center gap-1">
                Open Recruiter Inbox &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
