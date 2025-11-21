import Coupon from '../../models/Coupon.js';

// @desc Create Coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, minOrderValue, expirationDate, usageLimit } = req.body;
    
    const coupon = await Coupon.create({
      code,
      discountType,
      discountAmount,
      minOrderValue,
      expirationDate,
      usageLimit
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc Get All Coupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Validate Coupon (Customer)
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid Coupon Code' });
    }

    // Checks
    if (new Date() > coupon.expirationDate) {
      return res.status(400).json({ message: 'Coupon Expired' });
    }
    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon Usage Limit Reached' });
    }
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order of ₹${coupon.minOrderValue} required` });
    }

    // Calculate Discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (cartTotal * coupon.discountAmount) / 100;
    } else {
      discount = coupon.discountAmount;
    }

    // Cap discount at cart total (cannot be negative)
    discount = Math.min(discount, cartTotal);

    res.json({
      code: coupon.code,
      discount: discount,
      message: 'Coupon Applied!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};