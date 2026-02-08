const FraudAlert = require('../models/FraudAlert');
const Certificate = require('../models/Certificate');
const { getFraudStatistics } = require('../services/fraudDetectionService');

/**
 * @desc    Get all fraud alerts with filtering
 * @route   GET /api/fraud/alerts
 * @access  Private/Admin
 */
const getFraudAlerts = async (req, res) => {
    try {
        const { status, severity, page = 1, limit = 20 } = req.query;

        // Build query
        let query = {};
        if (status && ['pending', 'reviewed', 'dismissed', 'confirmed'].includes(status)) {
            query.status = status;
        }
        if (severity && ['low', 'medium', 'high'].includes(severity)) {
            query.severity = severity;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [alerts, total] = await Promise.all([
            FraudAlert.find(query)
                .sort({ triggeredAt: -1, severity: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('reviewedBy', 'name email')
                .lean(),
            FraudAlert.countDocuments(query)
        ]);

        // Enrich with certificate info
        const enrichedAlerts = await Promise.all(
            alerts.map(async (alert) => {
                const certificate = await Certificate.findOne({ certificateId: alert.certificateId })
                    .select('studentName studentEmail internshipDomain status')
                    .lean();
                return {
                    ...alert,
                    certificate: certificate || null
                };
            })
        );

        res.json({
            success: true,
            alerts: enrichedAlerts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while fetching fraud alerts'
        });
    }
};

/**
 * @desc    Get fraud statistics for dashboard
 * @route   GET /api/fraud/stats
 * @access  Private/Admin
 */
const getFraudStats = async (req, res) => {
    try {
        const stats = await getFraudStatistics();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while fetching fraud stats'
        });
    }
};

/**
 * @desc    Resolve a fraud alert (review/dismiss/confirm)
 * @route   PUT /api/fraud/alerts/:id/resolve
 * @access  Private/Admin
 */
const resolveAlert = async (req, res) => {
    try {
        const { status, resolution } = req.body;

        if (!status || !['reviewed', 'dismissed', 'confirmed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: reviewed, dismissed, or confirmed'
            });
        }

        const alert = await FraudAlert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        alert.status = status;
        alert.reviewedBy = req.user._id;
        alert.reviewedAt = new Date();
        if (resolution) {
            alert.resolution = resolution;
        }

        await alert.save();

        // If confirmed, keep the risk level; if dismissed, consider lowering it
        if (status === 'dismissed') {
            // Check if there are other pending alerts for this certificate
            const pendingAlerts = await FraudAlert.countDocuments({
                certificateId: alert.certificateId,
                status: 'pending'
            });

            // If no more pending alerts, reset risk level
            if (pendingAlerts === 0) {
                await Certificate.updateOne(
                    { certificateId: alert.certificateId },
                    { $set: { riskLevel: 'none', flaggedAt: null } }
                );
            }
        }

        res.json({
            success: true,
            message: `Alert ${status} successfully`,
            alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while resolving alert'
        });
    }
};

/**
 * @desc    Get flagged (high-risk) certificates
 * @route   GET /api/fraud/flagged
 * @access  Private/Admin
 */
const getFlaggedCertificates = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { riskLevel: { $in: ['low', 'medium', 'high'] } };

        const [certificates, total] = await Promise.all([
            Certificate.find(query)
                .sort({ flaggedAt: -1, riskLevel: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .select('certificateId studentName studentEmail internshipDomain status riskLevel verificationCount flaggedAt lastVerifiedAt')
                .lean(),
            Certificate.countDocuments(query)
        ]);

        res.json({
            success: true,
            certificates,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while fetching flagged certificates'
        });
    }
};

/**
 * @desc    Get alert details by ID
 * @route   GET /api/fraud/alerts/:id
 * @access  Private/Admin
 */
const getAlertById = async (req, res) => {
    try {
        const alert = await FraudAlert.findById(req.params.id)
            .populate('reviewedBy', 'name email')
            .lean();

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        // Get certificate info
        const certificate = await Certificate.findOne({ certificateId: alert.certificateId })
            .select('studentName studentEmail internshipDomain status riskLevel verificationCount')
            .lean();

        res.json({
            success: true,
            alert: {
                ...alert,
                certificate: certificate || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while fetching alert'
        });
    }
};

module.exports = {
    getFraudAlerts,
    getFraudStats,
    resolveAlert,
    getFlaggedCertificates,
    getAlertById
};
