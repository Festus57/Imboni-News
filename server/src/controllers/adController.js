import Advertiser from '../models/Advertiser.js';
import AdCampaign from '../models/AdCampaign.js';
import AdRequest from '../models/AdRequest.js';
import Invoice from '../models/Invoice.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// @desc   Get active ad campaigns for a placement (public)
// @route  GET /api/ads/active?placement=top_banner
// @access Public
export const getActiveAds = async (req, res, next) => {
  try {
    const filter = { status: 'active' };
    if (req.query.placement) filter.placement = req.query.placement;

    const now = new Date();
    // Use $or so campaigns without dates (or with very old dates) still show
    filter.$and = [
      { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
      { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
    ];

    const campaigns = await AdCampaign.find(filter)
      .populate('advertiser', 'companyName email logo')
      .select('name placement imageUrl videoUrl adContent adType destinationUrl altText advertiser impressions clicks')
      .lean();

    sendSuccess(res, { campaigns });
  } catch (err) {
    next(err);
  }
};

// @desc   Track ad impression / click
// @route  POST /api/ads/:id/track
// @access Public
export const trackAdEvent = async (req, res, next) => {
  try {
    const { type } = req.body; // 'impression' or 'click'
    const update = type === 'click' ? { $inc: { clicks: 1 } } : { $inc: { impressions: 1 } };
    await AdCampaign.findByIdAndUpdate(req.params.id, update);
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @desc   Submit advertising request (public form)
// @route  POST /api/ads/request
// @access Public
export const submitAdRequest = async (req, res, next) => {
  try {
    const {
      companyName, contactName, email, phone, message,
      requestedPackage, duration, adType, mediaUrl, adContent, destinationUrl, placement,
    } = req.body;

    if (!companyName || !contactName || !email) {
      return sendError(res, 'Company name, contact name, and email are required.', 400);
    }

    const request = await AdRequest.create({
      companyName, contactName, email, phone: phone || '', message: message || '',
      requestedPackage: requestedPackage || 'business',
      duration: duration || '1month',
      adType: adType || 'image',
      mediaUrl: mediaUrl || '',
      adContent: adContent || '',
      destinationUrl: destinationUrl || '',
      placement: placement || 'top_banner',
    });

    sendSuccess(res, { request }, 'Ubusabe bwawe bwakiriwe! Tuzakuvugisha vuba.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Check ad request status by email (public)
// @route  GET /api/ads/request-status?email=...
// @access Public
export const checkRequestStatus = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return sendError(res, 'Email is required.', 400);

    const requests = await AdRequest.find({ email: email.toLowerCase() })
      .select('companyName requestedPackage status adminNote createdAt handledAt')
      .sort({ createdAt: -1 });

    if (!requests.length) {
      return sendSuccess(res, { requests: [] }, 'Nta busabe bubonetse kuri iyi email.');
    }

    sendSuccess(res, { requests });
  } catch (err) {
    next(err);
  }
};

// ─── CMS ─────────────────────────────────────────────────────────────────────

// @desc   Get all advertisers
// @route  GET /api/ads/advertisers
// @access Ad Manager, Admin
export const getAdvertisers = async (req, res, next) => {
  try {
    const advertisers = await Advertiser.find().sort({ createdAt: -1 });
    sendSuccess(res, { advertisers });
  } catch (err) {
    next(err);
  }
};

// @desc   Create advertiser
// @route  POST /api/ads/advertisers
// @access Ad Manager, Admin
export const createAdvertiser = async (req, res, next) => {
  try {
    const advertiser = await Advertiser.create(req.body);
    sendSuccess(res, { advertiser }, 'Advertiser created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Get all campaigns
// @route  GET /api/ads/campaigns
// @access Ad Manager, Admin
export const getCampaigns = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const campaigns = await AdCampaign.find(filter)
      .populate('advertiser', 'companyName email')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    sendSuccess(res, { campaigns });
  } catch (err) {
    next(err);
  }
};

// @desc   Create campaign
// @route  POST /api/ads/campaigns
// @access Ad Manager, Admin
export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.create({ ...req.body, managedBy: req.user._id });
    sendSuccess(res, { campaign }, 'Campaign created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Approve campaign
// @route  PATCH /api/ads/campaigns/:id/approve
// @access Admin
export const approveCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    sendSuccess(res, { campaign }, 'Campaign approved.');
  } catch (err) {
    next(err);
  }
};

// @desc   Activate campaign (go live)
// @route  PATCH /api/ads/campaigns/:id/activate
// @access Admin, Ad Manager
export const activateCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    sendSuccess(res, { campaign }, 'Campaign is now active.');
  } catch (err) {
    next(err);
  }
};

// @desc   Get all ad requests
// @route  GET /api/ads/requests
// @access Ad Manager, Admin
export const getAdRequests = async (req, res, next) => {
  try {
    const requests = await AdRequest.find().sort({ createdAt: -1 });
    sendSuccess(res, { requests });
  } catch (err) {
    next(err);
  }
};

// @desc   Accept an ad request (converts to advertiser + campaign draft)
// @route  PATCH /api/ads/requests/:id/accept
// @access Ad Manager, Admin
export const acceptAdRequest = async (req, res, next) => {
  try {
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 'Ubusabe ntibubonetse.', 404);

    request.status = 'converted';
    request.handledBy = req.user._id;
    request.handledAt = new Date();
    request.adminNote = req.body.note || '';
    await request.save();

    sendSuccess(res, { request }, 'Ubusabe bwemewe! Mushoramari yongeweho.');
  } catch (err) {
    next(err);
  }
};

// @desc   Decline an ad request
// @route  PATCH /api/ads/requests/:id/decline
// @access Ad Manager, Admin
export const declineAdRequest = async (req, res, next) => {
  try {
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 'Ubusabe ntibubonetse.', 404);

    request.status = 'declined';
    request.handledBy = req.user._id;
    request.handledAt = new Date();
    request.adminNote = req.body.reason || '';
    await request.save();

    sendSuccess(res, { request }, 'Ubusabe buranzwe.');
  } catch (err) {
    next(err);
  }
};

// @desc   Update campaign
// @route  PUT /api/ads/campaigns/:id
// @access Ad Manager, Admin
export const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.findByIdAndUpdate(
      req.params.id,
      { ...req.body, managedBy: req.user._id },
      { new: true, runValidators: true }
    ).populate('advertiser', 'companyName email');
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    sendSuccess(res, { campaign }, 'Campaign updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete campaign
// @route  DELETE /api/ads/campaigns/:id
// @access Ad Manager, Admin
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.findByIdAndDelete(req.params.id);
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    sendSuccess(res, {}, 'Campaign deleted.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete an ad request
// @route  DELETE /api/ads/requests/:id
// @access Ad Manager, Admin
export const deleteAdRequest = async (req, res, next) => {
  try {
    const request = await AdRequest.findByIdAndDelete(req.params.id);
    if (!request) return sendError(res, 'Request not found.', 404);
    sendSuccess(res, {}, 'Request deleted.');
  } catch (err) {
    next(err);
  }
};
// @route  GET /api/ads/invoices
// @access Ad Manager, Admin
export const getInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('campaign', 'name package')
      .populate('advertiser', 'companyName')
      .sort({ createdAt: -1 });
    sendSuccess(res, { invoices });
  } catch (err) {
    next(err);
  }
};

// @desc   Create invoice
// @route  POST /api/ads/invoices
// @access Ad Manager, Admin
export const createInvoice = async (req, res, next) => {
  try {
    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}-${new Date().getFullYear()}`;
    const invoice = await Invoice.create({ ...req.body, invoiceNumber, issuedBy: req.user._id });
    sendSuccess(res, { invoice }, 'Invoice created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Delete invoice
// @route  DELETE /api/ads/invoices/:id
// @access Admin
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return sendError(res, 'Invoice not found.', 404);
    sendSuccess(res, {}, 'Invoice deleted.');
  } catch (err) {
    next(err);
  }
};
// @route  PATCH /api/ads/invoices/:id/pay
// @access Admin
export const markInvoicePaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!invoice) return sendError(res, 'Invoice not found.', 404);
    sendSuccess(res, { invoice }, 'Invoice marked as paid.');
  } catch (err) {
    next(err);
  }
};
