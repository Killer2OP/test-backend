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
  updateAdminFromEnv();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function updateAdminFromEnv() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shivananda.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.log('❌ ADMIN_PASSWORD not found in environment variables');
      console.log('Please set ADMIN_PASSWORD in your .env file');
      process.exit(1);
    }

    // Find or create the admin user
    let admin = await Admin.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Update the password
    admin.password = hashedPassword;
    await admin.save();

    console.log('✅ Admin password updated from environment variables!');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Password updated successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }
}
