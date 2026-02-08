const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    createUser,
    deleteUser,
    updateUserRole,
    getNotifications,
    getInsights,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect, admin);

// User management routes
router.route('/users')
    .get(getAllUsers)
    .post(createUser);

router.route('/users/:id')
    .delete(deleteUser);

router.route('/users/:id/role')
    .put(updateUserRole);

// Notifications
router.get('/notifications', getNotifications);

// AI Insights
router.get('/insights', getInsights);

module.exports = router;
