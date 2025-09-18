const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided or invalid format.',
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if admin still exists and is active
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (!admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token. Admin not found.',
        });
      }

      if (!admin.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated.',
        });
      }

      if (admin.isLocked) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is temporarily locked due to multiple failed login attempts.',
        });
      }

      // Add admin info to request
      req.admin = admin;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token expired. Please login again.',
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token.',
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.',
    });
  }
};

// Middleware to check if admin has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. Authentication required.',
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

// Middleware to check if admin is not locked
const requireUnlocked = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. Authentication required.',
    });
  }

  if (req.admin.isLocked) {
    return res.status(401).json({
      status: 'error',
      message: 'Account is temporarily locked due to multiple failed login attempts.',
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireUnlocked,
};
