import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './api/routes/authRoutes.js';
import orderRoutes from './api/routes/orderRoutes.js';
import menuRoutes from './api/routes/menuRoutes.js';
import adminRoutes from './api/routes/adminRoutes.js';
import couponRoutes from './api/routes/couponRoutes.js'; // <--- Import

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : 'http://localhost:5173';

app.use(cors({
  origin: clientUrl || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes); // <--- Mount

app.get('/', (req, res) => res.send('Crave API Running'));

export default app;