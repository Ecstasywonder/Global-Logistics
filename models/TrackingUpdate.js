const mongoose = require('mongoose');

const trackingUpdateSchema = new mongoose.Schema({
    shipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: [
            'order_received',
            'processing',
            'in_transit',
            'out_for_delivery',
            'delivered',
            'failed_delivery',
            'cancelled'
        ]
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: String,
        city: String,
        country: String
    },
    description: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Index for geospatial queries
trackingUpdateSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('TrackingUpdate', trackingUpdateSchema); 