import databaseService from '../services/databaseService.js';

/**
 * Fetch Admin Dashboard Summary Metrics
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const metrics = await databaseService.getAdminDashboardMetrics();
    res.json({
      success: true,
      metrics
    });
  } catch (err) {
    console.error('Error fetching admin dashboard metrics:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
};

/**
 * Fetch Admin Traffic Analytics details (Timeline, Devices, Browsers, Countries)
 */
export const getAdminAnalyticsData = async (req, res) => {
  try {
    const analytics = await databaseService.getAdminAnalytics();
    res.json({
      success: true,
      analytics
    });
  } catch (err) {
    console.error('Error fetching admin analytics details:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics details.' });
  }
};

/**
 * Fetch Registered Users list
 */
export const getAdminUsers = async (req, res) => {
  try {
    const users = await databaseService.getAllUsers();
    res.json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Error fetching registered users list:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve users list.' });
  }
};

/**
 * Delete a user profile
 */
export const deleteAdminUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent admin from self-deleting their session
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot self-delete active admin session.' });
    }

    await databaseService.deleteUser(id);
    res.json({
      success: true,
      message: 'User has been deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Failed to delete user profile.' });
  }
};
