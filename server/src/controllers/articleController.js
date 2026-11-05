import Article from '../models/Article.js';
import User from '../models/User.js';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get published articles (public)
// @route  GET /api/articles
// @access Public
export const getArticles = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.province) filter.province = req.query.province;
    if (req.query.isBreaking === 'true') filter.isBreaking = true;
    if (req.query.isFeatured === 'true') filter.isFeatured = true;
    if (req.query.isTrending === 'true') filter.isTrending = true;
    if (req.query.isFactCheck === 'true') filter.isFactCheck = true;

    // Text search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('author', 'name avatar role')
        .populate('category', 'name nameKiny slug color')
        .select('-content -contentKiny')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(filter),
    ]);

    sendSuccess(res, {
      articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single published article
// @route  GET /api/articles/:slug
// @access Public
export const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name avatar role staffBio socialLinks')
      .populate('category', 'name nameKiny slug color')
      .populate('featuredVideo');

    if (!article) return sendError(res, 'Article not found.', 404);

    // Increment view count
    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

    sendSuccess(res, { article });
  } catch (err) {
    next(err);
  }
};

// @desc   Get all articles (CMS — all statuses)
// @route  GET /api/articles/cms/all
// @access Staff
export const getCmsArticles = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    // Journalists can only see their own articles
    if (req.user.role === 'journalist' || req.user.role === 'photographer') {
      filter.author = req.user._id;
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('author', 'name avatar')
        .populate('category', 'name nameKiny slug')
        .select('-content -contentKiny')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(filter),
    ]);

    sendSuccess(res, { articles, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single article by ID for CMS editing (all statuses, with full content)
// @route  GET /api/articles/:id/cms
// @access Staff
export const getCmsArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('category', 'name nameKiny slug');
    if (!article) return sendError(res, 'Article not found.', 404);
    if (['journalist', 'photographer'].includes(req.user.role) && String(article.author?._id || article.author) !== String(req.user._id)) return sendError(res, 'You can only access your own articles.', 403);
    sendSuccess(res, { article });
  } catch (err) {
    next(err);
  }
};

// @desc   Create article
// @route  POST /api/articles
// @access Journalist, Editor, Admin
export const createArticle = async (req, res, next) => {
  try {
    const {
      title, titleKiny, summary, summaryKiny, content, contentKiny,
      category, tags, district, province, isBreaking, isFeatured, isFactCheck,
      featuredImage, featuredImageCaption, audioUrl, videoUrl, videoType, scheduledAt,
    } = req.body;

    const slug = await generateUniqueSlug(title, Article);
    const readTime = content ? Math.ceil(content.split(' ').length / 200) : 1;

    const article = await Article.create({
      title, titleKiny, slug, summary, summaryKiny, content, contentKiny,
      category, tags, district, province, isBreaking, isFeatured, isFactCheck,
      featuredImage, featuredImageCaption,
      audioUrl, videoUrl, videoType,
      scheduledAt,
      author: req.user._id,
      readTime,
      hasAudio: !!audioUrl,
      hasVideo: !!videoUrl,
    });

    sendSuccess(res, { article }, 'Article created.', 201);
  } catch (err) {
    next(err);
  }
};

// @desc   Update article
// @route  PUT /api/articles/:id
// @access Author or Editor+
export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);

    // Only author or editor+ can edit
    const isAuthor = article.author.toString() === req.user._id.toString();
    const isEditor = ['editor', 'admin', 'super_admin'].includes(req.user.role);
    if (!isAuthor && !isEditor) {
      return sendError(res, 'Not authorized to edit this article.', 403);
    }

    const editableFields = [
      'title', 'titleKiny', 'summary', 'summaryKiny', 'content', 'contentKiny',
      'category', 'tags', 'district', 'province', 'isBreaking', 'isFeatured',
      'isFactCheck', 'featuredImage', 'featuredImageCaption', 'audioUrl',
      'videoUrl', 'videoType', 'scheduledAt',
    ];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => editableFields.includes(key)));
    if (updates.title && updates.title !== article.title) {
      updates.slug = await generateUniqueSlug(updates.title, Article, article._id);
    }
    if (updates.content !== undefined) updates.readTime = Math.max(1, Math.ceil(String(updates.content).split(/\s+/).filter(Boolean).length / 200));
    if (updates.audioUrl !== undefined) updates.hasAudio = Boolean(updates.audioUrl);
    if (updates.videoUrl !== undefined) updates.hasVideo = Boolean(updates.videoUrl);

    const updated = await Article.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    sendSuccess(res, { article: updated }, 'Article updated.');
  } catch (err) {
    next(err);
  }
};

// @desc   Submit article for review
// @route  PATCH /api/articles/:id/submit
// @access Journalist
export const submitForReview = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);
    if (article.author.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not your article.', 403);
    }
    if (!['draft', 'rejected'].includes(article.status)) return sendError(res, 'Only draft or rejected articles can be submitted for review.', 409);
    article.status = 'pending_review';
    await article.save();
    sendSuccess(res, { article }, 'Submitted for review.');
  } catch (err) {
    next(err);
  }
};

// @desc   Approve and publish article
// @route  PATCH /api/articles/:id/publish
// @access Editor+
export const publishArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);
    if (!['pending_review', 'draft', 'approved'].includes(article.status)) return sendError(res, 'Only drafts or reviewed articles can be published.', 409);
    article.status = 'published';
    article.publishedAt = new Date();
    article.reviewedBy = req.user._id;
    article.reviewedAt = new Date();
    await article.save();
    sendSuccess(res, { article }, 'Article published.');
  } catch (err) {
    next(err);
  }
};

// @desc   Reject article
// @route  PATCH /api/articles/:id/reject
// @access Editor+
export const rejectArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);
    if (article.status !== 'pending_review') return sendError(res, 'Only articles awaiting review can be rejected.', 409);
    article.status = 'rejected';
    article.rejectionReason = req.body.reason || '';
    article.reviewedBy = req.user._id;
    article.reviewedAt = new Date();
    await article.save();
    sendSuccess(res, { article }, 'Article rejected.');
  } catch (err) {
    next(err);
  }
};

// @desc   Delete article
// @route  DELETE /api/articles/:id
// @access Admin+
export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return sendError(res, 'Article not found.', 404);
    // Clean up saved references in all users
    await User.updateMany(
      { savedArticles: article._id },
      { $pull: { savedArticles: article._id } }
    );
    sendSuccess(res, {}, 'Article deleted.');
  } catch (err) {
    next(err);
  }
};

// @desc   Save / unsave article (reader)
// @route  POST /api/articles/:id/save
// @access Reader+
export const toggleSaveArticle = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 'User not found.', 404);
    const articleId = req.params.id;
    // Verify article exists before saving
    const exists = await Article.exists({ _id: articleId });
    if (!exists) return sendError(res, 'Article not found.', 404);

    const alreadySaved = user.savedArticles.some((id) => id.toString() === articleId);
    if (alreadySaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedArticles: articleId } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedArticles: articleId } });
    }
    sendSuccess(res, { saved: !alreadySaved }, alreadySaved ? 'Article unsaved.' : 'Article saved.');
  } catch (err) {
    next(err);
  }
};
