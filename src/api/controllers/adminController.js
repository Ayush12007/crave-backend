import Order from '../../models/Order.js';
import User from '../../models/User.js';
import SystemConfig from '../../models/SystemConfig.js';
import SupportTicket from '../../models/SupportTicket.js';

// --- ANALYTICS ---
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Total Revenue & Orders
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['Paid', 'Preparing', 'Ready', 'Picked_Up'] } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // 2. Top Selling Items
    const topItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
          _id: '$items.menuItem', 
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] } }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'details' } },
      { $unwind: '$details' },
      { $project: { name: '$details.name', totalSold: 1, revenue: 1 } }
    ]);

    // 3. Peak Hours (Heatmap Data)
    const peakHours = await Order.aggregate([
      { $project: { hour: { $hour: '$createdAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. User Growth (Last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalSales: revenue[0]?.totalSales || 0,
      totalOrders: revenue[0]?.count || 0,
      topItems,
      peakHours,
      userGrowth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- COMMISSION ---
export const setCommission = async (req, res) => {
  const { rate } = req.body; // Percentage (e.g., 5%)
  try {
    const config = await SystemConfig.findOneAndUpdate(
      { key: 'global_commission' },
      { value: rate, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommission = async (req, res) => {
  const config = await SystemConfig.findOne({ key: 'global_commission' });
  res.json({ rate: config?.value || 0 });
};

// --- USER MANAGEMENT ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SUPPORT TICKETS ---
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status, adminResponse: req.body.response },
      { new: true }
    );
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};