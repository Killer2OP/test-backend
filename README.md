# Shivananda Marketing Pvt. Ltd. - Backend API

A secure Node.js backend API with admin dashboard for managing Shivananda Marketing's construction materials website.

## 🚀 Features

### Security Features
- **JWT Authentication** with secure token management
- **Account Lockout** after 5 failed login attempts (2-hour lockout)
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **XSS Protection** and NoSQL injection prevention
- **CORS Configuration** for frontend integration
- **Helmet.js** for security headers

### Admin Dashboard
- **Secure Login** with MongoDB Atlas authentication
- **Real-time Dashboard** with statistics
- **Blog Management** (CRUD operations)
- **Product Management** (CRUD operations)
- **Contact Management** with status tracking
- **Responsive Design** with modern UI

### API Endpoints
- **Public APIs** for frontend data consumption
- **Admin APIs** for content management
- **Contact Form** submission
- **Search Functionality** for blogs and products

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

## 🛠️ Installation

### 1. Clone and Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Environment Variables
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shivananda_db?retryWrites=true&w=majority

# JWT Secret (Generate a strong secret key)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_secure

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Credentials (These will be used to create the initial admin)
ADMIN_EMAIL=admin@shivananda.com
ADMIN_PASSWORD=Admin@123456

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Database Setup
```bash
# Run data migration to import existing JSON data
node scripts/migrateData.js
```

### 5. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔐 Admin Access

### Default Admin Credentials
- **Email**: admin@shivananda.com
- **Password**: Admin@123456

**⚠️ Important**: Change the default password after first login!

### Admin Dashboard URL
```
http://localhost:5000/admin
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@shivananda.com",
  "password": "Admin@123456"
}
```

#### Get Current Admin
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

### Public API Endpoints

#### Get All Blogs
```http
GET /api/blogs?page=1&limit=10
```

#### Get Featured Blogs
```http
GET /api/blogs/featured
```

#### Get Blog by Slug
```http
GET /api/blogs/{slug}
```

#### Search Blogs
```http
GET /api/blogs/search?q=search_term&page=1&limit=10
```

#### Get All Products
```http
GET /api/products?page=1&limit=10
```

#### Get Products by Category
```http
GET /api/products/category/{category}
```

#### Get Product by Slug
```http
GET /api/products/{slug}
```

#### Search Products
```http
GET /api/products/search?q=search_term&page=1&limit=10
```

#### Submit Contact Form
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "ABC Company",
  "subject": "Inquiry about products",
  "message": "I would like to know more about your products."
}
```

### Admin API Endpoints

All admin endpoints require authentication with `Authorization: Bearer <token>` header.

#### Dashboard Statistics
```http
GET /api/admin/dashboard
```

#### Blog Management
```http
# Get all blogs
GET /api/admin/blogs

# Create blog
POST /api/admin/blogs

# Get blog by ID
GET /api/admin/blogs/{id}

# Update blog
PUT /api/admin/blogs/{id}

# Delete blog
DELETE /api/admin/blogs/{id}
```

#### Product Management
```http
# Get all products
GET /api/admin/products

# Create product
POST /api/admin/products

# Get product by ID
GET /api/admin/products/{id}

# Update product
PUT /api/admin/products/{id}

# Delete product
DELETE /api/admin/products/{id}
```

#### Contact Management
```http
# Get all contacts
GET /api/admin/contacts

# Get contact by ID
GET /api/admin/contacts/{id}

# Update contact status
PUT /api/admin/contacts/{id}/status

# Assign contact to admin
PUT /api/admin/contacts/{id}/assign

# Delete contact
DELETE /api/admin/contacts/{id}
```

## 🗄️ Database Schema

### Admin Collection
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin'], default: 'admin'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Blog Collection
```javascript
{
  slug: String (unique, required),
  name: String (required),
  bgImage: String (required),
  image: String (required),
  publishDate: String (required),
  overview: String (required),
  description: String,
  application: [{
    title: String,
    description: String
  }],
  challenges: [{
    title: String,
    description: String
  }],
  specifications: [{
    title: String,
    value: String
  }],
  images: [String],
  totalUsers: Number (default: 0),
  isPublished: Boolean (default: true),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  slug: String (unique, required),
  name: String (required),
  bgImage: String (required),
  description: String (required),
  overview: String (required),
  category: String (enum: ['synthetic-fibre', 'glass-fibre', 'steel-fibre', 'cellulose-fibre', 'anti-stripping', 'silica-fume']),
  specifications: [{
    title: String,
    value: String
  }],
  application: [String],
  keyFeatures: [String],
  images: [String],
  isActive: Boolean (default: true),
  featured: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Collection
```javascript
{
  name: String (required),
  email: String (required),
  phone: String (required),
  company: String,
  subject: String (required),
  message: String (required),
  status: String (enum: ['new', 'in-progress', 'resolved', 'closed'], default: 'new'),
  priority: String (enum: ['low', 'medium', 'high', 'urgent'], default: 'medium'),
  assignedTo: ObjectId (ref: 'Admin'),
  response: String,
  respondedAt: Date,
  source: String (enum: ['website', 'email', 'phone', 'other'], default: 'website'),
  ipAddress: String,
  userAgent: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens** with 24-hour expiration
- **Password Hashing** using bcrypt with salt rounds of 12
- **Account Lockout** after 5 failed attempts (2-hour lockout)
- **Secure Password Requirements** (8+ chars, uppercase, lowercase, number, special char)

### API Security
- **Rate Limiting** (100 requests per 15 minutes per IP)
- **CORS Protection** with configurable origins
- **Input Validation** using express-validator
- **XSS Protection** using xss library
- **NoSQL Injection Prevention** using express-mongo-sanitize
- **Parameter Pollution Protection** using hpp
- **Security Headers** using helmet.js

### Data Security
- **MongoDB Atlas** with encrypted connections
- **Environment Variables** for sensitive configuration
- **Input Sanitization** for all user inputs
- **SQL Injection Prevention** (NoSQL database)

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_very_strong_production_jwt_secret
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### PM2 Process Manager
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "shivananda-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shivananda.com","password":"Admin@123456"}'
```

## 📝 Development

### Project Structure
```
backend/
├── models/           # MongoDB schemas
├── routes/           # API route handlers
├── middleware/       # Custom middleware
├── utils/            # Utility functions
├── scripts/          # Migration and utility scripts
├── public/           # Static files (admin dashboard)
└── server.js         # Main server file
```

### Adding New Features
1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Update admin dashboard in `public/admin/`
4. Add validation in `middleware/validation.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Shivananda Marketing Pvt. Ltd.

## 🆘 Support

For technical support or questions, please contact the development team.

---

**⚠️ Security Notice**: This backend includes comprehensive security measures. Always keep your JWT secret secure and change default admin credentials in production.
