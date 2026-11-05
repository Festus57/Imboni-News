import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameKiny: { type: String, required: true, trim: true }, // Kinyarwanda name
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '#E63946' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, order: 1 });
categorySchema.index({ slug: 1 }, { unique: true }); // explicit

export default mongoose.model('Category', categorySchema);
