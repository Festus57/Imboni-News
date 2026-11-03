import express from 'express';
import {
  getArticles, getArticle, getCmsArticles, getCmsArticleById,
  createArticle, updateArticle, deleteArticle,
  submitForReview, publishArticle, rejectArticle,
  toggleSaveArticle,
} from '../controllers/articleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStaff, isEditor, isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ── Public ──────────────────────────────────
router.get('/', getArticles);

// ── CMS (must come BEFORE /:slug to avoid conflict) ──
router.get('/cms/all', protect, isStaff, getCmsArticles);
router.get('/:id/cms', protect, isStaff, getCmsArticleById);
router.post('/', protect, isStaff, createArticle);
router.put('/:id', protect, isStaff, updateArticle);
router.patch('/:id/submit', protect, isStaff, submitForReview);
router.patch('/:id/publish', protect, isEditor, publishArticle);
router.patch('/:id/reject', protect, isEditor, rejectArticle);
router.delete('/:id', protect, isAdmin, deleteArticle);

// ── Reader ──
router.post('/:id/save', protect, toggleSaveArticle);

// ── Public single article (last — catches :slug) ──
router.get('/:slug', getArticle);

export default router;
