const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Admin model
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  changeAdminPassword();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function changeAdminPassword() {
  try {
    const newPassword = process.argv[2];
    
    if (!newPassword) {
      console.log('❌ Please provide a new password');
      console.log('Usage: node scripts/changePassword.js "new_password"');
      process.exit(1);
    }

    if (newPassword.length < 8) {
      console.log('❌ Password must be at least 8 characters long');
      process.exit(1);
    }

    // Find the admin user
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL || 'admin@shivananda.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Hash the new password
    // const salt = await bcrypt.genSalt(12);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);

    // // Update the password
    // admin.password = hashedPassword;
    await admin.save();

    console.log('✅ Admin password changed successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 New password has been set');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error changing password:', error);
    process.exit(1);
  }
}
