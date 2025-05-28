const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        errors: ['Authentication required']
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Add debug log
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        errors: ['Invalid or expired token']
      });
    }

    // Use id instead of userId to match your token structure
    const user = await User.findById(decoded.userId);
    
    // Add debug log

    if (!user) {
      return res.status(401).json({
        success: false,
        errors: ['User not found']
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      success: false,
      errors: ['Server error during authentication']
    });
  }
};

// Middleware to check if user is a seller
const isSeller = async (req, res, next) => {
  try {
    if (req.user.userType !== 'seller') {
      return res.status(403).json({
        success: false,
        errors: ['Seller access required']
      });
    }
    next();
  } catch (error) {
    console.error('Seller check error:', error);
    res.status(403).json({
      success: false,
      errors: ['Access denied']
    });
  }
};

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        errors: ['Admin access required']
      });
    }
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      errors: ['Access denied']
    });
  }
};

module.exports = {
  auth,
  isSeller,
  isAdmin
};