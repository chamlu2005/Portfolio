import databaseService from '../services/databaseService.js';

export const trackSession = async (req, res) => {
  const { session_id, ip, country, device, os, browser, traffic_source, referrer, duration, scroll_depth, bounce_rate } = req.body;

  if (!session_id) {
    return res.status(400).json({ success: false, message: 'session_id is required' });
  }

  try {
    // Attempt country derivation or mock if direct/unknown
    await databaseService.createVisitorLog({
      session_id,
      ip: ip || req.ip,
      country: country || 'India', // fallback default
      device: device || 'Desktop',
      os: os || 'Windows',
      browser: browser || 'Chrome',
      traffic_source: traffic_source || 'Direct',
      referrer: referrer || '',
      duration: duration || 0,
      scroll_depth: scroll_depth || 0,
      bounce_rate: bounce_rate || 0
    });

    // Notify milestone on specific unique visits counts (e.g. increments of 50)
    const logs = await databaseService.getVisitorLogs();
    const uniqueCount = new Set(logs.map(l => l.session_id)).size;
    
    if (uniqueCount % 50 === 0 && uniqueCount > 0) {
      await databaseService.createNotification(`🎉 Milestone reached! Your portfolio has hit ${uniqueCount} unique visitors.`, 'milestone');
    }

    res.json({ success: true, message: 'Session logged.' });
  } catch (err) {
    console.error('Session tracking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logEvent = async (req, res) => {
  const { metric_name, metric_value, target_id, extra_info } = req.body;

  if (!metric_name) {
    return res.status(400).json({ success: false, message: 'metric_name is required' });
  }

  try {
    await databaseService.logEvent(metric_name, metric_value, target_id, extra_info);

    if (metric_name === 'resume_download') {
      await databaseService.createNotification('📄 A recruiter downloaded Daniel Paul\'s resume.', 'recruiter');
    }

    res.json({ success: true, message: 'Analytic event logged.' });
  } catch (err) {
    console.error('Event log error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnalyticsSummary = async (req, res) => {
  try {
    const logs = await databaseService.getVisitorLogs();
    const events = await databaseService.getAnalyticsEvents();
    const messages = await databaseService.getMessages();

    // Compute basic card counts
    const totalSessions = logs.length;
    const uniqueVisitors = new Set(logs.map(l => l.session_id)).size;
    const resumeDownloads = events.filter(e => e.metric_name === 'resume_download').length;
    
    // Compute lists for charts
    // 1. Traffic sources distribution
    const trafficSources = {};
    // 2. Countries distribution
    const countries = {};
    // 3. Browsers
    const browsers = {};

    logs.forEach(l => {
      const src = l.traffic_source || 'Direct';
      trafficSources[src] = (trafficSources[src] || 0) + 1;

      const ctry = l.country || 'Unknown';
      countries[ctry] = (countries[ctry] || 0) + 1;

      const brwsr = l.browser || 'Unknown';
      browsers[brwsr] = (browsers[brwsr] || 0) + 1;
    });

    // Project view stats from events
    const projectViews = {};
    events.filter(e => e.metric_name === 'project_view').forEach(e => {
      projectViews[e.target_id] = (projectViews[e.target_id] || 0) + 1;
    });

    // Recruiters bookmarking/view activity
    const recruiterActivities = messages.map(m => ({
      name: m.recruiter_name,
      company: m.company,
      rating: m.rating,
      interview: m.interview_request,
      date: m.created_at
    }));

    // Weekly timeline calculation (grouping past 7 days)
    const dailyViews = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyViews[key] = 0;
    }

    logs.forEach(l => {
      const dateStr = new Date(l.session_start).toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyViews[dateStr] !== undefined) {
        dailyViews[dateStr]++;
      }
    });

    res.json({
      success: true,
      summary: {
        totalSessions,
        uniqueVisitors,
        resumeDownloads,
        totalMessages: messages.length,
        pendingInterviews: messages.filter(m => m.interview_request && !m.interview_date).length
      },
      charts: {
        trafficSources,
        countries,
        browsers,
        dailyViews,
        projectViews
      },
      recruiterActivities
    });
  } catch (err) {
    console.error('Analytics gathering error:', err);
    res.status(500).json({ success: false, message: 'Failed to process analytics data.' });
  }
};
