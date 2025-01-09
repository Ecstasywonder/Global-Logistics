const express = require('express');
const router = express.Router();
const {
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.route('/payment-methods')
    .post(protect, addPaymentMethod);

router.route('/payment-methods/:id')
    .delete(protect, removePaymentMethod);

router.route('/payment-methods/:id/default')
    .put(protect, setDefaultPaymentMethod);

module.exports = router; 