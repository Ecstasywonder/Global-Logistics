const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Add payment method
// @route   POST /api/users/payment-methods
// @access  Private
exports.addPaymentMethod = async (req, res, next) => {
    try {
        const { paymentMethodId } = req.body;

        // Get payment method details from Stripe
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

        // Add to user's payment methods
        const user = await User.findById(req.user.id);
        user.paymentMethods.push({
            type: paymentMethod.type,
            lastFour: paymentMethod.card.last4,
            expiryDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`,
            stripePaymentMethodId: paymentMethodId,
            isDefault: user.paymentMethods.length === 0 // Make default if first
        });

        await user.save();

        res.status(200).json({
            success: true,
            data: user.paymentMethods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove payment method
// @route   DELETE /api/users/payment-methods/:id
// @access  Private
exports.removePaymentMethod = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const paymentMethod = user.paymentMethods.id(req.params.id);

        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        // Remove from Stripe if exists
        if (paymentMethod.stripePaymentMethodId) {
            await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
        }

        paymentMethod.remove();
        await user.save();

        res.status(200).json({
            success: true,
            data: user.paymentMethods
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set default payment method
// @route   PUT /api/users/payment-methods/:id/default
// @access  Private
exports.setDefaultPaymentMethod = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Remove default from all methods
        user.paymentMethods.forEach(method => {
            method.isDefault = false;
        });

        // Set new default
        const paymentMethod = user.paymentMethods.id(req.params.id);
        if (!paymentMethod) {
            return res.status(404).json({
                success: false,
                message: 'Payment method not found'
            });
        }

        paymentMethod.isDefault = true;
        await user.save();

        res.status(200).json({
            success: true,
            data: user.paymentMethods
        });
    } catch (error) {
        next(error);
    }
}; 