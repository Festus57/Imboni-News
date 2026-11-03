import express from 'express';
import {
  getAnnouncements, getCmsAnnouncements,
  createAnnouncement, updateAnnouncement,
  deleteAnnouncement, toggleAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStaff } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public
router.get('/', getAnnouncements);

// CMS
router.get('/cms', protect, isStaff, getCmsAnnouncements);
router.post('/', protect, isStaff, createAnnouncement);
router.put('/:id', protect, isStaff, updateAnnouncement);
router.delete('/:id', protect, isStaff, deleteAnnouncement);
router.patch('/:id/toggle', protect, isStaff, toggleAnnouncement);

export default router;
