import express from 'express';
import { createCoupon, getAllCoupons, validateCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public (Validation)
router.post('/validate', protect, validateCoupon);

// Admin (Management)
router.post('/', protect, authorize('SuperAdmin'), createCoupon);
router.get('/', protect, authorize('SuperAdmin'), getAllCoupons);

export default router;