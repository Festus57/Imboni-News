import mongoose from 'mongoose';

const newsTipSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Anonymous' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
    district: { type: String, default: '' },
    status: { type: String, enum: ['new', 'under_review', 'used', 'dismissed'], default: 'new' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('NewsTip', newsTipSchema);
