import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['super_admin', 'admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager', 'reader'],
    },
    permissions: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
