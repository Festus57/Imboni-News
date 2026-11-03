import Media from '../models/Media.js';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Upload media file (local storage — no Cloudinary needed)
// @route  POST /api/media/upload
// @access Staff
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded.', 400);

    // Build URL — use /uploads/ path served statically
    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const fileType = req.file.mimetype.startsWith('image/')
      ? 'image'
      : req.file.mimetype.startsWith('video/')
      ? 'video'
      : req.file.mimetype.startsWith('audio/')
      ? 'audio'
      : 'document';

    const media = await Media.create({
      filename: req.file.originalname,
      url: fileUrl,
      publicId: req.file.filename, // local filename
      type: fileType,
      mimeType: req.file.mimetype,
      size: req.file.size || 0,
      uploadedBy: req.user._id,
    });

    sendSuccess(res, { media }, 'File uploaded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Get media library
// @route  GET /api/media
// @access Staff
export const getMedia = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.type) filter.type = req.query.type;

    const [items, total] = await Promise.all([
      Media.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Media.countDocuments(filter),
    ]);

    sendSuccess(res, { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete media
// @route  DELETE /api/media/:id
// @access Admin+
export const deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return sendError(res, 'Media not found.', 404);

    // Delete local file
    const filePath = path.join('public/uploads', media.publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    sendSuccess(res, {}, 'Media deleted.');
  } catch (err) {
    next(err);
  }
};
