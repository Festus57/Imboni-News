import mongoose from 'mongoose';

const liveStreamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    streamUrl: { type: String, required: true },  // YouTube Live, etc.
    thumbnailUrl: { type: String, default: '' },
    status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    viewers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('LiveStream', liveStreamSchema);
