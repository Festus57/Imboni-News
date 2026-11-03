import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleKiny: { type: String, trim: true, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true },
    summary: { type: String, required: true, maxlength: 500 },
    summaryKiny: { type: String, default: '' },
    content: { type: String, required: true },  // HTML from rich text editor
    contentKiny: { type: String, default: '' },

    // Media
    featuredImage: { type: String, default: '' },
    featuredImageCaption: { type: String, default: '' },
    featuredVideo: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
    videoUrl: { type: String, default: '' },
    videoType: { type: String, default: '' },           // 'youtube' | 'file' | ''
    audioUrl: { type: String, default: '' },
    gallery: [{ url: String, caption: String }],

    // Classification
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    district: { type: String, default: '' },
    province: { type: String, default: '' },

    // Authorship
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Publishing workflow
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'published', 'rejected', 'archived'],
      default: 'draft',
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    scheduledAt: { type: Date, default: null },

    // Flags
    isBreaking: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFactCheck: { type: Boolean, default: false },

    // Formats
    hasVideo: { type: Boolean, default: false },
    hasAudio: { type: Boolean, default: false },
    hasGallery: { type: Boolean, default: false },

    // Stats
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // minutes
  },
  { timestamps: true }
);

// Index for search and filtering
articleSchema.index({ title: 'text', summary: 'text', tags: 'text' });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ district: 1, status: 1 });

export default mongoose.model('Article', articleSchema);
