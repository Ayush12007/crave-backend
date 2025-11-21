
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

const cleanSlate = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();

    console.log('Wiping old/broken Order history...');
    const result = await Order.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} orders.`);
    console.log('System is now clean and ready for new Indian Menu data.');
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

cleanSlate();