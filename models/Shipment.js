const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trackingNumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_transit', 'delivered', 'cancelled'],
        default: 'pending'
    },
    serviceType: {
        type: String,
        enum: ['express', 'standard', 'economy'],
        required: true
    },
    origin: {
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    destination: {
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    packageDetails: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        items: [{
            description: String,
            quantity: Number,
            value: Number
        }]
    },
    pricing: {
        basePrice: Number,
        taxes: Number,
        insurance: Number,
        additionalCharges: Number,
        totalPrice: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    timeline: {
        created: Date,
        estimated_delivery: Date,
        actual_delivery: Date
    },
    trackingUpdates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrackingUpdate'
    }],
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }
}, {
    timestamps: true
});

// Generate tracking number before saving
shipmentSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.trackingNumber = 'LT' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});

module.exports = mongoose.model('Shipment', shipmentSchema); 