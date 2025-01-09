const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shipment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
        required: true
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'issued', 'paid', 'overdue', 'cancelled'],
        default: 'draft'
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        amount: Number
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'cash']
    },
    paymentDetails: {
        transactionId: String,
        paidAmount: Number,
        paidDate: Date
    },
    billingAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    }
}, {
    timestamps: true
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await this.constructor.countDocuments();
        this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema); 