const User = require('../models/User');
const Certificate = require('../models/Certificate');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private/Student
const getStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -token');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get certificate counts for this student
        const [totalCertificates, activeCertificates] = await Promise.all([
            Certificate.countDocuments({ studentEmail: user.email }),
            Certificate.countDocuments({ studentEmail: user.email, status: 'active' })
        ]);

        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            certificateCount: totalCertificates,
            activeCertificateCount: activeCertificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get certificates for logged-in student
// @route   GET /api/student/certificates
// @access  Private/Student
const getStudentCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({
            studentEmail: req.user.email
        }).sort({ createdAt: -1 });

        // Add isDownloadable flag to each certificate
        const certificatesWithStatus = certificates.map(cert => ({
            ...cert.toObject(),
            isDownloadable: cert.status === 'active',
            isRevoked: cert.status === 'revoked'
        }));

        res.json({
            success: true,
            certificates: certificatesWithStatus,
            total: certificates.length,
            active: certificates.filter(c => c.status === 'active').length,
            revoked: certificates.filter(c => c.status === 'revoked').length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get single certificate by ID (for student)
// @route   GET /api/student/certificates/:id
// @access  Private/Student
const getStudentCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            certificateId: req.params.id,
            studentEmail: req.user.email
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found or not authorized'
            });
        }

        // Update lastAccessedAt
        certificate.lastAccessedAt = new Date();
        await certificate.save().catch(() => { }); // Silent fail on tracking

        res.json({
            success: true,
            ...certificate.toObject(),
            isDownloadable: certificate.status === 'active',
            isRevoked: certificate.status === 'revoked'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Download certificate (increment download count)
// @route   POST /api/student/certificates/:id/download
// @access  Private/Student
const downloadCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            certificateId: req.params.id,
            studentEmail: req.user.email
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found or not authorized'
            });
        }

        // Check if certificate is revoked - BLOCK DOWNLOAD
        if (certificate.status === 'revoked') {
            return res.status(403).json({
                success: false,
                message: 'This certificate has been revoked and cannot be downloaded',
                isRevoked: true
            });
        }

        // Use the trackDownload method from the model
        try {
            await certificate.trackDownload();
        } catch (trackError) {
            return res.status(403).json({
                success: false,
                message: trackError.message
            });
        }

        res.json({
            success: true,
            message: 'Download recorded successfully',
            downloadCount: certificate.downloadCount,
            certificate: {
                ...certificate.toObject(),
                isDownloadable: true,
                isRevoked: false
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update student profile (limited - only name)
// @route   PUT /api/student/profile
// @access  Private/Student
const updateStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate name if provided
        if (req.body.name !== undefined) {
            if (!req.body.name || req.body.name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be at least 2 characters'
                });
            }
            user.name = req.body.name.trim();
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

module.exports = {
    getStudentProfile,
    getStudentCertificates,
    getStudentCertificateById,
    downloadCertificate,
    updateStudentProfile,
};
