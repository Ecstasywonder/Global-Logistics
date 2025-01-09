const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getPendingUsers,
    verifyUser,
    getPendingShipments,
    processShipment,
    getSupportTickets,
    updateSupportTicket
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// User management routes
router.get('/users/pending', getPendingUsers);
router.put('/users/:id/verify', verifyUser);

// Shipment management routes
router.get('/shipments/pending', getPendingShipments);
router.put('/shipments/:id/process', processShipment);

// Support ticket routes
router.get('/support', getSupportTickets);
router.put('/support/:id', updateSupportTicket);

module.exports = router; 