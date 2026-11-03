import express from 'express';
import {
  getActiveAds, trackAdEvent, submitAdRequest, checkRequestStatus,
  getAdvertisers, createAdvertiser,
  getCampaigns, createCampaign, updateCampaign, deleteCampaign, approveCampaign, activateCampaign,
  getAdRequests, acceptAdRequest, declineAdRequest, deleteAdRequest,
  getInvoices, createInvoice, markInvoicePaid, deleteInvoice,
} from '../controllers/adController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin, isAdManager, isStaff } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public
router.get('/active', getActiveAds);
router.post('/:id/track', trackAdEvent);
router.post('/request', submitAdRequest);
router.get('/request-status', checkRequestStatus);

// CMS — Advertisers (read: all staff, write: ad manager+)
router.get('/advertisers', protect, isStaff, getAdvertisers);
router.post('/advertisers', protect, isAdManager, createAdvertiser);

// CMS — Campaigns (read: all staff, write: ad manager+)
router.get('/campaigns', protect, isStaff, getCampaigns);
router.post('/campaigns', protect, isAdManager, createCampaign);
router.put('/campaigns/:id', protect, isAdManager, updateCampaign);
router.delete('/campaigns/:id', protect, isAdManager, deleteCampaign);
router.patch('/campaigns/:id/approve', protect, isAdmin, approveCampaign);
router.patch('/campaigns/:id/activate', protect, isAdManager, activateCampaign);

// CMS — Ad Requests (read: all staff, write: ad manager+)
router.get('/requests', protect, isStaff, getAdRequests);
router.patch('/requests/:id/accept', protect, isAdManager, acceptAdRequest);
router.patch('/requests/:id/decline', protect, isAdManager, declineAdRequest);
router.delete('/requests/:id', protect, isAdManager, deleteAdRequest);

// CMS — Invoices (read: all staff, write: ad manager+)
router.get('/invoices', protect, isStaff, getInvoices);
router.post('/invoices', protect, isAdManager, createInvoice);
router.patch('/invoices/:id/pay', protect, isAdmin, markInvoicePaid);
router.delete('/invoices/:id', protect, isAdmin, deleteInvoice);

export default router;
