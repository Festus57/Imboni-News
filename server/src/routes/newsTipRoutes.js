import express from 'express';
import { submitTip, getTips, updateTip, deleteTip } from '../controllers/newsTipController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isEditor, isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public — submit a tip
router.post('/', submitTip);

// CMS
router.get('/',      protect, isEditor, getTips);
router.patch('/:id', protect, isEditor, updateTip);
router.delete('/:id', protect, isAdmin, deleteTip);

export default router;
