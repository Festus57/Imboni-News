import Advertiser from '../models/Advertiser.js';
import AdCampaign from '../models/AdCampaign.js';
import AdRequest from '../models/AdRequest.js';
import Invoice from '../models/Invoice.js';
import { randomBytes } from 'crypto';
import { sendSuccess, sendError } from '../utils/apiResponse.js';


const parseCampaignDate = (value, endOfDay = false) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const hour = endOfDay ? 23 : 0;
    const minute = endOfDay ? 59 : 0;
    const second = endOfDay ? 59 : 0;
    const millisecond = endOfDay ? 999 : 0;
    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const timeZone = process.env.APP_TIME_ZONE || 'Africa/Kigali';
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(localAsUtc));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const zoneAsUtc = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second), millisecond);
    return new Date(localAsUtc - (zoneAsUtc - localAsUtc));
  }
  return new Date(value);
};

const expireCampaigns = () => AdCampaign.updateMany(
  { status: { $in: ['active', 'paused'] }, endDate: { $lt: new Date() } },
  { $set: { status: 'expired' } }
);

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// @desc   Get active ad campaigns for a placement (public)
// @route  GET /api/ads/active?placement=top_banner
// @access Public
export const getActiveAds = async (req, res, next) => {
  try {
    await expireCampaigns();
    const activeAdvertiserIds = await Advertiser.distinct('_id', { isActive: { $ne: false } });
    const filter = { status: 'active', advertiser: { $in: activeAdvertiserIds } };
    if (req.query.placement) filter.placement = req.query.placement;

    const now = new Date();
    // Use $or so campaigns without dates (or with very old dates) still show
    filter.$and = [
      { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
      { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
    ];

    const campaigns = await AdCampaign.find(filter)
      .populate('advertiser', 'companyName logo')
      .select('name placement imageUrl videoUrl adContent adType destinationUrl altText advertiser')
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
    if (!['impression', 'click'].includes(type)) return sendError(res, 'Invalid tracking event.', 400);
    const field = type === 'click' ? 'clicks' : 'impressions';
    const campaign = await AdCampaign.findOneAndUpdate(
      { _id: req.params.id, status: 'active', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
      { $inc: { [field]: 1 } },
      { new: false }
    );
    if (!campaign) return sendError(res, 'Active campaign not found.', 404);
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

    const trackingCode = randomBytes(5).toString('hex').toUpperCase();
    const request = await AdRequest.create({
      companyName, contactName, email: String(email).trim().toLowerCase(), trackingCode, phone: phone || '', message: message || '',
      requestedPackage: requestedPackage || 'business',
      duration: duration || '1month',
      adType: adType || 'image',
      mediaUrl: mediaUrl || '',
      adContent: adContent || '',
      destinationUrl: destinationUrl || '',
      placement: placement || 'top_banner',
    });

    sendSuccess(res, { request: { _id: request._id, status: request.status }, trackingCode }, 'Ubusabe bwawe bwakiriwe! Bika kode yo gukurikirana ubusabe bwawe.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Check ad request status by email (public)
// @route  GET /api/ads/request-status?email=...
// @access Public
export const checkRequestStatus = async (req, res, next) => {
  try {
    const { email, trackingCode } = req.query;
    if (!email || !trackingCode) return sendError(res, 'Email and tracking code are required.', 400);

    const requests = await AdRequest.find({ email: String(email).trim().toLowerCase(), trackingCode: String(trackingCode).trim().toUpperCase() })
      .select('requestedPackage status createdAt')
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
    const { companyName, contactName, email, phone, website, address, notes } = req.body || {};
    const advertiser = await Advertiser.create({ companyName, contactName, email: String(email || '').trim().toLowerCase(), phone, website, address, notes });
    sendSuccess(res, { advertiser }, 'Advertiser created.', 201);
  } catch (err) {
    next(err);
  }
};

// Update advertiser profile. Account state is managed separately.
export const updateAdvertiser = async (req, res, next) => {
  try {
    const allowed = ['companyName', 'contactName', 'email', 'phone', 'website', 'address', 'notes'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
    const advertiser = await Advertiser.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!advertiser) return sendError(res, 'Advertiser not found.', 404);
    sendSuccess(res, { advertiser }, 'Advertiser updated.');
  } catch (err) { next(err); }
};

export const toggleAdvertiserStatus = async (req, res, next) => {
  try {
    const advertiser = await Advertiser.findById(req.params.id);
    if (!advertiser) return sendError(res, 'Advertiser not found.', 404);
    advertiser.isActive = !advertiser.isActive;
    await advertiser.save();
    sendSuccess(res, { advertiser }, advertiser.isActive ? 'Advertiser activated.' : 'Advertiser deactivated.');
  } catch (err) { next(err); }
};

// Deactivate instead of deleting records referenced by campaigns/invoices.
export const deleteAdvertiser = async (req, res, next) => {
  try {
    const advertiser = await Advertiser.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!advertiser) return sendError(res, 'Advertiser not found.', 404);
    sendSuccess(res, { advertiser }, 'Advertiser deactivated.');
  } catch (err) { next(err); }
};

// @desc   Get all campaigns
// @route  GET /api/ads/campaigns
// @access Ad Manager, Admin
export const getCampaigns = async (req, res, next) => {
  try {
    await expireCampaigns();
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
    const allowed = ['advertiser', 'name', 'package', 'placement', 'imageUrl', 'videoUrl', 'adContent', 'adType', 'destinationUrl', 'altText', 'startDate', 'endDate', 'priceRwf'];
    const data = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    const advertiser = await Advertiser.findOne({ _id: data.advertiser, isActive: { $ne: false } });
    if (!advertiser) return sendError(res, 'Select an active advertiser.', 400);
    const start = parseCampaignDate(data.startDate);
    const end = parseCampaignDate(data.endDate, true);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return sendError(res, 'Campaign end date must be after its start date.', 400);
    if (!Number.isFinite(Number(data.priceRwf)) || Number(data.priceRwf) <= 0) return sendError(res, 'Campaign price must be greater than zero.', 400);
    if (data.destinationUrl) {
      let destination;
      try { destination = new URL(data.destinationUrl); } catch { return sendError(res, 'A valid destination URL is required.', 400); }
      if (!['http:', 'https:'].includes(destination.protocol)) return sendError(res, 'Destination URL must use HTTP or HTTPS.', 400);
    } else return sendError(res, 'Destination URL is required.', 400);
    if ((data.adType === 'image' && !data.imageUrl) || (data.adType === 'video' && !data.videoUrl) || (data.adType === 'content' && !data.adContent)) return sendError(res, 'Provide the creative content for the selected ad type.', 400);
    const campaign = await AdCampaign.create({ ...data, startDate: start, endDate: end, priceRwf: Number(data.priceRwf), status: 'pending', managedBy: req.user._id });
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
    const campaign = await AdCampaign.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    if (!campaign) return sendError(res, 'Pending campaign not found. It may already have been reviewed.', 404);
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
    const now = new Date();
    const campaign = await AdCampaign.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['approved', 'paused'] }, startDate: { $lte: now }, endDate: { $gte: now } },
      { status: 'active' },
      { new: true }
    );
    if (!campaign) return sendError(res, 'Only approved campaigns within their scheduled dates can be activated.', 409);
    sendSuccess(res, { campaign }, 'Campaign is now active.');
  } catch (err) {
    next(err);
  }
};

// Pause a running campaign without deleting its history.
export const pauseCampaign = async (req, res, next) => {
  try {
    const campaign = await AdCampaign.findOneAndUpdate(
      { _id: req.params.id, status: 'active' },
      { status: 'paused' },
      { new: true }
    );
    if (!campaign) return sendError(res, 'Active campaign not found.', 404);
    sendSuccess(res, { campaign }, 'Campaign paused.');
  } catch (err) { next(err); }
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

// Mark a request as contacted without pretending a campaign has been created.
export const contactAdRequest = async (req, res, next) => {
  try {
    const request = await AdRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'new' },
      { status: 'contacted', handledBy: req.user._id, handledAt: new Date(), adminNote: String(req.body?.note || '').slice(0, 2000) },
      { new: true, runValidators: true }
    );
    if (!request) return sendError(res, 'New request not found or already processed.', 409);
    sendSuccess(res, { request }, 'Request marked as contacted.');
  } catch (err) { next(err); }
};

// Convert a request into exactly one campaign. sourceRequest has a unique index,
// so retrying after a partial failure will reuse the campaign instead of duplicating it.
export const convertAdRequestToCampaign = async (req, res, next) => {
  try {
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 'Request not found.', 404);

    let campaign = await AdCampaign.findOne({ sourceRequest: request._id });
    if (campaign) {
      request.status = 'converted';
      request.campaign = campaign._id;
      request.handledBy = req.user._id;
      request.handledAt = request.handledAt || new Date();
      await request.save();
      return sendSuccess(res, { request, campaign }, 'Existing campaign linked to this request.');
    }
    if (!['new', 'contacted', 'converting'].includes(request.status)) {
      return sendError(res, 'This request cannot be converted in its current status.', 409);
    }

    const locked = await AdRequest.findOneAndUpdate(
      { _id: request._id, status: { $in: ['new', 'contacted'] }, campaign: null },
      { status: 'converting', handledBy: req.user._id, handledAt: new Date() },
      { new: true }
    );
    if (!locked && request.status !== 'converting') return sendError(res, 'This request is already being processed.', 409);

    const allowed = ['advertiser', 'name', 'package', 'placement', 'imageUrl', 'videoUrl', 'adContent', 'adType', 'destinationUrl', 'altText', 'startDate', 'endDate', 'priceRwf'];
    const data = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    const advertiser = await Advertiser.findOne({ _id: data.advertiser, isActive: { $ne: false } });
    if (!advertiser) {
      await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' });
      return sendError(res, 'Select an active advertiser.', 400);
    }
    const start = parseCampaignDate(data.startDate);
    const end = parseCampaignDate(data.endDate, true);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' });
      return sendError(res, 'Campaign end date must be after its start date.', 400);
    }
    let destination;
    try { destination = new URL(data.destinationUrl); } catch { await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' }); return sendError(res, 'A valid destination URL is required.', 400); }
    if (!['http:', 'https:'].includes(destination.protocol)) { await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' }); return sendError(res, 'Destination URL must use HTTP or HTTPS.', 400); }
    if ((data.adType === 'image' && !data.imageUrl) || (data.adType === 'video' && !data.videoUrl) || (data.adType === 'content' && !data.adContent)) { await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' }); return sendError(res, 'Provide the creative content for the selected ad type.', 400); }
    const price = Number(data.priceRwf);
    if (!Number.isFinite(price) || price <= 0) {
      await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' });
      return sendError(res, 'Campaign price must be greater than zero.', 400);
    }
    try {
      campaign = await AdCampaign.create({ ...data, startDate: start, endDate: end, sourceRequest: request._id, priceRwf: price, status: 'pending', managedBy: req.user._id });
      request.status = 'converted';
      request.campaign = campaign._id;
      request.adminNote = String(req.body?.note || 'Campaign created from advertising request.').slice(0, 2000);
      await request.save();
      return sendSuccess(res, { request, campaign }, 'Request converted into a campaign.', 201);
    } catch (error) {
      // Unique sourceRequest makes retry safe if campaign creation succeeded but request save failed.
      const existing = await AdCampaign.findOne({ sourceRequest: request._id });
      if (existing) {
        request.status = 'converted';
        request.campaign = existing._id;
        await request.save();
        return sendSuccess(res, { request, campaign: existing }, 'Request converted and campaign recovered.');
      }
      await AdRequest.findByIdAndUpdate(request._id, { status: 'contacted' });
      throw error;
    }
  } catch (err) { next(err); }
};

// @desc   Decline an ad request
// @route  PATCH /api/ads/requests/:id/decline
// @access Ad Manager, Admin
export const declineAdRequest = async (req, res, next) => {
  try {
    const request = await AdRequest.findOne({ _id: req.params.id, status: { $in: ['new', 'contacted'] } });
    if (!request) return sendError(res, 'Request not found or already processed.', 404);

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
    const allowed = ['advertiser', 'name', 'package', 'placement', 'imageUrl', 'videoUrl', 'adContent', 'adType', 'destinationUrl', 'altText', 'startDate', 'endDate', 'priceRwf'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.advertiser) {
      const advertiser = await Advertiser.findOne({ _id: updates.advertiser, isActive: { $ne: false } });
      if (!advertiser) return sendError(res, 'Select an active advertiser.', 400);
      const current = await AdCampaign.findById(req.params.id).select('advertiser');
      if (!current) return sendError(res, 'Campaign not found.', 404);
      if (String(current.advertiser) !== String(updates.advertiser) && await Invoice.exists({ campaign: current._id })) return sendError(res, 'Campaign advertiser cannot be changed after an invoice has been issued.', 409);
    }
    if (updates.startDate || updates.endDate) {
      const current = await AdCampaign.findById(req.params.id).select('startDate endDate');
      if (!current) return sendError(res, 'Campaign not found.', 404);
      const start = updates.startDate ? parseCampaignDate(updates.startDate) : new Date(current.startDate);
      const end = updates.endDate ? parseCampaignDate(updates.endDate, true) : new Date(current.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return sendError(res, 'Campaign end date must be after its start date.', 400);
      updates.startDate = start;
      updates.endDate = end;
    }
    if (updates.priceRwf !== undefined && (!Number.isFinite(Number(updates.priceRwf)) || Number(updates.priceRwf) <= 0)) return sendError(res, 'Campaign price must be greater than zero.', 400);
    if (updates.destinationUrl) {
      try { const destination = new URL(updates.destinationUrl); if (!['http:', 'https:'].includes(destination.protocol)) throw new Error(); }
      catch { return sendError(res, 'A valid HTTP or HTTPS destination URL is required.', 400); }
    }
    const campaign = await AdCampaign.findByIdAndUpdate(
      req.params.id,
      { $set: { ...updates, managedBy: req.user._id } },
      { new: true, runValidators: true }
    ).populate('advertiser', 'companyName');
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
    const campaign = await AdCampaign.findById(req.params.id);
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    const [linkedInvoices, linkedRequest] = await Promise.all([Invoice.exists({ campaign: campaign._id }), AdRequest.exists({ campaign: campaign._id })]);
    if (linkedInvoices || linkedRequest || campaign.sourceRequest) return sendError(res, 'This campaign has request or invoice history and cannot be deleted. Pause it instead.', 409);
    await campaign.deleteOne();
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
    const request = await AdRequest.findById(req.params.id);
    if (!request) return sendError(res, 'Request not found.', 404);
    if (['converting', 'converted'].includes(request.status) || request.campaign) return sendError(res, 'Converted request history cannot be deleted.', 409);
    await request.deleteOne();
    sendSuccess(res, {}, 'Request deleted.');
  } catch (err) {
    next(err);
  }
};
// @route  GET /api/ads/invoices
// @access Ad Manager, Admin
export const getInvoices = async (req, res, next) => {
  try {
    await Invoice.updateMany({ status: 'unpaid', dueDate: { $lt: new Date() } }, { $set: { status: 'overdue' } });
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
    const { campaign: campaignId, advertiser: advertiserId, amountRwf, dueDate, notes } = req.body || {};
    const campaign = await AdCampaign.findById(campaignId).select('advertiser');
    if (!campaign) return sendError(res, 'Campaign not found.', 404);
    if (String(campaign.advertiser) !== String(advertiserId)) return sendError(res, 'The selected advertiser does not own this campaign.', 400);
    const amount = Number(amountRwf);
    const due = parseCampaignDate(dueDate, true);
    if (!Number.isFinite(amount) || amount <= 0) return sendError(res, 'Invoice amount must be greater than zero.', 400);
    if (Number.isNaN(due.getTime())) return sendError(res, 'A valid due date is required.', 400);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
    const invoice = await Invoice.create({ campaign: campaignId, advertiser: advertiserId, amountRwf: amount, dueDate: due, notes: String(notes || '').slice(0, 2000), invoiceNumber, status: 'unpaid', paidAt: null, issuedBy: req.user._id });
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
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return sendError(res, 'Invoice not found.', 404);
    if (invoice.status === 'paid') return sendError(res, 'Paid invoices cannot be deleted. Keep them for financial records.', 409);
    invoice.status = 'cancelled';
    await invoice.save();
    sendSuccess(res, { invoice }, 'Invoice cancelled.');
  } catch (err) {
    next(err);
  }
};
// @route  PATCH /api/ads/invoices/:id/pay
// @access Admin
export const markInvoicePaid = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['unpaid', 'overdue'] } },
      { status: 'paid', paidAt: new Date() },
      { new: true }
    );
    if (!invoice) return sendError(res, 'Invoice not found or is not payable.', 404);
    sendSuccess(res, { invoice }, 'Invoice marked as paid.');
  } catch (err) {
    next(err);
  }
};
