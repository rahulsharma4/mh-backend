const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/userModel');

// Load environment variables from the parent directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    const newEmail = process.env.ADMIN_EMAIL;
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!newEmail || !newPassword) {
      console.log('ADMIN_EMAIL or ADMIN_PASSWORD not found in .env!');
      process.exit(1);
    }

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    adminUser.email = newEmail;
    adminUser.password = newPassword; // The pre-save hook will hash this

    await adminUser.save();
    
    console.log('✅ Admin user updated successfully.');
    console.log(`New Email: ${newEmail}`);
    console.log(`New Password: ${newPassword}`);
    console.log('--------------------------------------------------');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin();
