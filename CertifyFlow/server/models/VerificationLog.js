const mongoose = require('mongoose');

/**
 * Verification Log Schema
 * Stores all certificate verification attempts for security auditing
 */
const verificationLogSchema = new mongoose.Schema({
    // The certificate ID that was queried (may or may not exist)
    certificateId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // Result of the verification
    result: {
        type: String,
        enum: ['valid', 'invalid', 'revoked'],
        required: true,
        index: true
    },
    // Client IP address
    ipAddress: {
        type: String,
        default: 'unknown'
    },
    // User agent string (browser/client info)
    userAgent: {
        type: String,
        default: ''
    },
    // Optional: If user was logged in during verification
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Timestamp of verification attempt
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Geolocation (derived from IP)
    country: {
        type: String,
        default: 'unknown'
    },
    city: {
        type: String,
        default: 'unknown'
    },
    // Whether this log has been analyzed for fraud
    analyzed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: false // We use our own timestamp field
});

// Compound index for analytics queries
verificationLogSchema.index({ certificateId: 1, timestamp: -1 });
verificationLogSchema.index({ result: 1, timestamp: -1 });
verificationLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Auto-delete logs older than 90 days (optional - set TTL index)
// Uncomment if you want automatic cleanup:
// verificationLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);

module.exports = VerificationLog;
