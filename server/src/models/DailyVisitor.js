import mongoose from 'mongoose';

const dailyVisitorSchema = new mongoose.Schema({
  day: { type: String, required: true },
  visitorHash: { type: String, required: true, select: false },
}, { timestamps: true });

dailyVisitorSchema.index({ day: 1, visitorHash: 1 }, { unique: true });
dailyVisitorSchema.index({ day: 1 });
dailyVisitorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('DailyVisitor', dailyVisitorSchema);
