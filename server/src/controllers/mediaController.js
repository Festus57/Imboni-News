import Media from '../models/Media.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Convert file to base64 data URL (for images — survives Render ephemeral FS)
function fileToBase64(filePath, mimeType) {
  try {
    const buffer = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

// @desc   Upload media file (stores images as base64 in MongoDB, files on disk)
// @route  POST /api/media/upload
// @access Staff
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded.', 400);

    const fileType = req.file.mimetype.startsWith('image/')
      ? 'image'
      : req.file.mimetype.startsWith('video/')
      ? 'video'
      : req.file.mimetype.startsWith('audio/')
      ? 'audio'
      : 'document';

    // For images: store as base64 data URL in MongoDB (survives Render redeploy)
    // For other types: store file URL (may not survive Render redeploy)
    let fileUrl;

    if (fileType === 'image' && req.file.size < 5 * 1024 * 1024) {
      // Images < 5MB → base64 in MongoDB
      const controllerDir = path.dirname(fileURLToPath(import.meta.url));
      const uploadDir = path.resolve(controllerDir, '../../public/uploads');
      const filePath = path.join(uploadDir, req.file.filename);

      if (fs.existsSync(filePath)) {
        fileUrl = fileToBase64(filePath, req.file.mimetype);
      }

      // If base64 conversion fails, fall back to URL
      if (!fileUrl) {
        const baseUrl = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/$/, '');
        fileUrl = `${baseUrl}/uploads/${encodeURIComponent(req.file.filename)}`;
      }
    } else {
      // Videos/audio/documents → file URL (too big for base64)
      const baseUrl = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`).replace(/\/$/, '');
      fileUrl = `${baseUrl}/uploads/${encodeURIComponent(req.file.filename)}`;
    }

    const media = await Media.create({
      filename: req.file.originalname,
      url: fileUrl,
      publicId: req.file.filename,
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
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 30));
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
    const controllerDir = path.dirname(fileURLToPath(import.meta.url));
    const uploadDir = path.resolve(controllerDir, '../../public/uploads');
    const safeFilename = path.basename(media.publicId);
    const filePath = path.join(uploadDir, safeFilename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    sendSuccess(res, {}, 'Media deleted.');
  } catch (err) {
    next(err);
  }
};
