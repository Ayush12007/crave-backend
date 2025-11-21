import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // <--- Import Bcrypt
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createStaff = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB(); 
    
    console.log('Hashing passwords & Creating staff...');

    // 1. Manually hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Create/Update Kitchen Manager
    await User.findOneAndUpdate(
      { email: 'chef@crave.com' },
      {
        name: 'Chef Gordon',
        email: 'chef@crave.com',
        password: hashedPassword, // <--- Store the Hashed version
        role: 'KitchenManager'
      },
      { upsert: true, new: true }
    );
    
    // 3. Create/Update Counter Staff
    await User.findOneAndUpdate(
      { email: 'desk@crave.com' },
      {
        name: 'Front Desk Alice',
        email: 'desk@crave.com',
        password: hashedPassword, // <--- Store the Hashed version
        role: 'CounterStaff'
      },
      { upsert: true, new: true }
    );

    console.log('Staff Users (Chef & Alice) Created Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createStaff();