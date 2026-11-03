import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id
    type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 }, // bytes
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: String, default: 'general' },
  },
  { timestamps: true }
);

export default mongoose.model('Media', mediaSchema);
