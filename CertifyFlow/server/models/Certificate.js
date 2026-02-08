const mongoose = require('mongoose');

const certificateSchema = mongoose.Schema({
    certificateId: {
        type: String,
        required: [true, 'Certificate ID is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Certificate ID must be at least 3 characters'],
    },
    studentName: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true,
        minlength: [2, 'Student name must be at least 2 characters'],
    },
    studentEmail: {
        type: String,
        required: [true, 'Student email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    internshipDomain: {
        type: String,
        required: [true, 'Internship domain is required'],
        trim: true,
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
    // Status field for revocation
    status: {
        type: String,
        enum: {
            values: ['active', 'revoked'],
            message: 'Status must be either active or revoked'
        },
        default: 'active',
    },
    // Usage tracking fields
    downloadCount: {
        type: Number,
        default: 0,
        min: [0, 'Download count cannot be negative'],
    },
    lastAccessedAt: {
        type: Date,
    },
    // Admin tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    revokedAt: {
        type: Date,
    },
    revokeReason: {
        type: String,
        trim: true,
    },
    pdfUrl: {
        type: String,
    },
    // Fraud detection fields
    riskLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high'],
        default: 'none',
        index: true
    },
    verificationCount: {
        type: Number,
        default: 0
    },
    lastVerifiedAt: {
        type: Date
    },
    flaggedAt: {
        type: Date
    },
    lastVerificationIp: {
        type: String
    }
}, {
    timestamps: true,
});

// Database-level unique index on certificateId (enforced even if app logic fails)
certificateSchema.index({ certificateId: 1 }, { unique: true });

// Compound index for student lookups
certificateSchema.index({ studentEmail: 1, status: 1 });

// Index for admin queries
certificateSchema.index({ status: 1, createdAt: -1 });

// Pre-save validation: Ensure startDate is before endDate
certificateSchema.pre('save', function (next) {
    if (this.startDate && this.endDate) {
        if (new Date(this.startDate) >= new Date(this.endDate)) {
            const error = new Error('Start date must be before end date');
            error.name = 'ValidationError';
            return next(error);
        }
    }
    next();
});

// Pre-save: Track revocation timestamp
certificateSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'revoked' && !this.revokedAt) {
        this.revokedAt = new Date();
    }
    next();
});

// Method to check if certificate is downloadable
certificateSchema.methods.isDownloadable = function () {
    return this.status === 'active';
};

// Method to increment download count
certificateSchema.methods.trackDownload = async function () {
    if (this.status === 'revoked') {
        throw new Error('Cannot download a revoked certificate');
    }
    this.downloadCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

// Method to revoke certificate
certificateSchema.methods.revoke = async function (adminId, reason = '') {
    this.status = 'revoked';
    this.revokedBy = adminId;
    this.revokedAt = new Date();
    this.revokeReason = reason;
    return this.save();
};

// Method to restore certificate
certificateSchema.methods.restore = async function () {
    this.status = 'active';
    this.revokedBy = undefined;
    this.revokedAt = undefined;
    this.revokeReason = undefined;
    return this.save();
};

// Static method for safe certificate creation with full validation
certificateSchema.statics.createWithValidation = async function (data, adminId) {
    const errors = [];

    // Required field checks
    if (!data.certificateId || data.certificateId.trim() === '') {
        errors.push('Certificate ID is required and cannot be empty');
    } else if (data.certificateId.trim().length < 3) {
        errors.push('Certificate ID must be at least 3 characters');
    }

    if (!data.studentName || data.studentName.trim() === '') {
        errors.push('Student name is required and cannot be empty');
    } else if (data.studentName.trim().length < 2) {
        errors.push('Student name must be at least 2 characters');
    }

    // Email validation - existence and format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!data.studentEmail || data.studentEmail.trim() === '') {
        errors.push('Student email is required and cannot be empty');
    } else if (!emailRegex.test(data.studentEmail.trim())) {
        errors.push(`Invalid email format: "${data.studentEmail}"`);
    }

    if (!data.internshipDomain || data.internshipDomain.trim() === '') {
        errors.push('Internship domain is required and cannot be empty');
    }

    // Date validation
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const today = new Date();
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(today.getFullYear() + 2); // Allow up to 2 years in future

    if (isNaN(startDate.getTime())) {
        errors.push('Start date is invalid');
    }
    if (isNaN(endDate.getTime())) {
        errors.push('End date is invalid');
    }
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (startDate >= endDate) {
            errors.push('Start date must be before end date');
        }
        // Check for unreasonably future dates
        if (endDate > maxFutureDate) {
            errors.push('End date cannot be more than 2 years in the future');
        }
    }

    // Check for duplicate
    const existing = await this.findOne({ certificateId: data.certificateId });
    if (existing) {
        errors.push(`Certificate ID "${data.certificateId}" already exists in database`);
    }

    if (errors.length > 0) {
        const error = new Error(errors.join('; '));
        error.name = 'ValidationError';
        error.errors = errors;
        throw error;
    }

    // Create certificate
    return this.create({
        certificateId: data.certificateId.trim(),
        studentName: data.studentName.trim(),
        studentEmail: data.studentEmail.trim().toLowerCase(),
        internshipDomain: data.internshipDomain.trim(),
        startDate,
        endDate,
        createdBy: adminId,
        status: 'active',
        downloadCount: 0,
    });
};

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
