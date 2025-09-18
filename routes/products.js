const express = require('express');
const Product = require('../models/Product');
const { validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all active products with pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.findActive()
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.findFeatured().limit(6);

    res.status(200).json({
      status: 'success',
      data: {
        products,
      },
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', validatePagination, async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validCategories = ['synthetic-fibre', 'glass-fibre', 'steel-fibre', 'cellulose-fibre', 'anti-stripping', 'silica-fume'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category',
      });
    }

    const products = await Product.findByCategory(category)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({ isActive: true, category });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        category,
      },
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findBySlug(slug);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', validatePagination, async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { overview: searchRegex },
      ],
    })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { overview: searchRegex },
      ],
    });

    res.status(200).json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        query: q,
      },
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: 'synthetic-fibre', label: 'Synthetic Fibre' },
      { value: 'glass-fibre', label: 'Glass Fibre' },
      { value: 'steel-fibre', label: 'Steel Fibre' },
      { value: 'cellulose-fibre', label: 'Cellulose Fibre' },
      { value: 'anti-stripping', label: 'Anti Stripping Agent' },
      { value: 'silica-fume', label: 'Silica Fume' },
    ];

    res.status(200).json({
      status: 'success',
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Get product categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
