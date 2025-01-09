const Invoice = require('../models/Invoice');
const Shipment = require('../models/Shipment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validationResult } = require('express-validator');

// @desc    Create invoice for shipment
// @route   POST /api/billing/invoice/:shipmentId
// @access  Private (Admin)
exports.createInvoice = async (req, res, next) => {
    try {
        const shipment = await Shipment.findById(req.params.shipmentId);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Calculate invoice items based on shipment details
        const items = [{
            description: `Shipping Service - ${shipment.serviceType}`,
            quantity: 1,
            unitPrice: shipment.pricing.basePrice,
            amount: shipment.pricing.basePrice
        }];

        if (shipment.pricing.insurance > 0) {
            items.push({
                description: 'Insurance',
                quantity: 1,
                unitPrice: shipment.pricing.insurance,
                amount: shipment.pricing.insurance
            });
        }

        const invoice = await Invoice.create({
            user: shipment.user,
            shipment: shipment._id,
            items,
            subtotal: shipment.pricing.basePrice + shipment.pricing.insurance,
            tax: shipment.pricing.taxes,
            total: shipment.pricing.totalPrice,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            billingAddress: req.body.billingAddress
        });

        // Update shipment with invoice reference
        await Shipment.findByIdAndUpdate(shipment._id, { invoice: invoice._id });

        res.status(201).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all invoices for a user
// @route   GET /api/billing/invoices
// @access  Private
exports.getInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ user: req.user.id })
            .populate('shipment', 'trackingNumber serviceType')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single invoice
// @route   GET /api/billing/invoices/:id
// @access  Private
exports.getInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('shipment')
            .populate('user', 'firstName lastName email');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Check authorization
        if (invoice.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this invoice'
            });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create payment intent
// @route   POST /api/billing/payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { amount, currency = 'usd', invoiceId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: { invoiceId }
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process payment webhook
// @route   POST /api/billing/webhook
// @access  Public
exports.handleWebhook = async (req, res, next) => {
    try {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: `Webhook Error: ${err.message}`
            });
        }

        // Handle successful payment
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const invoiceId = paymentIntent.metadata.invoiceId;

            // Update invoice status
            await Invoice.findByIdAndUpdate(invoiceId, {
                status: 'paid',
                'paymentDetails.transactionId': paymentIntent.id,
                'paymentDetails.paidAmount': paymentIntent.amount / 100,
                'paymentDetails.paidDate': new Date()
            });
        }

        res.status(200).json({ received: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Get billing summary
// @route   GET /api/billing/summary
// @access  Private
exports.getBillingSummary = async (req, res, next) => {
    try {
        const [totalPaid, totalPending, recentInvoices] = await Promise.all([
            Invoice.aggregate([
                { $match: { user: req.user._id, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Invoice.aggregate([
                { $match: { user: req.user._id, status: 'issued' } },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),
            Invoice.find({ user: req.user._id })
                .sort('-createdAt')
                .limit(5)
                .populate('shipment', 'trackingNumber')
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalPaid: totalPaid[0]?.total || 0,
                totalPending: totalPending[0]?.total || 0,
                recentInvoices
            }
        });
    } catch (error) {
        next(error);
    }
}; 