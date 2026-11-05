import express from 'express';
import {
  getActiveAds, trackAdEvent, submitAdRequest, checkRequestStatus,
  getAdvertisers, createAdvertiser, updateAdvertiser, deleteAdvertiser, toggleAdvertiserStatus,
  getCampaigns, createCampaign, updateCampaign, deleteCampaign, approveCampaign, activateCampaign, pauseCampaign,
  getAdRequests, contactAdRequest, convertAdRequestToCampaign, declineAdRequest, deleteAdRequest,
  getInvoices, createInvoice, markInvoicePaid, deleteInvoice,
} from '../controllers/adController.js';
import { protect } from '../middleware/authMiddleware.js';
import { isAdmin, isAdManager } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public
router.get('/active', getActiveAds);
router.post('/:id/track', trackAdEvent);
router.post('/request', submitAdRequest);
router.get('/request-status', checkRequestStatus);

// CMS — Advertisers (ad manager and administrators)
router.get('/advertisers', protect, isAdManager, getAdvertisers);
router.post('/advertisers', protect, isAdManager, createAdvertiser);
router.put('/advertisers/:id', protect, isAdManager, updateAdvertiser);
router.delete('/advertisers/:id', protect, isAdManager, deleteAdvertiser);
router.patch('/advertisers/:id/toggle-status', protect, isAdManager, toggleAdvertiserStatus);

// CMS — Campaigns (ad manager and administrators)
router.get('/campaigns', protect, isAdManager, getCampaigns);
router.post('/campaigns', protect, isAdManager, createCampaign);
router.put('/campaigns/:id', protect, isAdManager, updateCampaign);
router.delete('/campaigns/:id', protect, isAdManager, deleteCampaign);
router.patch('/campaigns/:id/approve', protect, isAdmin, approveCampaign);
router.patch('/campaigns/:id/activate', protect, isAdManager, activateCampaign);
router.patch('/campaigns/:id/pause', protect, isAdManager, pauseCampaign);

// CMS — Ad Requests (ad manager and administrators)
router.get('/requests', protect, isAdManager, getAdRequests);
router.patch('/requests/:id/contact', protect, isAdManager, contactAdRequest);
router.post('/requests/:id/convert', protect, isAdManager, convertAdRequestToCampaign);
router.patch('/requests/:id/decline', protect, isAdManager, declineAdRequest);
router.delete('/requests/:id', protect, isAdManager, deleteAdRequest);

// CMS — Invoices (ad manager and administrators)
router.get('/invoices', protect, isAdManager, getInvoices);
router.post('/invoices', protect, isAdManager, createInvoice);
router.patch('/invoices/:id/pay', protect, isAdmin, markInvoicePaid);
router.delete('/invoices/:id', protect, isAdmin, deleteInvoice);

export default router;
