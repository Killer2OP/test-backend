const mongoose = require('mongoose');

// Schema for different content types
const contentSchema = new mongoose.Schema({
  pageType: {
    type: String,
    required: true,
    enum: ['home', 'about', 'products', 'blogs', 'clients', 'contact', 'other']
  },
  section: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  metadata: {
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    author: String,
    publishDate: Date,
    category: String,
    tags: [String],
    featured: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
contentSchema.index({ pageType: 1, section: 1 });
contentSchema.index({ status: 1, pageType: 1 });
contentSchema.index({ 'metadata.category': 1 });

module.exports = mongoose.model('Content', contentSchema);