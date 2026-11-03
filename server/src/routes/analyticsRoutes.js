import express from 'express';
import { getDashboardStats, getTopArticles, trackVisit } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin, isStaff } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public — track any page visit (no auth needed)
router.post('/visit', trackVisit);

// Dashboard stats — all staff can see (journalists, editors, etc.)
router.get('/dashboard', protect, isStaff, getDashboardStats);
// Top articles — admin only
router.get('/top-articles', protect, isAdmin, getTopArticles);

export default router;
