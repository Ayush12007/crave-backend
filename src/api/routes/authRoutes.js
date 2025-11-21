import express from 'express';
import { registerUser, authUser, logoutUser, getUserProfile } from '../controllers/authController.js'; // Import getUserProfile
import { validateRegister } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js'; // Import protect

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile); // [NEW] Profile Route

export default router;