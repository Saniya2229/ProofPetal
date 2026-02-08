const express = require('express');
const router = express.Router();
const {
    loginUser,
    adminLogin,
    studentLogin,
    registerUser,
    logoutUser,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// General login (can be used with expectedRole parameter)
router.post('/login', loginUser);

// Role-specific login endpoints (SECURITY: enforces role check)
router.post('/admin-login', adminLogin);
router.post('/student-login', studentLogin);

// Registration (only creates student accounts for public registration)
router.post('/register', registerUser);

// Logout
router.post('/logout', logoutUser);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;

