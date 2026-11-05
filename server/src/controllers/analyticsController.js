import Article from '../models/Article.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import AdCampaign from '../models/AdCampaign.js';
import AdRequest from '../models/AdRequest.js';
import Visitor from '../models/Visitor.js';
import DailyVisitor from '../models/DailyVisitor.js';
import { createHmac } from 'crypto';
import { sendSuccess } from '../utils/apiResponse.js';

// @desc   Track a page visit (public — called by client on every page load)
// @route  POST /api/analytics/visit
// @access Public
export const trackVisit = async (req, res) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(200).json({ success: true });
    const visitorHash = createHmac('sha256', secret).update(String(ip)).digest('hex');
    const timeZone = process.env.APP_TIME_ZONE || 'Africa/Kigali';
    const day = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    await Promise.all([
      Visitor.findOneAndUpdate(
        { visitorHash },
        { $set: { lastSeenAt: new Date() }, $setOnInsert: { firstSeenAt: new Date() }, $inc: { visits: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ),
      DailyVisitor.updateOne({ day, visitorHash }, { $setOnInsert: { day, visitorHash } }, { upsert: true }),
    ]);
    return res.status(200).json({ success: true });
  } catch (error) {
    // Concurrent first visits may race against unique indexes; analytics must not break page loads.
    if (error.code === 11000) return res.status(200).json({ success: true });
    return res.status(200).json({ success: true });
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
      siteVisitorsToday,
      siteVisitorsTotal,
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
      DailyVisitor.countDocuments({ day: new Intl.DateTimeFormat('en-CA', { timeZone: process.env.APP_TIME_ZONE || 'Africa/Kigali', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) }),
      Visitor.countDocuments(),
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
        // Unique visitor estimates based on a keyed, non-reversible IP hash.
        siteVisitorsToday,
        siteVisitorsTotal,
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
