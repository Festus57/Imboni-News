import express from 'express';
import {
  getStaffUsers, getReaders, createStaffUser,
  toggleUserStatus, toggleFollowJournalist, deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/staff', protect, isAdmin, getStaffUsers);
router.get('/readers', protect, isAdmin, getReaders);
router.post('/staff', protect, isAdmin, createStaffUser);
router.patch('/:id/toggle-status', protect, isAdmin, toggleUserStatus);
router.delete('/:id', protect, isAdmin, deleteUser);
router.post('/:id/follow', protect, toggleFollowJournalist);

export default router;
