const Admin = require('../models/Admin');

const initAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create initial admin user
    const adminData = {
      email: process.env.ADMIN_EMAIL || 'admin@shivananda.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isActive: true,
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Initial admin user created successfully');
    console.log(`📧 Email: ${admin.email}`);
    console.log('🔐 Please change the default password after first login');
    
  } catch (error) {
    console.error('❌ Error creating initial admin user:', error.message);
  }
};

module.exports = initAdmin;
