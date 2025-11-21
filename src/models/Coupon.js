import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  discountAmount: { type: Number, required: true }, // e.g., 20 (for 20%) or 100 (for ₹100)
  minOrderValue: { type: Number, default: 0 },
  expirationDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1000 }, // Max times this coupon can be used
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Coupon', CouponSchema);