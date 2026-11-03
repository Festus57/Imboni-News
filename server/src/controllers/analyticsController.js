import Article from '../models/Article.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import AdCampaign from '../models/AdCampaign.js';
import AdRequest from '../models/AdRequest.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Simple in-memory visitor tracking (resets on server restart)
// For production use a DB collection or Redis
const visitorLog = {
  total: 0,
  today: 0,
  todayDate: new Date().toDateString(),
  // Store unique IPs for today to avoid duplicate counts
  todayIPs: new Set(),
  allTimeIPs: new Set(),
};

// @desc   Track a page visit (public — called by client on every page load)
// @route  POST /api/analytics/visit
// @access Public
export const trackVisit = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    const today = new Date().toDateString();

    // Reset today counter at midnight
    if (visitorLog.todayDate !== today) {
      visitorLog.todayDate = today;
      visitorLog.today = 0;
      visitorLog.todayIPs = new Set();
    }

    // Count unique IPs per day
    if (!visitorLog.todayIPs.has(ip)) {
      visitorLog.todayIPs.add(ip);
      visitorLog.today += 1;
    }

    // Count unique IPs all-time
    if (!visitorLog.allTimeIPs.has(ip)) {
      visitorLog.allTimeIPs.add(ip);
      visitorLog.total += 1;
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(200).json({ success: true }); // never fail silently
  }
};

// @desc   Get dashboard stats
// @route  GET /api/analytics/dashboard
// @access Admin+
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalArticles,
      publishedArticles,
      pendingReview,
      totalVideos,
      totalReaders,
      totalStaff,
      activeCampaigns,
      totalViewsAgg,
      newRequestsCount,
    ] = await Promise.all([
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'pending_review' }),
      Video.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'reader' }),
      User.countDocuments({ role: { $ne: 'reader' } }),
      AdCampaign.countDocuments({ status: 'active' }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      AdRequest.countDocuments({ status: 'new' }).catch(() => 0),
    ]);

    const recentArticles = await Article.find({ status: 'published' })
      .populate('author', 'name')
      .populate('category', 'name')
      .select('title publishedAt views')
      .sort({ publishedAt: -1 })
      .limit(5);

    sendSuccess(res, {
      stats: {
        totalArticles,
        publishedArticles,
        pendingReview,
        totalVideos,
        totalReaders,
        totalStaff,
        activeCampaigns,
        totalViews: totalViewsAgg[0]?.total || 0,
        newAdRequests: newRequestsCount,
        // Visitor stats (anonymous + registered)
        siteVisitorsToday: visitorLog.today,
        siteVisitorsTotal: visitorLog.total,
      },
      recentArticles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get top articles by views
// @route  GET /api/analytics/top-articles
// @access Admin+
export const getTopArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'name')
      .populate('category', 'name')
      .select('title slug views shares publishedAt')
      .sort({ views: -1 })
      .limit(10);
    sendSuccess(res, { articles });
  } catch (err) {
    next(err);
  }
};
