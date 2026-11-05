import express from 'express';
import {
  getAnnouncements, getCmsAnnouncements,
  createAnnouncement, updateAnnouncement,
  deleteAnnouncement, toggleAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStaff, isEditor, isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAnnouncements);

// CMS
router.get('/cms', protect, isStaff, getCmsAnnouncements);
router.post('/', protect, isEditor, createAnnouncement);
router.put('/:id', protect, isEditor, updateAnnouncement);
router.delete('/:id', protect, isAdmin, deleteAnnouncement);
router.patch('/:id/toggle', protect, isEditor, toggleAnnouncement);

export default router;
