import mongoose from 'mongoose';

const adRequestSchema = new mongoose.Schema(
  {
    companyName:      { type: String, required: true, trim: true },
    contactName:      { type: String, required: true, trim: true },
    email:            { type: String, required: true, lowercase: true },
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
    status:    { type: String, enum: ['new', 'contacted', 'converted', 'declined'], default: 'new' },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    handledAt: { type: Date, default: null },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AdRequest', adRequestSchema);
