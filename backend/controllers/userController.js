const Product = require('../models/product');
const User = require('../models/user');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 }
    };

    let products = await Product.find(query)
      .populate('seller', 'firstName lastName shopName')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Transform products to include full image URLs
    products = products.map(product => {
      const productObj = product.toObject();
      productObj.photos = productObj.photos.map(photo => 
        `http://localhost:5000/uploads/${photo}`  // Use absolute URL
      );
      return productObj;
    });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      errors: [error.message]
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('seller', 'shopName email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Transform product photos to include full URLs
    product.photos = product.photos.map(photo => 
      `http://localhost:5000/uploads/${photo}`
    );

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

exports.getRelatedProducts = async (req, res) => {
  try {
    const { category, exclude } = req.query;
    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    // Find related products
    const products = await Product.find({
      category: category,
      _id: { $ne: exclude }
    })
    .populate('seller', 'shopName')
    .limit(4)
    .lean();

    if (!products) {
      return res.status(404).json({
        success: false,
        message: 'No related products found'
      });
    }

    // Transform photos to full URLs
    const productsWithUrls = products.map(product => ({
      ...product,
      photos: product.photos.map(photo => 
        `http://localhost:5000/uploads/${photo}`
      )
    }));

    res.status(200).json({
      success: true,
      products: productsWithUrls
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products',
      error: error.message
    });
  }
};

exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ 
      userType: 'seller' 
    }).select('-password -__v').lean();

    // Get product count for each seller
    const sellersWithCounts = await Promise.all(sellers.map(async (seller) => {
      const productsCount = await Product.countDocuments({ seller: seller._id });
      return {
        ...seller,
        productsCount
      };
    }));

    res.status(200).json({
      success: true,
      sellers: sellersWithCounts
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers',
      error: error.message
    });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    // Find seller
    const seller = await User.findById(sellerId)
      .select('-password')
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Find seller's products
    const products = await Product.find({ seller: sellerId })
      .lean();

    res.status(200).json({
      success: true,
      seller,
      products
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller products',
      error: error.message
    });
  }
};