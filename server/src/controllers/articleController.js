import Article from '../models/Article.js';
import { generateUniqueSlug } from '../utils/generateSlug.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc   Get published articles (public)
// @route  GET /api/articles
// @access Public
export const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.district) filter.district = req.query.district;
    if (req.query.province) filter.province = req.query.province;
    if (req.query.isBreaking) filter.isBreaking = true;
    if (req.query.isFeatured) filter.isFeatured = true;
    if (req.query.isTrending) filter.isTrending = true;
    if (req.query.isFactCheck) filter.isFactCheck = true;

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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

    // Re-generate slug only if title changed
    if (req.body.title && req.body.title !== article.title) {
      req.body.slug = await generateUniqueSlug(req.body.title, Article, article._id);
    }

    if (req.body.content) {
      req.body.readTime = Math.ceil(req.body.content.split(' ').length / 200);
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    const articleId = req.params.id;
    const alreadySaved = user.savedArticles.includes(articleId);

    if (alreadySaved) {
      user.savedArticles = user.savedArticles.filter((id) => id.toString() !== articleId);
    } else {
      user.savedArticles.push(articleId);
    }
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, { saved: !alreadySaved }, alreadySaved ? 'Article unsaved.' : 'Article saved.');
  } catch (err) {
    next(err);
  }
};
