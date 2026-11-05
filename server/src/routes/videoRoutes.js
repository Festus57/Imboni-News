import express from 'express';
import {
  getVideos, getVideo, getShorts, getCmsVideos,
  createVideo, updateVideo, deleteVideo, publishVideo,
  getLiveStreams, createLiveStream, updateLiveStream, deleteLiveStream,
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isVideoEditor, isAdmin, isStaff } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ── Public fixed routes (BEFORE /:slug) ──────────────
router.get('/', getVideos);
router.get('/shorts', getShorts);
router.get('/cms/all', protect, isStaff, getCmsVideos);

// ── Live Streams (BEFORE /:slug to avoid conflict) ──
router.get('/live', getLiveStreams);
router.post('/live', protect, isVideoEditor, createLiveStream);
router.put('/live/:id', protect, isVideoEditor, updateLiveStream);
router.delete('/live/:id', protect, isVideoEditor, deleteLiveStream);

// ── CMS Video actions ────────────────────────────────
router.post('/', protect, isVideoEditor, createVideo);
router.put('/:id', protect, isVideoEditor, updateVideo);
router.delete('/:id', protect, isVideoEditor, deleteVideo);
router.patch('/:id/publish', protect, isVideoEditor, publishVideo);

// ── Public — single video (LAST — catches :slug) ─────
router.get('/:slug', getVideo);

export default router;
