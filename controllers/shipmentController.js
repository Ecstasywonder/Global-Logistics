const Shipment = require('../models/Shipment');
const TrackingUpdate = require('../models/TrackingUpdate');
const Invoice = require('../models/Invoice');
const { validationResult } = require('express-validator');

// @desc    Create new shipment
// @route   POST /api/shipments
// @access  Private
exports.createShipment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Add user to request body
        req.body.user = req.user.id;

        const shipment = await Shipment.create(req.body);

        // Create initial tracking update
        await TrackingUpdate.create({
            shipment: shipment._id,
            status: 'order_received',
            description: 'Order has been received and is being processed',
            location: req.body.origin,
            updatedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all shipments for a user
// @route   GET /api/shipments
// @access  Private
exports.getShipments = async (req, res, next) => {
    try {
        const query = { user: req.user.id };

        // Add filters
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.serviceType) {
            query.serviceType = req.query.serviceType;
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const shipments = await Shipment.find(query)
            .populate('trackingUpdates')
            .sort('-createdAt')
            .skip(startIndex)
            .limit(limit);

        const total = await Shipment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: shipments.length,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            data: shipments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
exports.getShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.id)
            .populate('trackingUpdates')
            .populate('invoice');

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Make sure user owns shipment
        if (shipment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this shipment'
            });
        }

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update shipment
// @route   PUT /api/shipments/:id
// @access  Private
exports.updateShipment = async (req, res, next) => {
    try {
        let shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Make sure user owns shipment or is admin
        if (shipment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this shipment'
            });
        }

        shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel shipment
// @route   PUT /api/shipments/:id/cancel
// @access  Private
exports.cancelShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Check if shipment can be cancelled
        if (shipment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Shipment cannot be cancelled at this stage'
            });
        }

        // Update shipment status
        shipment.status = 'cancelled';
        await shipment.save();

        // Create tracking update for cancellation
        await TrackingUpdate.create({
            shipment: shipment._id,
            status: 'cancelled',
            description: 'Shipment has been cancelled',
            updatedBy: req.user.id
        });

        res.status(200).json({
            success: true,
            data: shipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get shipment rates
// @route   POST /api/shipments/rates
// @access  Private
exports.getShipmentRates = async (req, res, next) => {
    try {
        // Calculate shipping rates based on package details and distance
        const { origin, destination, packageDetails, serviceType } = req.body;

        // Mock rate calculation (replace with actual rate calculation logic)
        const baseRate = 50;
        const weightRate = packageDetails.weight * 2;
        const distanceRate = 10; // Calculate based on origin and destination
        const serviceMultiplier = serviceType === 'express' ? 1.5 : 1;

        const totalRate = (baseRate + weightRate + distanceRate) * serviceMultiplier;

        res.status(200).json({
            success: true,
            data: {
                baseRate,
                weightRate,
                distanceRate,
                totalRate,
                currency: 'USD'
            }
        });
    } catch (error) {
        next(error);
    }
}; 