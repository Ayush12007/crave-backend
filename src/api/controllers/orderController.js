import Order from '../../models/Order.js';
import MenuItem from '../../models/MenuItem.js';
import User from '../../models/User.js';
import Coupon from '../../models/Coupon.js';
import getNextSequence from '../../utils/generateOrderNumber.js';
import { calculateEstimatedPickupTime } from '../../utils/kitchenLoadAlgo.js';
import { generatePickupHash } from '../../utils/qrGenerator.js';
import { emitQueueUpdate } from '../../services/socketService.js';
import { sendOrderConfirmation } from '../../services/emailService.js'; // <--- RESTORED THIS IMPORT
import stripe from '../../config/stripe.js';

/**
 * @desc    1. Create Payment Intent (Coupon + Coin Logic)
 * @route   POST /api/orders/create-payment-intent
 * @access  Private (Customer)
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const { items, useCoins, couponCode } = req.body;
    
    // 1. Calculate Base Total
    let total = 0;
    for (const item of items) {
      const dbItem = await MenuItem.findById(item.menuItem);
      if (!dbItem) {
        return res.status(404).json({ message: `Item not found: ${item.menuItem}` });
      }
      total += dbItem.price * item.quantity;
    }

    // 2. Apply Coupon Discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      
      if (coupon && new Date() <= coupon.expirationDate && coupon.usageCount < coupon.usageLimit && total >= coupon.minOrderValue) {
         if (coupon.discountType === 'PERCENTAGE') {
           couponDiscount = (total * coupon.discountAmount) / 100;
         } else {
           couponDiscount = coupon.discountAmount;
         }
      }
    }
    
    // Calculate remaining amount after coupon
    let amountAfterCoupon = Math.max(0, total - couponDiscount);

    // 3. Apply Coin Discount
    let coinDiscount = 0;
    let coinsUsed = 0;

    if (useCoins) {
      const user = await User.findById(req.user._id);
      const maxCoinDiscount = amountAfterCoupon * 0.5; // Max 50% of remaining
      const redeemableAmount = Math.min(user.coins, maxCoinDiscount);
      
      if (redeemableAmount > 0) {
        coinDiscount = redeemableAmount;
        coinsUsed = redeemableAmount; 
      }
    }

    const finalAmount = Math.round(amountAfterCoupon - coinDiscount);

    // 4. Create Stripe Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount * 100, // Paise
      currency: 'inr',
      description: `Order by ${req.user.name}`,
      metadata: { 
        userId: req.user._id.toString(),
        coinsUsed: coinsUsed.toString(),
        couponCode: couponCode || ''
      },
      shipping: { 
        name: req.user.name,
        address: {
          line1: 'Pickup Order - Counter Collection',
          city: 'Bhopal',
          state: 'MP',
          country: 'IN',
          postal_code: '462001'
        }
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      totalAmount: total,
      couponDiscount,
      coinDiscount,
      finalAmount,
      coinsUsed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    2. Confirm Order (Finalize Transaction)
 * @route   POST /api/orders/confirm
 * @access  Private (Customer)
 */
export const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId, items } = req.body;

    // 1. Verify Payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Extract Metadata
    const coinsUsed = parseInt(paymentIntent.metadata.coinsUsed || '0');
    const couponCode = paymentIntent.metadata.couponCode;

    // 2. Update Coupon Usage
    if (couponCode) {
      await Coupon.updateOne({ code: couponCode }, { $inc: { usageCount: 1 } });
    }

    // 3. Update Coins (Earn & Burn)
    const amountPaid = paymentIntent.amount / 100;
    const coinsEarned = Math.floor(amountPaid / 10); 
    
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { coins: coinsEarned - coinsUsed } 
    });

    // 4. Create Order
    const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedPickupTime = await calculateEstimatedPickupTime(totalItemsCount);
    const orderNumber = await getNextSequence();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      items,
      totalAmount: amountPaid,
      status: 'Paid',
      paymentIntentId,
      estimatedPickupTime
    });

    // 5. Real-time Update
    emitQueueUpdate(order);

    // 6. Send Email (Restored Logic)
    try {
        // Fetch full user for email address
        const fullUser = await User.findById(req.user._id);
        // Populate menu items for the receipt names
        const populatedOrder = await Order.findById(order._id).populate('items.menuItem');
        // Send async email
        sendOrderConfirmation(populatedOrder, fullUser); 
    } catch (emailErr) {
        console.error("Email failed to send, but order is valid:", emailErr);
        // Do not fail the request if email fails
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error); // Log the specific error to console
    res.status(500).json({ message: error.message });
  }
};

// ... (Keep updateOrderStatus, getMyOrders, getLiveQueue, getOrderById exactly as they were)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    if (status === 'Ready') {
      order.pickupQrHash = generatePickupHash(order.orderNumber, order.customer.toString());
    }
    const updatedOrder = await order.save();
    emitQueueUpdate(updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name image price'); 
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLiveQueue = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ['Paid', 'Preparing', 'Ready'] } 
    })
    .populate('items.menuItem', 'name') 
    .populate('customer', 'name')       
    .sort({ createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image price');
    if (order) res.json(order);
    else res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};