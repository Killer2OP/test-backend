const express = require('express');
const Contact = require('../models/Contact');
const { validateContact, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContact, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
    } = req.body;

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    const contactData = {
      name,
      email,
      phone,
      company,
      subject,
      message,
      source: 'website',
      ipAddress,
      userAgent,
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      status: 'success',
      message: 'Contact form submitted successfully. We will get back to you soon.',
      data: {
        contactId: contact._id,
      },
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error. Please try again later.',
    });
  }
});

// @route   GET /api/contact/stats
// @desc    Get contact form statistics (for admin dashboard)
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const inProgressContacts = await Contact.countDocuments({ status: 'in-progress' });
    const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });
    const closedContacts = await Contact.countDocuments({ status: 'closed' });

    // Get contacts by priority
    const lowPriority = await Contact.countDocuments({ priority: 'low' });
    const mediumPriority = await Contact.countDocuments({ priority: 'medium' });
    const highPriority = await Contact.countDocuments({ priority: 'high' });
    const urgentPriority = await Contact.countDocuments({ priority: 'urgent' });

    // Get recent contacts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalContacts,
        statusBreakdown: {
          new: newContacts,
          inProgress: inProgressContacts,
          resolved: resolvedContacts,
          closed: closedContacts,
        },
        priorityBreakdown: {
          low: lowPriority,
          medium: mediumPriority,
          high: highPriority,
          urgent: urgentPriority,
        },
        recentContacts,
      },
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/contact/recent
// @desc    Get recent contacts (for admin dashboard)
// @access  Private (Admin only)
router.get('/recent', validatePagination, async (req, res) => {
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
    console.error('Get recent contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   GET /api/contact/status/:status
// @desc    Get contacts by status (for admin dashboard)
// @access  Private (Admin only)
router.get('/status/:status', validatePagination, async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const contacts = await Contact.findByStatus(status)
      .populate('assignedTo', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select('-__v');

    const total = await Contact.countDocuments({ status });

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
        status,
      },
    });
  } catch (error) {
    console.error('Get contacts by status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
