const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, company } = req.body;

    // Create user
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        company
    });

    // Create verification token
    const verificationToken = user.getVerificationToken();
    await user.save();

    // Create verification url
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

    // Send email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            template: 'verification',
            data: {
                name: user.firstName,
                url: verificationUrl
            }
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        user.verificationToken = undefined;
        user.verificationExpire = undefined;
        await user.save();

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if email is verified
    if (!user.isVerified) {
        return next(new ErrorResponse('Please verify your email address', 401));
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken,
        verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            template: 'resetPassword',
            data: {
                name: user.firstName,
                url: resetUrl
            }
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
}; 