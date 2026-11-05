import mongoose from 'mongoose';

const adRequestSchema = new mongoose.Schema(
  {
    companyName:      { type: String, required: true, trim: true },
    contactName:      { type: String, required: true, trim: true },
    email:            { type: String, required: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    trackingCode:     { type: String, unique: true, sparse: true, trim: true },
    phone:            { type: String, default: '' },
    message:          { type: String, default: '' },
    requestedPackage: { type: String, enum: ['starter', 'business', 'premium', 'custom'], default: 'business' },
    // New fields
    duration:         { type: String, enum: ['7days', '1month', '3months'], default: '1month' },
    adType:           { type: String, enum: ['image', 'video', 'content'], default: 'image' },
    mediaUrl:         { type: String, default: '' },   // image or video URL
    adContent:        { type: String, default: '' },   // text content for content-type ads
    destinationUrl:   { type: String, default: '' },   // click-through URL
    placement:        { type: String, default: 'top_banner' },
    // Status
    status:    { type: String, enum: ['new', 'contacted', 'converting', 'converted', 'declined'], default: 'new' },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'AdCampaign', default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    handledAt: { type: Date, default: null },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

adRequestSchema.index({ email: 1, trackingCode: 1 }); // for status check
adRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AdRequest', adRequestSchema);
