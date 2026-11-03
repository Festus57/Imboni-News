import Announcement from '../models/Announcement.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get all active announcements (public)
// @route  GET /api/announcements
// @access Public
export const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    sendSuccess(res, { announcements });
  } catch (err) { next(err); }
};

// @desc   Get ALL announcements for CMS
// @route  GET /api/announcements/cms
// @access Staff
export const getCmsAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    sendSuccess(res, { announcements });
  } catch (err) { next(err); }
};

// @desc   Create announcement
// @route  POST /api/announcements
// @access Staff
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, imageUrl, videoUrl } = req.body;
    if (!title) return sendError(res, 'Inyito ni ngombwa.', 400);
    const announcement = await Announcement.create({
      title, content: content || '',
      imageUrl: imageUrl || '',
      videoUrl: videoUrl || '',
      createdBy: req.user._id,
    });
    sendSuccess(res, { announcement }, 'Itangazo ryashyizweho!', 201);
  } catch (err) { next(err); }
};

// @desc   Update announcement
// @route  PUT /api/announcements/:id
// @access Staff
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('createdBy', 'name');
    if (!announcement) return sendError(res, 'Itangazo ntibonetse.', 404);
    sendSuccess(res, { announcement }, 'Ryahinduwe!');
  } catch (err) { next(err); }
};

// @desc   Delete announcement
// @route  DELETE /api/announcements/:id
// @access Staff
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return sendError(res, 'Itangazo ntibonetse.', 404);
    sendSuccess(res, {}, 'Ryasibwe.');
  } catch (err) { next(err); }
};

// @desc   Toggle active/inactive
// @route  PATCH /api/announcements/:id/toggle
// @access Staff
export const toggleAnnouncement = async (req, res, next) => {
  try {
    const a = await Announcement.findById(req.params.id);
    if (!a) return sendError(res, 'Itangazo ntibonetse.', 404);
    a.isActive = !a.isActive;
    await a.save();
    sendSuccess(res, { isActive: a.isActive }, a.isActive ? 'Rigendera ubu.' : 'Hagaritswe.');
  } catch (err) { next(err); }
};
