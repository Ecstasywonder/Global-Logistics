const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

const securityMiddleware = (app) => {
    // Set security headers
    app.use(helmet());

    // Prevent XSS attacks
    app.use(xss());

    // Sanitize data
    app.use(mongoSanitize());

    // Prevent http param pollution
    app.use(hpp());

    // CORS configuration
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
        res.setHeader(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, OPTIONS'
        );
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization'
        );
        next();
    });
};

module.exports = securityMiddleware; 