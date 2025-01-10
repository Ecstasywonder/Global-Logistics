const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// Security Middleware
securityMiddleware(app);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));
app.use('/api/billing', require('./routes/billingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
}); 