const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token (General login - checks role)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // SECURITY: Check if user role matches expected role (if provided)
        // This prevents admin from logging into student dashboard and vice versa
        if (expectedRole && user.role !== expectedRole) {
            if (expectedRole === 'student') {
                return res.status(403).json({
                    success: false,
                    message: 'This account is not a student account. Please use the Admin Login page.',
                    actualRole: user.role
                });
            }
            if (expectedRole === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'This account is not an admin account. Please use the Student Login page.',
                    actualRole: user.role
                });
            }
        }

        const token = generateToken(user._id);

        // Store token in database
        user.token = token;
        await user.save();

        // Send token in HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Admin-specific login
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // SECURITY: Only allow admin role
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This login is for administrators only.',
                hint: 'If you are a student, please use the Student Login page.'
            });
        }

        const token = generateToken(user._id);
        user.token = token;
        await user.save();

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Student-specific login
// @route   POST /api/auth/student-login
// @access  Public
const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Handle legacy users without role field - auto-fix by setting to 'student'
        if (!user.role) {
            user.role = 'student';
            await user.save();
        }

        // SECURITY: Only allow student role
        if (user.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This login is for students only.',
                hint: 'If you are an admin, please use the Admin Login page.'
            });
        }

        const token = generateToken(user._id);
        user.token = token;
        await user.save();

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        const userExists = await User.findOne({ email: email.toLowerCase().trim() });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Validate role - only allow 'student' for public registration
        // Admin accounts should only be created by existing admins
        const allowedRole = role === 'student' ? 'student' : 'student';

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: allowedRole
        });

        const token = generateToken(user._id);
        user.token = token;
        await user.save();

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid user data'
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        // Generate reset token (random 32 bytes converted to hex)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token and save to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        // In production, you would send an email here
        // For demo, we'll return the reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Log the reset URL to console (simulating email)
        console.log('='.repeat(60));
        console.log('PASSWORD RESET REQUEST');
        console.log('='.repeat(60));
        console.log(`User: ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Token expires in: 30 minutes`);
        console.log('='.repeat(60));

        res.status(200).json({
            success: true,
            message: 'Password reset link has been generated',
            // For demo purposes, include the reset URL in response
            // In production, remove this and send via email only
            resetUrl: resetUrl,
            note: 'In production, this link would be sent to your email'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during password reset request'
        });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password and confirm password'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Hash the token from URL to compare with stored hash
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset.'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        console.log('='.repeat(60));
        console.log('PASSWORD RESET SUCCESSFUL');
        console.log('='.repeat(60));
        console.log(`User: ${user.email}`);
        console.log(`Password has been updated`);
        console.log('='.repeat(60));

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during password reset'
        });
    }
};

module.exports = {
    loginUser,
    adminLogin,
    studentLogin,
    registerUser,
    logoutUser,
    forgotPassword,
    resetPassword,
};
