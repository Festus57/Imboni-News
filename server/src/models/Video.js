import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleKiny: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    slug: { type: String, required: true, unique: true, lowercase: true },

    // Storage
    videoUrl: { type: String, required: true },       // Cloudinary or YouTube URL
    thumbnailUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },            // seconds

    // Type
    type: {
      type: String,
      enum: ['news_report', 'short', 'interview', 'sports_highlight', 'live_replay', 'documentary'],
      default: 'news_report',
    },
    isShort: { type: Boolean, default: false },        // vertical short-form
    isLive: { type: Boolean, default: false },

    // Classification
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, trim: true }],
    district: { type: String, default: '' },

    // Subtitles
    subtitles: [
      {
        language: { type: String, enum: ['rw', 'en'] },
        url: { type: String },
      },
    ],

    // Authorship & publishing
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: { type: Date, default: null },

    // Stats
    views: { type: Number, default: 0 },

    // Linked article
    linkedArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
  },
  { timestamps: true }
);

videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ status: 1, publishedAt: -1 });
videoSchema.index({ type: 1, status: 1 });

export default mongoose.model('Video', videoSchema);
