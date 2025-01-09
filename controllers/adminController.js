const User = require('../models/User');
const Shipment = require('../models/Shipment');
const TrackingUpdate = require('../models/TrackingUpdate');
const SupportTicket = require('../models/SupportTicket');
const { validationResult } = require('express-validator');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            pendingShipments,
            activeShipments,
            pendingUsers,
            supportTickets
        ] = await Promise.all([
            Shipment.countDocuments({ status: 'pending' }),
            Shipment.countDocuments({ status: 'in_transit' }),
            User.countDocuments({ isVerified: false }),
            SupportTicket.countDocuments({ status: 'open' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                pendingShipments,
                activeShipments,
                pendingUsers,
                supportTickets
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending user verifications
// @route   GET /api/admin/users/pending
// @access  Private (Admin)
exports.getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isVerified: false })
            .select('-password')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify user account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin)
exports.verifyUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                isVerified: true,
                verifiedAt: Date.now()
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Send verification email to user
        // TODO: Implement email notification

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending shipments
// @route   GET /api/admin/shipments/pending
// @access  Private (Admin)
exports.getPendingShipments = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({ status: 'pending' })
            .populate('user', 'firstName lastName email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: shipments.length,
            data: shipments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process new shipment
// @route   PUT /api/admin/shipments/:id/process
// @access  Private (Admin)
exports.processShipment = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Update shipment status and assign tracking number
        shipment.status = 'processing';
        shipment.trackingNumber = generateTrackingNumber();
        await shipment.save();

        // Create initial tracking update
        await TrackingUpdate.create({
            shipment: shipment._id,
            status: 'processing',
            description: 'Shipment has been processed and tracking number assigned',
            location: shipment.origin,
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

// @desc    Get support tickets
// @route   GET /api/admin/support
// @access  Private (Admin)
exports.getSupportTickets = async (req, res, next) => {
    try {
        const tickets = await SupportTicket.find()
            .populate('user', 'firstName lastName email')
            .populate('shipment', 'trackingNumber')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update support ticket
// @route   PUT /api/admin/support/:id
// @access  Private (Admin)
exports.updateSupportTicket = async (req, res, next) => {
    try {
        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        next(error);
    }
};

// Utility function to generate tracking number
const generateTrackingNumber = () => {
    const prefix = 'LT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}; 