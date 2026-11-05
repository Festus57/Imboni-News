import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'AdCampaign', required: true },
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amountRwf: { type: Number, required: true, min: 1 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'overdue', 'cancelled'], default: 'unpaid' },
    paidAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.index({ advertiser: 1 });
invoiceSchema.index({ campaign: 1 });
invoiceSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('Invoice', invoiceSchema);
