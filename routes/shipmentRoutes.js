const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    createShipment,
    getShipments,
    getShipment,
    updateShipment,
    cancelShipment,
    getShipmentRates
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');

// Validation middleware
const shipmentValidation = [
    check('serviceType', 'Service type is required').not().isEmpty(),
    check('origin', 'Origin details are required').not().isEmpty(),
    check('destination', 'Destination details are required').not().isEmpty(),
    check('packageDetails', 'Package details are required').not().isEmpty(),
];

router.route('/')
    .post(protect, shipmentValidation, createShipment)
    .get(protect, getShipments);

router.route('/rates')
    .post(protect, getShipmentRates);

router.route('/:id')
    .get(protect, getShipment)
    .put(protect, updateShipment);

router.route('/:id/cancel')
    .put(protect, cancelShipment);

// Admin only routes
router.use(authorize('admin'));

// Add any admin-specific routes here

module.exports = router; 