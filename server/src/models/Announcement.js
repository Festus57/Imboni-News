import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },  // department/title
    content:    { type: String, default: '' },                  // text content
    imageUrl:   { type: String, default: '' },                  // image
    videoUrl:   { type: String, default: '' },                  // YouTube or MP4
    isActive:   { type: Boolean, default: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
