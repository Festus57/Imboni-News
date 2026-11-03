import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'AdCampaign', required: true },
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amountRwf: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['unpaid', 'paid', 'overdue', 'cancelled'], default: 'unpaid' },
    paidAt: { type: Date, default: null },
    notes: { type: String, default: '' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
