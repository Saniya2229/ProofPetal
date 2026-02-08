const mongoose = require('mongoose');

/**
 * Fraud Alert Schema
 * Stores fraud detection alerts for admin review
 */
const fraudAlertSchema = new mongoose.Schema({
    // The certificate that triggered the alert
    certificateId: {
        type: String,
        required: true,
        index: true
    },
    // Type of fraud detected
    alertType: {
        type: String,
        enum: ['velocity', 'location_anomaly', 'pattern_anomaly'],
        required: true
    },
    // Severity level
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
        index: true
    },
    // Alert status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed', 'confirmed'],
        default: 'pending',
        index: true
    },
    // Detection details
    details: {
        verificationCount: {
            type: Number,
            default: 0
        },
        uniqueIPs: [{
            type: String
        }],
        timeWindow: {
            type: String,
            default: ''
        },
        anomalyScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        description: {
            type: String,
            default: ''
        }
    },
    // When the alert was triggered
    triggeredAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Admin who reviewed (if reviewed)
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    // Resolution notes from admin
    resolution: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
fraudAlertSchema.index({ status: 1, severity: -1, triggeredAt: -1 });
fraudAlertSchema.index({ certificateId: 1, triggeredAt: -1 });

// Static method to get pending high-priority alerts count
fraudAlertSchema.statics.getPendingHighPriorityCount = async function () {
    return this.countDocuments({
        status: 'pending',
        severity: { $in: ['medium', 'high'] }
    });
};

// Static method to get fraud statistics
fraudAlertSchema.statics.getStats = async function () {
    const [total, pending, reviewed, highSeverity] = await Promise.all([
        this.countDocuments(),
        this.countDocuments({ status: 'pending' }),
        this.countDocuments({ status: { $in: ['reviewed', 'dismissed', 'confirmed'] } }),
        this.countDocuments({ severity: 'high', status: 'pending' })
    ]);

    return { total, pending, reviewed, highSeverity };
};

const FraudAlert = mongoose.model('FraudAlert', fraudAlertSchema);

module.exports = FraudAlert;
