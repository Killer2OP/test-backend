const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }

  next();
};

// Admin login validation
const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
  handleValidationErrors,
  sanitizeInput
];

// Admin password change validation
const validatePasswordChange = [
  body('currentPassword')
    .isLength({ min: 1 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  handleValidationErrors,
  sanitizeInput
];

// Blog validation
const validateBlog = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Blog name is required and must not exceed 200 characters')
    .trim(),
  body('slug')
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('bgImage')
    .isLength({ min: 1 })
    .withMessage('Background image is required'),
  body('image')
    .isLength({ min: 1 })
    .withMessage('Main image is required'),
  body('publishDate')
    .isLength({ min: 1 })
    .withMessage('Publish date is required'),
  body('overview')
    .isLength({ min: 1 })
    .withMessage('Overview is required'),
  body('application')
    .optional()
    .isArray()
    .withMessage('Application must be an array'),
  body('challenges')
    .optional()
    .isArray()
    .withMessage('Challenges must be an array'),
  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('totalUsers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total users must be a non-negative integer'),
  handleValidationErrors,
  sanitizeInput
];

// Product validation
const validateProduct = [
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must not exceed 200 characters')
    .trim(),
  body('slug')
    .optional()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),
  body('description')
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('overview')
    .isLength({ min: 1 })
    .withMessage('Overview is required'),
  body('category')
    .isIn(['synthetic-fibre', 'glass-fibre', 'steel-fibre', 'cellulose-fibre', 'anti-stripping', 'silica-fume'])
    .withMessage('Invalid category'),
  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),
  body('application')
    .optional()
    .isArray()
    .withMessage('Application must be an array'),
  body('keyFeatures')
    .optional()
    .isArray()
    .withMessage('Key features must be an array'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  handleValidationErrors,
  sanitizeInput
];

// Contact form validation
const validateContact = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must not exceed 100 characters')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  body('phone')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must not exceed 200 characters')
    .trim(),
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message is required and must not exceed 2000 characters')
    .trim(),
  body('company')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Company name must not exceed 200 characters')
    .trim(),
  handleValidationErrors,
  sanitizeInput
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateAdminLogin,
  validatePasswordChange,
  validateBlog,
  validateProduct,
  validateContact,
  validateObjectId,
  validatePagination,
};
