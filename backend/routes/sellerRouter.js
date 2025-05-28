const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, isSeller } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');
const ordersController = require('../controllers/orderController');
// Multer setup for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload images only.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).array('photos', 5);

// Wrap multer middleware in try-catch
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        errors: [err.message]
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        errors: ['Error uploading files']
      });
    }
    next();
  });
};
router.get('/orders', auth, isSeller, sellerController.getSellerOrders);
router.post('/product/upload', auth, isSeller, handleUpload, sellerController.postProduct);
router.get('/products', auth, isSeller, sellerController.getSellerProducts);
router.get('/product/:id', auth, isSeller, sellerController.getProductById);
router.put('/product/:id', auth, isSeller, handleUpload, sellerController.updateProduct);
router.delete('/product/:id', auth, isSeller, sellerController.deleteProduct);
router.put('/orders/:orderId/status', auth, isSeller, sellerController.updateOrderStatus);

module.exports = router;