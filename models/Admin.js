const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

// Virtual for account lock status
// adminSchema.virtual('isLocked').get(function() {
//   return !!(this.lockUntil && this.lockUntil > Date.now());
// });

// Pre-save middleware to hash password
// adminSchema.pre('save', async function(next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified('password')) return next();

//   try {
//     // Hash password with cost of 12
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Instance method to check password

adminSchema.methods.comparePassword = async function(candidatePassword) {
  return candidatePassword === this.password;
};
// adminSchema.methods.comparePassword = async function(candidatePassword) {
//   try {
//     return await bcrypt.compare(candidatePassword, this.password);
//   } catch (error) {
//     throw error;
//   }
// };



// Instance method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  // if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
  //   updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  // }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to update last login
adminSchema.methods.updateLastLogin = function() {
  return this.updateOne({
    $set: { lastLogin: new Date() },
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find admin by email WITH password
adminSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
};

// Transform JSON output to remove sensitive fields
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  delete adminObject.loginAttempts;
  delete adminObject.lockUntil;
  return adminObject;
};

module.exports = mongoose.model('Admin', adminSchema);
