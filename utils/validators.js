const { check } = require('express-validator');

exports.shipmentValidators = {
    create: [
        check('serviceType')
            .isIn(['express', 'standard', 'economy'])
            .withMessage('Invalid service type'),
        check('origin.address').notEmpty().withMessage('Origin address is required'),
        check('origin.city').notEmpty().withMessage('Origin city is required'),
        check('origin.country').notEmpty().withMessage('Origin country is required'),
        check('destination.address').notEmpty().withMessage('Destination address is required'),
        check('destination.city').notEmpty().withMessage('Destination city is required'),
        check('destination.country').notEmpty().withMessage('Destination country is required'),
        check('packageDetails.weight')
            .isNumeric()
            .withMessage('Package weight must be a number'),
        check('packageDetails.dimensions')
            .isObject()
            .withMessage('Package dimensions are required')
    ],
    update: [
        check('status')
            .optional()
            .isIn(['pending', 'in_transit', 'delivered', 'cancelled'])
            .withMessage('Invalid status')
    ]
};

exports.userValidators = {
    register: [
        check('firstName').notEmpty().withMessage('First name is required'),
        check('lastName').notEmpty().withMessage('Last name is required'),
        check('email').isEmail().withMessage('Please include a valid email'),
        check('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
    ],
    updateProfile: [
        check('email').optional().isEmail().withMessage('Please include a valid email'),
        check('phone')
            .optional()
            .matches(/^\+?[\d\s-]+$/)
            .withMessage('Invalid phone number format')
    ]
};

exports.invoiceValidators = {
    create: [
        check('billingAddress').notEmpty().withMessage('Billing address is required'),
        check('billingAddress.street').notEmpty().withMessage('Street address is required'),
        check('billingAddress.city').notEmpty().withMessage('City is required'),
        check('billingAddress.country').notEmpty().withMessage('Country is required')
    ]
}; 