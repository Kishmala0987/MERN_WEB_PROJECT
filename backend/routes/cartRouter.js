const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.post('/add', auth, cartController.addToCart);
router.get('/', auth, cartController.getCart);
router.delete('/remove/:itemId', auth, cartController.removeFromCart);
router.put('/update/:itemId', auth, cartController.updateCartQuantity);
router.post('/checkout', auth, cartController.checkout); 
module.exports = router;