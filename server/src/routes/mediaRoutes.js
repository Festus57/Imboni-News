import express from 'express';
import { uploadMedia, getMedia, deleteMedia } from '../controllers/mediaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isStaff, isAdmin } from '../middleware/roleMiddleware.js';
import { uploadAny } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, isStaff, uploadAny.single('file'), uploadMedia);
router.get('/', protect, isStaff, getMedia);
router.delete('/:id', protect, isAdmin, deleteMedia);

export default router;
