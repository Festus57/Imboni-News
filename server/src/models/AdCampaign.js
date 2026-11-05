import mongoose from 'mongoose';

const adCampaignSchema = new mongoose.Schema(
  {
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser', required: true },
    sourceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'AdRequest', unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    package: {
      type: String,
      enum: ['starter', 'business', 'premium'],
      required: true,
    },
    placement: {
      type: String,
      enum: ['top_banner', 'sidebar', 'article_inline', 'homepage', 'footer', 'video_preroll', 'mobile'],
      required: true,
    },
    // Creative
    imageUrl: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    adContent: { type: String, default: '' },       // text content for content-type ads
    adType: { type: String, enum: ['image', 'video', 'content'], default: 'image' },
    destinationUrl: { type: String, required: true, trim: true },
    altText: { type: String, default: '' },

    // Scheduling
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Pricing (RWF)
    priceRwf: { type: Number, required: true, min: 1 },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'active', 'paused', 'expired', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },

    // Stats
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Auto-expire campaigns
adCampaignSchema.index({ endDate: 1, status: 1 });

export default mongoose.model('AdCampaign', adCampaignSchema);
