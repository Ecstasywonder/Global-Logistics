const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    createInvoice,
    getInvoices,
    getInvoice,
    createPaymentIntent,
    handleWebhook,
    getBillingSummary
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

// Public webhook route
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);

router.route('/invoices')
    .get(getInvoices);

router.route('/invoices/:id')
    .get(getInvoice);

router.route('/payment-intent')
    .post(createPaymentIntent);

router.route('/summary')
    .get(getBillingSummary);

// Admin only routes
router.use(authorize('admin'));

router.route('/invoice/:shipmentId')
    .post(createInvoice);

module.exports = router; 