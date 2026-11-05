import NewsTip from '../models/NewsTip.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Submit a news tip (public)
// @route  POST /api/newstips
// @access Public
export const submitTip = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, attachmentUrl, district } = req.body;
    if (!subject || !message) return sendError(res, 'Subject and message are required.', 400);
    const tip = await NewsTip.create({
      name: String(name || 'Anonymous').trim().slice(0, 100),
      email: String(email || '').trim().toLowerCase(),
      phone: String(phone || '').trim(),
      subject: String(subject).trim().slice(0, 200),
      message: String(message).trim().slice(0, 5000),
      attachmentUrl: String(attachmentUrl || '').trim(),
      district: String(district || '').trim(),
    });
    sendSuccess(res, { _id: tip._id }, 'Ikibazo cyawe cyakiriwe. Murakoze!', 201);
  } catch (err) { next(err); }
};

// @desc   Get all news tips (CMS)
// @route  GET /api/newstips
// @access Editor+
export const getTips = async (req, res, next) => {
  try {
    const page  = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [tips, total] = await Promise.all([
      NewsTip.find(filter)
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NewsTip.countDocuments(filter),
    ]);
    sendSuccess(res, { tips, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc   Update tip status / assign
// @route  PATCH /api/newstips/:id
// @access Editor+
export const updateTip = async (req, res, next) => {
  try {
    const allowed = ['status', 'assignedTo'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([k]) => allowed.includes(k)));
    const tip = await NewsTip.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
      .populate('assignedTo', 'name');
    if (!tip) return sendError(res, 'Tip not found.', 404);
    sendSuccess(res, { tip }, 'Tip updated.');
  } catch (err) { next(err); }
};

// @desc   Delete tip
// @route  DELETE /api/newstips/:id
// @access Admin+
export const deleteTip = async (req, res, next) => {
  try {
    const tip = await NewsTip.findByIdAndDelete(req.params.id);
    if (!tip) return sendError(res, 'Tip not found.', 404);
    sendSuccess(res, {}, 'Tip deleted.');
  } catch (err) { next(err); }
};
