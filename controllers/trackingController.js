const TrackingUpdate = require('../models/TrackingUpdate');
const Shipment = require('../models/Shipment');
const { validationResult } = require('express-validator');

// @desc    Add tracking update
// @route   POST /api/tracking/:shipmentId
// @access  Private (Staff/Admin)
exports.addTrackingUpdate = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Create tracking update
        const trackingUpdate = await TrackingUpdate.create({
            shipment: shipment._id,
            status: req.body.status,
            description: req.body.description,
            location: req.body.location,
            updatedBy: req.user.id
        });

        // Update shipment status
        shipment.status = req.body.status;
        if (req.body.status === 'delivered') {
            shipment.timeline.actual_delivery = Date.now();
        }
        await shipment.save();

        // Add tracking update to shipment
        await Shipment.findByIdAndUpdate(
            shipment._id,
            { $push: { trackingUpdates: trackingUpdate._id } }
        );

        res.status(201).json({
            success: true,
            data: trackingUpdate
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get tracking updates for a shipment
// @route   GET /api/tracking/:shipmentId
// @access  Private
exports.getTrackingUpdates = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId)
            .populate({
                path: 'trackingUpdates',
                options: { sort: { timestamp: -1 } }
            });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Check authorization
        if (shipment.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view these tracking updates'
            });
        }

        res.status(200).json({
            success: true,
            data: shipment.trackingUpdates
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get latest tracking update
// @route   GET /api/tracking/:shipmentId/latest
// @access  Private
exports.getLatestUpdate = async (req, res, next) => {
    try {
        const latestUpdate = await TrackingUpdate.findOne({
            shipment: req.params.shipmentId
        }).sort({ timestamp: -1 });

        if (!latestUpdate) {
            return res.status(404).json({
                success: false,
                message: 'No tracking updates found'
            });
        }

        res.status(200).json({
            success: true,
            data: latestUpdate
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Track shipment by tracking number (public)
// @route   GET /api/tracking/track/:trackingNumber
// @access  Public
exports.trackShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findOne({
            trackingNumber: req.params.trackingNumber
        }).populate({
            path: 'trackingUpdates',
            options: { sort: { timestamp: -1 } }
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Invalid tracking number'
            });
        }

        // Return limited shipment info for public tracking
        const publicShipmentInfo = {
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            origin: {
                city: shipment.origin.city,
                country: shipment.origin.country
            },
            destination: {
                city: shipment.destination.city,
                country: shipment.destination.country
            },
            timeline: shipment.timeline,
            trackingUpdates: shipment.trackingUpdates
        };

        res.status(200).json({
            success: true,
            data: publicShipmentInfo
        });
    } catch (error) {
        next(error);
    }
}; 