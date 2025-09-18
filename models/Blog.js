const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
  },
  name: {
    type: String,
    required: [true, 'Blog name is required'],
    trim: true,
    maxlength: [200, 'Blog name cannot exceed 200 characters'],
  },
  bgImage: {
    type: String,
    required: [true, 'Background image is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Main image is required'],
    trim: true,
  },
  publishDate: {
    type: String,
    required: [true, 'Publish date is required'],
    trim: true,
  },
  overview: {
    type: String,
    required: [true, 'Overview is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  application: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  challenges: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  applications: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  specifications: [{
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  }],
  images: [{
    type: String,
    trim: true,
  }],
  totalUsers: {
    type: Number,
    default: 0,
    min: [0, 'Total users cannot be negative'],
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ publishDate: -1 });
blogSchema.index({ createdAt: -1 });

// Virtual for formatted publish date
blogSchema.virtual('formattedPublishDate').get(function() {
  if (this.publishDate) {
    const date = new Date(this.publishDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return this.publishDate;
});

// Pre-save middleware to generate slug if not provided
blogSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to find published blogs
blogSchema.statics.findPublished = function() {
  return this.find({ isPublished: true }).sort({ publishDate: -1 });
};

// Static method to find featured blogs
blogSchema.statics.findFeatured = function() {
  return this.find({ isPublished: true, featured: true }).sort({ publishDate: -1 });
};

// Static method to find blog by slug
blogSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, isPublished: true });
};

module.exports = mongoose.model('Blog', blogSchema);
