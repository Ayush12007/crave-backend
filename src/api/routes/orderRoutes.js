import express from 'express';
import { 
  createPaymentIntent, 
  confirmOrder, 
  updateOrderStatus, 
  getMyOrders, 
  getOrderById,
  getLiveQueue // <--- Import
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/create-payment-intent', protect, validateOrder, createPaymentIntent);
router.post('/confirm', protect, confirmOrder);
router.get('/myorders', protect, getMyOrders);

// [NEW] Staff Route (Must be before /:id)
router.get('/live-queue', protect, authorize('KitchenManager', 'CounterStaff', 'SuperAdmin'), getLiveQueue);

router.get('/:id', protect, getOrderById);
router.put('/:orderId/status', protect, authorize('CounterStaff', 'KitchenManager', 'SuperAdmin'), updateOrderStatus);

export default router;