const express = require('express');
const Blog = require('../models/Blog');
const { validateBlog, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs with pagination
// @access  Public
router.get('/', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.findPublished()
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .sort({ publishDate: -1 });

    const total = await Blog.countDocuments({ isPublished: true });

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blogs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const blogs = await Blog.findFeatured().limit(6);

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
      },
    });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findBySlug(slug);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/blogs/search
// @desc    Search blogs
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

    const blogs = await Blog.find({
      isPublished: true,
      $or: [
        { name: searchRegex },
        { overview: searchRegex },
        { description: searchRegex },
      ],
    })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .sort({ publishDate: -1 });

    const total = await Blog.countDocuments({
      isPublished: true,
      $or: [
        { name: searchRegex },
        { overview: searchRegex },
        { description: searchRegex },
      ],
    });

    res.status(200).json({
      status: 'success',
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalBlogs: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        query: q,
      },
    });
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/blogs/categories
// @desc    Get blog categories (if implemented)
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // This endpoint can be extended if you add categories to blogs
    res.status(200).json({
      status: 'success',
      data: {
        categories: [],
        message: 'Categories feature not implemented yet',
      },
    });
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
