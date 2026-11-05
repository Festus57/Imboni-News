import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get approved comments for an article
// @route  GET /api/comments?article=:articleId
// @access Public
export const getComments = async (req, res, next) => {
  try {
    if (!req.query.article) return sendError(res, 'Article ID is required.', 400);
    const comments = await Comment.find({ article: req.query.article, status: 'approved', parent: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    // Fetch replies for top-level comments
    const ids = comments.map((c) => c._id);
    const replies = await Comment.find({ parent: { $in: ids }, status: 'approved' })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });
    const data = comments.map((c) => ({
      ...c.toObject(),
      replies: replies.filter((r) => String(r.parent) === String(c._id)),
    }));
    sendSuccess(res, { comments: data });
  } catch (err) { next(err); }
};

// @desc   Get all comments (CMS — moderation)
// @route  GET /api/comments/cms
// @access Editor+
export const getCmsComments = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate('author', 'name email')
        .populate('article', 'title slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);
    sendSuccess(res, { comments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc   Post a comment
// @route  POST /api/comments
// @access Authenticated readers
export const createComment = async (req, res, next) => {
  try {
    const { article: articleId, content, parent } = req.body;
    if (!articleId || !content) return sendError(res, 'Article ID and content are required.', 400);
    const articleExists = await Article.exists({ _id: articleId, status: 'published' });
    if (!articleExists) return sendError(res, 'Article not found.', 404);
    if (parent) {
      const parentComment = await Comment.exists({ _id: parent, article: articleId, status: 'approved' });
      if (!parentComment) return sendError(res, 'Parent comment not found.', 404);
    }
    const comment = await Comment.create({
      article: articleId,
      author: req.user._id,
      content: String(content).trim().slice(0, 1000),
      parent: parent || null,
      status: 'pending',
    });
    await comment.populate('author', 'name avatar');
    sendSuccess(res, { comment }, 'Igitekerezo cyawe cyakiriwe kandi giri mu gusubirwaho.', 201);
  } catch (err) { next(err); }
};

// @desc   Approve comment
// @route  PATCH /api/comments/:id/approve
// @access Editor+
export const approveComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!comment) return sendError(res, 'Comment not found.', 404);
    sendSuccess(res, { comment }, 'Comment approved.');
  } catch (err) { next(err); }
};

// @desc   Reject comment
// @route  PATCH /api/comments/:id/reject
// @access Editor+
export const rejectComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!comment) return sendError(res, 'Comment not found.', 404);
    sendSuccess(res, { comment }, 'Comment rejected.');
  } catch (err) { next(err); }
};

// @desc   Delete comment
// @route  DELETE /api/comments/:id
// @access Admin or comment author
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, 'Comment not found.', 404);
    const isAuthor = String(comment.author) === String(req.user._id);
    const isAdmin  = ['super_admin', 'admin', 'editor'].includes(req.user.role);
    if (!isAuthor && !isAdmin) return sendError(res, 'Not authorized.', 403);
    await Comment.deleteMany({ parent: comment._id }); // delete replies too
    await comment.deleteOne();
    sendSuccess(res, {}, 'Comment deleted.');
  } catch (err) { next(err); }
};
