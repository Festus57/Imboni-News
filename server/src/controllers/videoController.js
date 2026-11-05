import Video from '../models/Video.js';
import LiveStream from '../models/LiveStream.js';
import Article from '../models/Article.js';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get ALL videos for CMS (all statuses)
// @route  GET /api/videos/cms/all
// @access Staff
export const getCmsVideos = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const videos = await Video.find(filter)
      .populate('uploadedBy', 'name')
      .populate('category', 'name nameKiny slug')
      .sort({ createdAt: -1 });
    sendSuccess(res, { videos });
  } catch (err) {
    next(err);
  }
};

// @desc   Get published videos
// @route  GET /api/videos
// @access Public
export const getVideos = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isShort === 'true') filter.isShort = true;

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('uploadedBy', 'name avatar')
        .populate('category', 'name nameKiny slug')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    sendSuccess(res, { videos, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single video
// @route  GET /api/videos/:slug
// @access Public
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findOne({ slug: req.params.slug, status: 'published' })
      .populate('uploadedBy', 'name avatar')
      .populate('category', 'name nameKiny slug')
      .populate('linkedArticle', 'title slug');

    if (!video) return sendError(res, 'Video not found.', 404);
    await Video.findByIdAndUpdate(video._id, { $inc: { views: 1 } });
    sendSuccess(res, { video });
  } catch (err) {
    next(err);
  }
};

// @desc   Get video shorts
// @route  GET /api/videos/shorts
// @access Public
export const getShorts = async (req, res, next) => {
  try {
    const shorts = await Video.find({ isShort: true, status: 'published' })
      .populate('uploadedBy', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(20);
    sendSuccess(res, { shorts });
  } catch (err) {
    next(err);
  }
};

// @desc   Upload / create video
// @route  POST /api/videos
// @access Video Editor, Admin
export const createVideo = async (req, res, next) => {
  try {
    const { title, titleKiny, description, videoUrl, thumbnailUrl, type, isShort, category, tags, district, linkedArticle } = req.body;
    const slug = await generateUniqueSlug(title, Video);

    const video = await Video.create({
      title, titleKiny, description, slug, videoUrl, thumbnailUrl,
      type, isShort: isShort || type === 'short',
      category, tags, district, linkedArticle,
      uploadedBy: req.user._id,
    });

    sendSuccess(res, { video }, 'Video created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Publish video
// @route  PATCH /api/videos/:id/publish
// @access Video Editor, Admin
export const publishVideo = async (req, res, next) => {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, status: { $in: ['draft', 'pending_review'] } },
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    if (!video) return sendError(res, 'Video not found or is already published.', 404);
    sendSuccess(res, { video }, 'Video published.');
  } catch (err) {
    next(err);
  }
};

// @desc   Update video
// @route  PUT /api/videos/:id
// @access Video Editor, Admin
export const updateVideo = async (req, res, next) => {
  try {
    const current = await Video.findById(req.params.id);
    if (!current) return sendError(res, 'Video not found.', 404);
    const allowed = ['title', 'titleKiny', 'description', 'videoUrl', 'thumbnailUrl', 'type', 'isShort', 'category', 'tags', 'district', 'linkedArticle'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.title && updates.title !== current.title) updates.slug = await generateUniqueSlug(updates.title, Video, current._id);
    const video = await Video.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
      .populate('uploadedBy', 'name').populate('category', 'name nameKiny slug');
    if (!video) return sendError(res, 'Video not found.', 404);
    sendSuccess(res, { video }, 'Video updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete video
// @route  DELETE /api/videos/:id
// @access Video Editor, Admin
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return sendError(res, 'Video not found.', 404);
    if (await Article.exists({ featuredVideo: video._id })) return sendError(res, 'This video is linked to an article and cannot be deleted.', 409);
    await video.deleteOne();
    sendSuccess(res, {}, 'Video deleted.');
  } catch (err) {
    next(err);
  }
};

// @desc   Get active live streams
// @route  GET /api/videos/live
// @access Public
export const getLiveStreams = async (req, res, next) => {
  try {
    const streams = await LiveStream.find({ status: { $in: ['live', 'scheduled'] } })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 }); // Newest created → top of list
    sendSuccess(res, { streams });
  } catch (err) {
    next(err);
  }
};

// @desc   Create live stream
// @route  POST /api/videos/live
// @access Admin, Video Editor
export const createLiveStream = async (req, res, next) => {
  try {
    const { title, description, streamUrl, thumbnailUrl, scheduledAt } = req.body;
    const stream = await LiveStream.create({
      title, description, streamUrl, thumbnailUrl, scheduledAt,
      createdBy: req.user._id,
    });
    sendSuccess(res, { stream }, 'Live stream created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Update live stream
// @route  PUT /api/videos/live/:id
// @access Admin, Video Editor
export const updateLiveStream = async (req, res, next) => {
  try {
    const stream = await LiveStream.findById(req.params.id);
    if (!stream) return sendError(res, 'Stream not found.', 404);
    const allowed = ['title', 'description', 'streamUrl', 'thumbnailUrl', 'scheduledAt', 'status'];
    for (const key of allowed) if (req.body?.[key] !== undefined) stream[key] = req.body[key];
    if (stream.status === 'live' && !stream.startedAt) stream.startedAt = new Date();
    if (stream.status === 'ended' && !stream.endedAt) stream.endedAt = new Date();
    await stream.save();
    await stream.populate('createdBy', 'name');
    sendSuccess(res, { stream }, 'Stream updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete live stream
// @route  DELETE /api/videos/live/:id
// @access Admin, Video Editor
export const deleteLiveStream = async (req, res, next) => {
  try {
    const stream = await LiveStream.findByIdAndDelete(req.params.id);
    if (!stream) return sendError(res, 'Stream not found.', 404);
    sendSuccess(res, {}, 'Stream deleted.');
  } catch (err) {
    next(err);
  }
};
