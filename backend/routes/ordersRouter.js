const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.get('/', auth, orderController.getOrders);
router.delete('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;