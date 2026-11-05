import express from 'express';
import {
  getComments, getCmsComments,
  createComment, approveComment, rejectComment, deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isEditor } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public — get approved comments for an article
router.get('/', getComments);

// CMS — moderation
router.get('/cms', protect, isEditor, getCmsComments);
router.patch('/:id/approve', protect, isEditor, approveComment);
router.patch('/:id/reject',  protect, isEditor, rejectComment);

// Authenticated — post & delete
router.post('/', protect, createComment);
router.delete('/:id', protect, deleteComment);

export default router;
