const express = require('express');
const Blog = require('../models/Blog');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const { validateBlog, validateProduct, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// ==================== DASHBOARD STATS ====================

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    // Get blog statistics
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ isPublished: true });
    const draftBlogs = await Blog.countDocuments({ isPublished: false });
    const featuredBlogs = await Blog.countDocuments({ featured: true });

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ featured: true });

    // Get contact statistics
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

    // Get recent activity
    const recentBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name slug createdAt isPublished');

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name slug createdAt isActive');

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt');

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          blogs: {
            total: totalBlogs,
            published: publishedBlogs,
            draft: draftBlogs,
            featured: featuredBlogs,
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            featured: featuredProducts,
          },
          contacts: {
            total: totalContacts,
            new: newContacts,
            inProgress: inProgressContacts,
            resolved: resolvedContacts,
          },
        },
        recentActivity: {
          blogs: recentBlogs,
          products: recentProducts,
          contacts: recentContacts,
        },
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// ==================== BLOG MANAGEMENT ====================

// @route   GET /api/admin/blogs
// @desc    Get all blogs for admin (including unpublished)
// @access  Private (Admin only)
router.get('/blogs', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-__v');

    const total = await Blog.countDocuments();

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
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/admin/blogs
// @desc    Create new blog
// @access  Private (Admin only)
router.post('/blogs', validateBlog, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      isPublished: req.body.isPublished !== undefined ? req.body.isPublished : true,
    };

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      status: 'success',
      message: 'Blog created successfully',
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/admin/blogs/:id
// @desc    Get single blog by ID
// @access  Private (Admin only)
router.get('/blogs/:id', validateObjectId('id'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

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
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   PUT /api/admin/blogs/:id
// @desc    Update blog
// @access  Private (Admin only)
router.put('/blogs/:id', validateObjectId('id'), validateBlog, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Blog updated successfully',
      data: {
        blog,
      },
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete blog
// @access  Private (Admin only)
router.delete('/blogs/:id', validateObjectId('id'), async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// @route   GET /api/admin/products
// @desc    Get all products for admin (including inactive)
// @access  Private (Admin only)
router.get('/products', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-__v');

    const total = await Product.countDocuments();

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
    console.error('Get admin products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/products', validateProduct, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Product created successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get single product by ID
// @access  Private (Admin only)
router.get('/products/:id', validateObjectId('id'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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
    console.error('Get product by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/products/:id', validateObjectId('id'), validateProduct, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      data: {
        product,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/products/:id', validateObjectId('id'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// ==================== CONTACT MANAGEMENT ====================

// @route   GET /api/admin/contacts
// @desc    Get all contacts for admin
// @access  Private (Admin only)
router.get('/contacts', validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.find()
      .populate('assignedTo', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-__v');

    const total = await Contact.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContacts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get admin contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/admin/contacts/:id
// @desc    Get single contact by ID
// @access  Private (Admin only)
router.get('/contacts/:id', validateObjectId('id'), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('assignedTo', 'email');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   PUT /api/admin/contacts/:id/status
// @desc    Update contact status
// @access  Private (Admin only)
router.put('/contacts/:id/status', validateObjectId('id'), async (req, res) => {
  try {
    const { status, response } = req.body;
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const updateData = { status };
    if (response) {
      updateData.response = response;
      updateData.respondedAt = new Date();
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'email');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact status updated successfully',
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   PUT /api/admin/contacts/:id/assign
// @desc    Assign contact to admin
// @access  Private (Admin only)
router.put('/contacts/:id/assign', validateObjectId('id'), async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: assignedTo || req.admin._id,
        status: 'in-progress'
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'email');

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact assigned successfully',
      data: {
        contact,
      },
    });
  } catch (error) {
    console.error('Assign contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   DELETE /api/admin/contacts/:id
// @desc    Delete contact
// @access  Private (Admin only)
router.delete('/contacts/:id', validateObjectId('id'), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
