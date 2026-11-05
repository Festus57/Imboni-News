import mongoose from 'mongoose';

const advertiserSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Advertiser', advertiserSchema);
