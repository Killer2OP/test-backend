const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },
  response: {
    type: String,
    trim: true,
    maxlength: [2000, 'Response cannot exceed 2000 characters'],
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'other'],
    default: 'website',
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes for better performance
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ assignedTo: 1 });

// Virtual for formatted created date
contactSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to find contacts by status
contactSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to find contacts by priority
contactSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority }).sort({ createdAt: -1 });
};

// Static method to find recent contacts
contactSchema.statics.findRecent = function(limit = 10) {
  return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Instance method to mark as resolved
contactSchema.methods.markAsResolved = function(response, adminId) {
  this.status = 'resolved';
  this.response = response;
  this.respondedAt = new Date();
  this.assignedTo = adminId;
  return this.save();
};

// Instance method to assign to admin
contactSchema.methods.assignToAdmin = function(adminId) {
  this.assignedTo = adminId;
  this.status = 'in-progress';
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);
