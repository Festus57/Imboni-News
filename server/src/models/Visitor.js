import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  visitorHash: { type: String, required: true, unique: true, select: false },
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  visits: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export default mongoose.model('Visitor', visitorSchema);
