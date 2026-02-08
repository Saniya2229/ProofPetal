const express = require('express');
const router = express.Router();
const {
    getFraudAlerts,
    getFraudStats,
    resolveAlert,
    getFlaggedCertificates,
    getAlertById
} = require('../controllers/fraudController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect, admin);

// GET /api/fraud/stats - Get fraud statistics
router.get('/stats', getFraudStats);

// GET /api/fraud/alerts - Get all fraud alerts
router.get('/alerts', getFraudAlerts);

// GET /api/fraud/alerts/:id - Get alert by ID
router.get('/alerts/:id', getAlertById);

// PUT /api/fraud/alerts/:id/resolve - Resolve an alert
router.put('/alerts/:id/resolve', resolveAlert);

// GET /api/fraud/flagged - Get flagged certificates
router.get('/flagged', getFlaggedCertificates);

module.exports = router;
