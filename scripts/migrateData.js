const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const Blog = require('../models/Blog');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  migrateData();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function migrateData() {
  try {
    console.log('🚀 Starting data migration...');

    // Clear existing data
    await Blog.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Migrate blogs
    const blogsPath = path.join(__dirname, '../../frontend/public/blogs.json');
    if (fs.existsSync(blogsPath)) {
      const blogsData = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));
      
      for (const blogData of blogsData) {
        const blog = new Blog({
          ...blogData,
          isPublished: true,
          featured: false,
        });
        await blog.save();
      }
      console.log(`✅ Migrated ${blogsData.length} blogs`);
    } else {
      console.log('⚠️  blogs.json not found, skipping blog migration');
    }

    // Migrate products
    const productsPath = path.join(__dirname, '../../frontend/public/projects.json');
    if (fs.existsSync(productsPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      
      for (const productData of productsData) {
        // Map the product data to our schema
        const product = new Product({
          slug: productData.slug,
          name: productData.name,
          bgImage: productData.bgImage,
          description: productData.description,
          extraLine: productData.extraLine,
          logoImg: productData.logoImg || [],
          overview: productData.overview,
          extraImg: productData.extraImg,
          ExtraImg: productData.ExtraImg,
          specifications: productData.specifications || [],
          advantages: productData.advantages || [],
          application: productData.application || [],
          keyFeatures: productData.keyFeatures || [],
          pdfURL: productData.pdfURL || '',
          features: productData.features || [],
          images: productData.images || [],
          storage: productData.storage || '',
          isActive: true,
          featured: false,
          category: mapSlugToCategory(productData.slug),
        });
        await product.save();
      }
      console.log(`✅ Migrated ${productsData.length} products`);
    } else {
      console.log('⚠️  projects.json not found, skipping product migration');
    }

    console.log('🎉 Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function mapSlugToCategory(slug) {
  const categoryMap = {
    'synthetic-fibre': 'synthetic-fibre',
    'antrocel-g': 'glass-fibre',
    'steel-fibre': 'steel-fibre',
    'cellulose-fiber-pellets': 'cellulose-fibre',
    'anti-stripping-agent': 'anti-stripping',
    'silica-fume': 'silica-fume',
  };
  
  return categoryMap[slug] || 'synthetic-fibre';
}
