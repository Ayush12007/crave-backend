import express from 'express';
import { 
  getDashboardAnalytics, 
  setCommission, 
  getCommission, 
  getAllUsers, 
  getSupportTickets, 
  resolveTicket 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware to ensure only SuperAdmin can access
const superAdmin = [protect, authorize('SuperAdmin')];

router.get('/analytics', ...superAdmin, getDashboardAnalytics);
router.get('/users', ...superAdmin, getAllUsers);

router.route('/commission')
  .get(...superAdmin, getCommission)
  .post(...superAdmin, setCommission);

router.route('/tickets')
  .get(...superAdmin, getSupportTickets);
  
router.put('/tickets/:id', ...superAdmin, resolveTicket);

export default router;