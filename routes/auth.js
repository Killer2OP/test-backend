const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { validateAdminLogin, validatePasswordChange } = require('../middleware/validation');

const router = express.Router();

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign(
    { adminId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @route   POST /api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    console.log("Login password:", password);
    console.log("Admin password hash:", admin.password);

    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    // Reset login attempts and update last login
    await admin.resetLoginAttempts();
    await admin.updateLastLogin();

    // Generate token
    const token = generateToken(admin._id);

    // Return admin info and token
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
        },
        token,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Admin logout (client-side token removal)
// @access  Private
router.post('/logout', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout successful',
  });
});

// @route   GET /api/auth/me
// @desc    Get current admin info
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.adminId).select('-password');

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or admin not found.',
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          admin: {
            id: admin._id,
            email: admin.email,
            role: admin.role,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt,
          },
        },
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired. Please login again.',
        });
      } else {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token.',
        });
      }
    }
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change admin password
// @access  Private
router.put('/change-password', validatePasswordChange, async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7);
    const { currentPassword, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.adminId);

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or admin not found.',
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password is incorrect',
        });
      }

      // Update password
      admin.password = newPassword;
      await admin.save();

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired. Please login again.',
        });
      } else {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token.',
        });
      }
    }
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: {
          adminId: decoded.adminId,
          exp: decoded.exp,
        },
      });
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired',
        });
      } else {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token',
        });
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

module.exports = router;
