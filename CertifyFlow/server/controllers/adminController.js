const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateAllInsights } = require('../services/insightsService');

// @desc    Get all users (for admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password -token')
            .sort({ createdAt: -1 });

        // Calculate stats
        const stats = {
            total: users.length,
            admins: users.filter(u => u.role === 'admin').length,
            students: users.filter(u => u.role === 'student').length,
        };

        res.json({ users, stats });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Create new user (by admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Create user (password will be hashed by pre-save hook in User model)
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(400).json({ message: error.message || 'Failed to create user' });
    }
};

// @desc    Delete user (by admin)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Update user role (by admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!['admin', 'student'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        user.role = role;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get notifications/recent activity for admin
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
    try {
        const Certificate = require('../models/Certificate');

        // Get recent certificates (last 5)
        const recentCerts = await Certificate.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('certificateId studentName createdAt');

        // Get recent user registrations (last 5)
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        // Build notifications array
        const notifications = [];

        recentCerts.forEach(cert => {
            notifications.push({
                id: cert._id,
                type: 'certificate',
                message: `Certificate issued for ${cert.studentName}`,
                time: cert.createdAt,
            });
        });

        recentUsers.forEach(user => {
            notifications.push({
                id: user._id,
                type: 'user',
                message: `New ${user.role} registered: ${user.name}`,
                time: user.createdAt,
            });
        });

        // Sort by time (most recent first)
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

        // Return top 10
        res.json(notifications.slice(0, 10));
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @desc    Get AI-generated insights for dashboard
// @route   GET /api/admin/insights
// @access  Private/Admin
const getInsights = async (req, res) => {
    try {
        const result = await generateAllInsights();

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to generate insights'
            });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching insights:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating insights'
        });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    deleteUser,
    updateUserRole,
    getNotifications,
    getInsights,
};
