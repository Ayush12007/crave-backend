import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();

    console.log('Creating SuperAdmin...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.findOneAndUpdate(
      { email: 'admin@crave.com' },
      {
        name: 'The Boss',
        email: 'admin@crave.com',
        password: hashedPassword,
        role: 'SuperAdmin'
      },
      { upsert: true, new: true }
    );

    console.log('SuperAdmin Created Successfully');
    process.exit();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

createSuperAdmin();

