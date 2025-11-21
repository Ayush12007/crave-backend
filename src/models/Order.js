import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: Number,
    variant: String,
    priceAtPurchase: Number
  }],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Pending_Payment', 'Paid', 'Preparing', 'Ready', 'Picked_Up', 'Cancelled'],
    default: 'Pending_Payment'
  },
  paymentIntentId: String,
  pickupQrHash: String,
  estimatedPickupTime: Date
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);