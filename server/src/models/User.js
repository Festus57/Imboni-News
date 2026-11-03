import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager', 'reader'],
      default: 'reader',
    },
    // Reader-specific fields
    bio: { type: String, default: '' },
    preferredLanguage: { type: String, enum: ['rw', 'en'], default: 'rw' },
    preferredDistrict: { type: String, default: '' },
    followedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    followedJournalists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    readingHistory: [
      {
        article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    newsletterSubscribed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLogin: { type: Date },
    // Staff fields
    isStaff: { type: Boolean, default: false },
    staffBio: { type: String, default: '' },
    socialLinks: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Mark staff roles
userSchema.pre('save', function (next) {
  const staffRoles = ['super_admin', 'admin', 'editor', 'journalist', 'photographer', 'video_editor', 'ad_manager'];
  this.isStaff = staffRoles.includes(this.role);
  next();
});

export default mongoose.model('User', userSchema);
