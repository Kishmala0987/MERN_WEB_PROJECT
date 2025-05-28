const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/explore', userController.getAllProducts);
router.get('/sellers', userController.getAllSellers); 
router.get('/related', userController.getRelatedProducts);
router.get('/:id', userController.getProductById);
router.get('/seller/:sellerId', userController.getSellerProducts);
module.exports = router;