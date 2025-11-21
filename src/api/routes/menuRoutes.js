import express from 'express';
import { getMenu, addMenuItem, createProductReview } from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ CORRECT: Public access (No 'protect' here)
router.get('/', getMenu);

// Private Routes
router.post('/:id/reviews', protect, createProductReview);
router.post('/', protect, authorize('SuperAdmin', 'KitchenManager'), addMenuItem);

export default router;