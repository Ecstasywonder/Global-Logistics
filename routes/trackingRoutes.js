const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
    addTrackingUpdate,
    getTrackingUpdates,
    getLatestUpdate,
    trackShipment
} = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

// Validation middleware
const trackingUpdateValidation = [
    check('status', 'Status is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('location', 'Location details are required').not().isEmpty()
];

// Public tracking route
router.get('/track/:trackingNumber', trackShipment);

// Protected routes
router.use(protect);

router.route('/:shipmentId')
    .post(authorize('admin', 'staff'), trackingUpdateValidation, addTrackingUpdate)
    .get(getTrackingUpdates);

router.get('/:shipmentId/latest', getLatestUpdate);

module.exports = router; 