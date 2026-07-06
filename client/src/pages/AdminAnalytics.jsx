import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiTrendingUp, FiDownload, FiMessageSquare, 
  FiGlobe, FiSearch, FiTrash2, FiClock, FiSmartphone, FiMonitor 
} from 'react-icons/fi';
import api from '../utils/api.js';
import { toast } from 'react-toastify';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '../components/AdminLayout.jsx';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend
);

const AdminAnalytics = () => {
  // Metric counts
  const [metrics, setMetrics] = useState({
    totalVisitors: 0,
    todayVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    downloads: 0,
    projectViews: 0,
    loggedInUsers: 0,
    contactMessages: 0
  });

  // Breakdown & Graph states
  const [breakdowns, setBreakdowns] = useState({
    topCountries: [],
    topBrowsers: [],
    topDevices: [],
    returningVisitors: 0,
    trafficTimeline: [],
    recentVisitors: []
  });

  // User details state
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all analytics payloads
  const fetchAnalyticsData = async () => {
    try {
      const resMetrics = await api.get('/admin/dashboard');
      if (resMetrics.data.success) {
        setMetrics(resMetrics.data.metrics);
      }

      const resBreakdowns = await api.get('/admin/analytics');
      if (resBreakdowns.data.success) {
        setBreakdowns(resBreakdowns.data.analytics);
      }

      const resUsers = await api.get('/admin/users');
      if (resUsers.data.success) {
        setUsers(resUsers.data.users);
      }
    } catch (err) {
      toast.error('Failed to load tracking analytics details.');
      console.error('Analytics load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    // Poll updates every 25 seconds
    const interval = setInterval(fetchAnalyticsData, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete visitor: ${email}?`)) return;
    try {
      const { data } = await api.delete(`/admin/users/${id}`);
      if (data.success) {
        toast.success('Visitor profile deleted.');
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete visitor profile.');
    }
  };

  // Search filtering
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Graph Configurations ---
  
  // 1. Traffic Timeline Configuration
  const timelineDates = breakdowns.trafficTimeline?.map(t => t.date || 'Unknown') || [];
  const timelineCounts = breakdowns.trafficTimeline?.map(t => t.count || 0) || [];
  
  const lineChartData = {
    labels: timelineDates.length > 0 ? timelineDates : ['No Data'],
    datasets: [
      {
        label: 'Visits Count',
        data: timelineCounts.length > 0 ? timelineCounts : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#2563eb'
      }
    ]
  };

  // 2. Devices Breakdown Configuration
  const deviceLabels = breakdowns.topDevices?.map(d => d.device || 'Desktop') || [];
  const deviceCounts = breakdowns.topDevices?.map(d => d.count || 0) || [];

  const doughnutData = {
    labels: deviceLabels.length > 0 ? deviceLabels : ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: deviceCounts.length > 0 ? deviceCounts : [1, 0, 0],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }
    ]
  };

  // 3. Browsers Share Configuration
  const browserLabels = breakdowns.topBrowsers?.map(b => b.browser || 'Chrome') || [];
  const browserCounts = breakdowns.topBrowsers?.map(b => b.count || 0) || [];

  const browserBarData = {
    labels: browserLabels.length > 0 ? browserLabels : ['Chrome'],
    datasets: [
      {
        label: 'Sessions Count',
        data: browserCounts.length > 0 ? browserCounts : [0],
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderRadius: 8
      }
    ]
  };

  // 4. Countries Share Configuration
  const countryLabels = breakdowns.topCountries?.map(c => c.country || 'India') || [];
  const countryCounts = breakdowns.topCountries?.map(c => c.count || 0) || [];

  const countryBarData = {
    labels: countryLabels.length > 0 ? countryLabels : ['India'],
    datasets: [
      {
        label: 'Sessions Count',
        data: countryCounts.length > 0 ? countryCounts : [0],
        backgroundColor: 'rgba(236, 72, 153, 0.75)',
        borderRadius: 8
      }
    ]
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header title */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Visitor Tracker & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 font-light text-sm">Monitor recruiter traffic, downloads, active sessions, and geographical demographics.</p>
        </div>

        {/* METRIC CARD GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Total Visitors</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{metrics.totalVisitors}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 block">Total logged connections</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
              <FiUsers />
            </div>
          </div>

          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Today's Visits</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{metrics.todayVisitors}</span>
              <span className="text-xs text-green-500 mt-1.5 block">Active daily connections</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-xl">
              <FiTrendingUp />
            </div>
          </div>

          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Resume Downloads</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{metrics.downloads}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 block">PDF save operations</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-xl">
              <FiDownload />
            </div>
          </div>

          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">Active Users</span>
              <span className="text-3xl font-black text-slate-800 dark:text-white mt-1 block">{metrics.loggedInUsers}</span>
              <span className="text-xs text-blue-500 font-semibold mt-1.5 block animate-pulse">● Currently Online</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
              <FiClock />
            </div>
          </div>
        </div>

        {/* GRAPH GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Timeline Chart */}
          <div className="lg:col-span-2 glass-panel border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Traffic Timeline</h3>
            <div className="h-64">
              <Line 
                data={lineChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Devices Breakdown Chart */}
          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider">Device Profiles</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
                }}
              />
            </div>
          </div>
        </div>

        {/* ADDITIONAL METRICS CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FiGlobe className="text-primary" /> Top Geographics</h3>
            <div className="h-64">
              <Bar 
                data={countryBarData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>

          <div className="glass-panel border border-slate-200 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FiMonitor className="text-indigo-500" /> Web Browser Breakdown</h3>
            <div className="h-64">
              <Bar 
                data={browserBarData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
        </div>

        {/* REGISTERED VISITORS TABLE */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800/85 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Registered Visitor Accounts</h3>
              <p className="text-xs text-slate-500 mt-1">Manage profiles and view registration listings</p>
            </div>
            <div className="relative max-w-sm w-full">
              <FiSearch className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-850">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email / Phone</th>
                  <th className="py-4 px-6">Profession / Company</th>
                  <th className="py-4 px-6">Country</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-xs text-slate-450 dark:text-slate-500 font-light">No registered visitor profiles found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{u.name || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{u.email}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.phone || 'No phone'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold">{u.profession || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{u.company || 'Individual'}</div>
                      </td>
                      <td className="py-4 px-6">{u.country || 'Unknown'}</td>
                      <td className="py-4 px-6">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors text-base"
                          title="Delete Profile"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT SESSION LOG TIMELINE */}
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-6">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FiClock className="text-primary" /> Live Traffic Stream</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {breakdowns.recentVisitors?.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6 font-light">No sessions recorded yet.</p>
            ) : (
              breakdowns.recentVisitors?.map((session, i) => (
                <div 
                  key={session.id || i}
                  className="p-4 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white">{session.name || 'Guest Visitor'}</span>
                      {session.email && <span className="text-[10px] text-slate-400 font-light">({session.email})</span>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400">
                      <div>IP: <span className="font-medium text-slate-650 dark:text-slate-350">{session.ip_address || '127.0.0.1'}</span></div>
                      <div>Browser: <span className="font-medium text-slate-650 dark:text-slate-350">{session.browser || 'Unknown'}</span></div>
                      <div>OS: <span className="font-medium text-slate-650 dark:text-slate-350">{session.os || 'Unknown'}</span></div>
                      <div>Device: <span className="font-medium text-slate-650 dark:text-slate-350">{session.device_type || 'Desktop'}</span></div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">{session.country}</span>
                    <div className="text-[10px] text-slate-400 mt-2">Active: {new Date(session.last_activity).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
