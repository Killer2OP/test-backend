const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  bgImage: {
    type: String,
    required: [true, 'Background image is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  extraLine: {
    type: String,
    trim: true,
  },
  logoImg: [{
    type: String,
    trim: true,
  }],
  overview: {
    type: String,
    required: [true, 'Overview is required'],
    trim: true,
  },
  extraImg: {
    type: String,
    trim: true,
  },
  ExtraImg: {
    type: String,
    trim: true,
  },
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
  advantages: [{
    type: String,
    trim: true,
  }],
  application: [{
    type: String,
    trim: true,
  }],
  keyFeatures: [{
    type: String,
    trim: true,
  }],
  pdfURL: {
    type: String,
    trim: true,
  },
  features: [{
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
  storage: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    enum: ['synthetic-fibre', 'glass-fibre', 'steel-fibre', 'cellulose-fibre', 'anti-stripping', 'silica-fume'],
    required: [true, 'Category is required'],
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
productSchema.index({ slug: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
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

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, featured: true }).sort({ createdAt: -1 });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ isActive: true, category: category }).sort({ createdAt: -1 });
};

// Static method to find product by slug
productSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug, isActive: true });
};

module.exports = mongoose.model('Product', productSchema);
