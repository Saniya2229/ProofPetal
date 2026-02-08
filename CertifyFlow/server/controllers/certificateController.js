const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const { maskEmail } = require('../utils/maskData');
const xlsx = require('xlsx');
const { analyzeVerification } = require('../services/fraudDetectionService');
const { findSimilarCertificates, autoCorrect, normalizeQuery } = require('../services/fuzzySearchService');

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Public
const getCertificateById = async (req, res) => {
    // Helper function to log verification attempt (non-blocking)
    const logVerification = (certificateId, result, ipAddress, userAgent) => {
        VerificationLog.create({
            certificateId,
            result,
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || ''
        }).catch(() => { }); // Silent fail - don't block response
    };

    try {
        const certificateId = req.params.id;
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || '';

        const certificate = await Certificate.findOne({ certificateId: certificateId });

        if (!certificate) {
            // Log invalid verification attempt
            logVerification(certificateId, 'invalid', clientIp, userAgent);

            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Determine result based on status
        const verificationResult = certificate.status === 'revoked' ? 'revoked' : 'valid';

        // Log successful verification attempt
        logVerification(certificateId, verificationResult, clientIp, userAgent);

        // Trigger fraud detection analysis (non-blocking)
        analyzeVerification(certificateId, clientIp).catch(() => { });

        // Update lastAccessedAt for tracking (don't block on this)
        certificate.lastAccessedAt = new Date();
        await certificate.save().catch(() => { }); // Silent fail on tracking

        // Prepare response with masked sensitive data
        const certData = certificate.toObject();

        // Mask email for public verification response
        const maskedEmail = maskEmail(certData.studentEmail);

        // Return certificate with status indicator and masked data
        res.json({
            ...certData,
            studentEmail: maskedEmail, // Masked email
            originalEmail: undefined, // Ensure original is not exposed
            isRevoked: certificate.status === 'revoked',
            isDownloadable: certificate.isDownloadable(),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching certificate'
        });
    }
};

// @desc    Get all certificates
// @route   GET /api/certificates
// @access  Private/Admin
const getAllCertificates = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;

        // Build query
        let query = {};
        if (status && ['active', 'revoked'].includes(status)) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { certificateId: { $regex: search, $options: 'i' } },
                { studentName: { $regex: search, $options: 'i' } },
                { studentEmail: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [certificates, total] = await Promise.all([
            Certificate.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email'),
            Certificate.countDocuments(query)
        ]);

        res.json({
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
            message: 'Server error while fetching certificates'
        });
    }
};

// @desc    Get dashboard stats for admin
// @route   GET /api/certificates/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const [total, active, revoked, thisWeek, recentCertificates] = await Promise.all([
            Certificate.countDocuments(),
            Certificate.countDocuments({ status: 'active' }),
            Certificate.countDocuments({ status: 'revoked' }),
            Certificate.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            Certificate.find({})
                .sort({ createdAt: -1 })
                .limit(5)
                .select('certificateId studentName internshipDomain createdAt status')
        ]);

        res.json({
            total,
            active,
            revoked,
            thisWeek,
            recentCertificates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Private/Admin
const createCertificate = async (req, res) => {
    try {
        const { certificateId, studentName, studentEmail, internshipDomain, startDate, endDate } = req.body;

        // Use the static validation method from the model
        const certificate = await Certificate.createWithValidation({
            certificateId,
            studentName,
            studentEmail,
            internshipDomain,
            startDate,
            endDate
        }, req.user._id);

        res.status(201).json({
            success: true,
            message: 'Certificate created successfully',
            certificate
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message,
                errors: error.errors || [error.message]
            });
        }
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid certificate data'
        });
    }
};

// @desc    Upload Excel and create certificates in bulk
// @route   POST /api/certificates/upload
// @access  Private/Admin
const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Parse Excel file
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Excel file is empty'
            });
        }

        // Validate required columns exist
        const requiredColumns = ['certificateId', 'studentName', 'studentEmail', 'internshipDomain', 'startDate', 'endDate'];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required columns: ${missingColumns.join(', ')}`,
                hint: 'Required columns: certificateId, studentName, studentEmail, internshipDomain, startDate, endDate'
            });
        }

        // Pre-validation phase: Validate ALL rows before inserting any
        const validationResults = [];
        const certificateIdsInFile = new Set();

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNumber = i + 2; // Excel row number (1-indexed + header)
            const rowErrors = [];

            // Check certificateId
            if (!row.certificateId || String(row.certificateId).trim() === '') {
                rowErrors.push('Certificate ID is required and cannot be empty');
            } else {
                const certId = String(row.certificateId).trim();
                // Check for duplicates within the file
                if (certificateIdsInFile.has(certId)) {
                    rowErrors.push(`Duplicate Certificate ID "${certId}" found in file`);
                }
                certificateIdsInFile.add(certId);
            }

            // Check studentName
            if (!row.studentName || String(row.studentName).trim() === '') {
                rowErrors.push('Student name is required and cannot be empty');
            }

            // Check studentEmail - existence and format
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!row.studentEmail || String(row.studentEmail).trim() === '') {
                rowErrors.push('Student email is required and cannot be empty');
            } else if (!emailRegex.test(String(row.studentEmail).trim())) {
                rowErrors.push(`Invalid email format: "${row.studentEmail}"`);
            }

            // Check internshipDomain
            if (!row.internshipDomain || String(row.internshipDomain).trim() === '') {
                rowErrors.push('Internship domain is required and cannot be empty');
            }

            // Validate dates
            const startDate = parseExcelDate(row.startDate);
            const endDate = parseExcelDate(row.endDate);
            const today = new Date();
            const maxFutureDate = new Date();
            maxFutureDate.setFullYear(today.getFullYear() + 2); // Allow up to 2 years in future

            if (!startDate || isNaN(startDate.getTime())) {
                rowErrors.push('Start date is invalid or missing');
            }
            if (!endDate || isNaN(endDate.getTime())) {
                rowErrors.push('End date is invalid or missing');
            }
            if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                if (startDate >= endDate) {
                    rowErrors.push('Start date must be before end date');
                }
                // Check for unreasonably future dates
                if (endDate > maxFutureDate) {
                    rowErrors.push('End date cannot be more than 2 years in the future');
                }
            }

            validationResults.push({
                row: rowNumber,
                certificateId: row.certificateId,
                errors: rowErrors,
                data: row
            });
        }

        // Check for existing certificates in database
        const allCertIds = Array.from(certificateIdsInFile);
        const existingCerts = await Certificate.find({
            certificateId: { $in: allCertIds }
        }).select('certificateId');

        const existingIds = new Set(existingCerts.map(c => c.certificateId));

        for (const result of validationResults) {
            if (result.data.certificateId && existingIds.has(String(result.data.certificateId).trim())) {
                result.errors.push(`Certificate ID "${result.data.certificateId}" already exists in database`);
            }
        }

        // Check if there are any validation errors
        const failedRows = validationResults.filter(r => r.errors.length > 0);
        const validRows = validationResults.filter(r => r.errors.length === 0);

        // If all rows failed, return error
        if (validRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All rows failed validation. No certificates created.',
                totalRows: data.length,
                failedRows: failedRows.map(r => ({
                    row: r.row,
                    certificateId: r.certificateId,
                    errors: r.errors
                }))
            });
        }

        // Insert valid rows
        const insertResults = {
            success: 0,
            failed: failedRows.length,
            errors: failedRows.map(r => ({
                row: r.row,
                certificateId: r.certificateId,
                errors: r.errors
            }))
        };

        for (const validRow of validRows) {
            try {
                await Certificate.create({
                    certificateId: String(validRow.data.certificateId).trim(),
                    studentName: String(validRow.data.studentName).trim(),
                    studentEmail: String(validRow.data.studentEmail).trim().toLowerCase(),
                    internshipDomain: String(validRow.data.internshipDomain).trim(),
                    startDate: parseExcelDate(validRow.data.startDate),
                    endDate: parseExcelDate(validRow.data.endDate),
                    createdBy: req.user._id,
                    status: 'active',
                    downloadCount: 0
                });
                insertResults.success++;
            } catch (error) {
                insertResults.failed++;
                insertResults.errors.push({
                    row: validRow.row,
                    certificateId: validRow.data.certificateId,
                    errors: [error.message]
                });
            }
        }

        res.json({
            success: true,
            message: `Upload complete. ${insertResults.success} certificates created${insertResults.failed > 0 ? `, ${insertResults.failed} failed` : ''}.`,
            results: insertResults
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing file'
        });
    }
};

// Helper function to parse Excel dates (handles both serial numbers and strings)
function parseExcelDate(value) {
    if (!value) return null;

    // If it's already a Date object
    if (value instanceof Date) return value;

    // If it's an Excel serial date number
    if (typeof value === 'number') {
        // Excel serial date: days since Jan 1, 1900
        const excelEpoch = new Date(1899, 11, 30);
        return new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    }

    // Try to parse as string
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
}

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
const deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.id });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        await Certificate.deleteOne({ certificateId: req.params.id });
        res.json({
            success: true,
            message: 'Certificate permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting certificate'
        });
    }
};

// @desc    Revoke certificate (soft delete)
// @route   PUT /api/certificates/:id/revoke
// @access  Private/Admin
const revokeCertificate = async (req, res) => {
    try {
        const { reason } = req.body;
        const certificate = await Certificate.findOne({ certificateId: req.params.id });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        if (certificate.status === 'revoked') {
            // Restore the certificate
            await certificate.restore();
            return res.json({
                success: true,
                message: 'Certificate restored successfully',
                certificate
            });
        } else {
            // Revoke the certificate
            await certificate.revoke(req.user._id, reason);
            return res.json({
                success: true,
                message: 'Certificate revoked successfully',
                certificate
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Track certificate download
// @route   POST /api/certificates/:id/download
// @access  Private (Student) - Also called from public preview
const trackDownload = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.id });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Check if certificate is revoked
        if (!certificate.isDownloadable()) {
            return res.status(403).json({
                success: false,
                message: 'This certificate has been revoked and cannot be downloaded'
            });
        }

        // Track the download
        await certificate.trackDownload();

        res.json({
            success: true,
            message: 'Download tracked successfully',
            downloadCount: certificate.downloadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update certificate details
// @route   PUT /api/certificates/:id
// @access  Private/Admin
const updateCertificate = async (req, res) => {
    try {
        const { studentName, internshipDomain, startDate, endDate } = req.body;
        const certificate = await Certificate.findOne({ certificateId: req.params.id });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Validate dates if provided
        const newStartDate = startDate ? new Date(startDate) : certificate.startDate;
        const newEndDate = endDate ? new Date(endDate) : certificate.endDate;

        if (newStartDate >= newEndDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
        }

        // Validate future date limit (2 years max)
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
        if (newEndDate > maxFutureDate) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be more than 2 years in the future'
            });
        }

        // Validate student name if provided
        if (studentName !== undefined) {
            if (!studentName || studentName.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Student name must be at least 2 characters'
                });
            }
            certificate.studentName = studentName.trim();
        }

        // Update internship domain if provided
        if (internshipDomain !== undefined) {
            if (!internshipDomain || internshipDomain.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Internship domain cannot be empty'
                });
            }
            certificate.internshipDomain = internshipDomain.trim();
        }

        // Update dates
        if (startDate) certificate.startDate = newStartDate;
        if (endDate) certificate.endDate = newEndDate;

        await certificate.save();

        res.json({
            success: true,
            message: 'Certificate updated successfully',
            certificate
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while updating certificate'
        });
    }
};

// @desc    Get verification history for a certificate
// @route   GET /api/certificates/:id/history
// @access  Private/Admin
const getVerificationHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const certificateId = req.params.id;

        // Check if certificate exists
        const certificate = await Certificate.findOne({ certificateId });
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            VerificationLog.find({ certificateId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            VerificationLog.countDocuments({ certificateId })
        ]);

        res.json({
            success: true,
            certificateId,
            history: logs,
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
            message: error.message || 'Server error while fetching verification history'
        });
    }
};

// @desc    Smart search certificates with fuzzy matching
// @route   GET /api/certificates/search
// @access  Private/Admin
const searchCertificates = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        // Validate query
        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                suggestions: [],
                message: 'Query too short (minimum 2 characters)'
            });
        }

        const query = q.trim();
        const normalizedQuery = normalizeQuery(query);

        // First, try exact and prefix matches with MongoDB for speed
        const regexQuery = {
            $or: [
                { certificateId: { $regex: `^${normalizedQuery}`, $options: 'i' } },
                { certificateId: { $regex: query, $options: 'i' } },
                { studentName: { $regex: query, $options: 'i' } },
                { studentEmail: { $regex: query, $options: 'i' } }
            ]
        };

        // Get potential matches (limit to reasonable number for fuzzy processing)
        const certificates = await Certificate.find(regexQuery)
            .select('certificateId studentName studentEmail internshipDomain status isRevoked')
            .limit(50)
            .lean();

        let suggestions = [];

        if (certificates.length > 0) {
            // Use fuzzy search to rank results
            suggestions = findSimilarCertificates(query, certificates, {
                limit: parseInt(limit),
                minSimilarity: 40
            });
        }

        // If no results from regex, try broader fuzzy search
        if (suggestions.length === 0) {
            // Get more certificates for fuzzy matching
            const allCerts = await Certificate.find({})
                .select('certificateId studentName studentEmail internshipDomain status isRevoked')
                .limit(500)
                .lean();

            suggestions = findSimilarCertificates(query, allCerts, {
                limit: parseInt(limit),
                minSimilarity: 50
            });
        }

        // Generate auto-correction suggestion if no good matches
        let correction = null;
        if (suggestions.length === 0 || (suggestions.length > 0 && suggestions[0].similarity < 80)) {
            const allCertIds = await Certificate.find({})
                .select('certificateId')
                .limit(1000)
                .lean();

            correction = autoCorrect(
                normalizedQuery,
                allCertIds.map(c => c.certificateId),
                60
            );
        }

        res.json({
            success: true,
            query: query,
            normalizedQuery: normalizedQuery !== query ? normalizedQuery : undefined,
            suggestions,
            correction,
            totalFound: suggestions.length
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching certificates'
        });
    }
};

module.exports = {
    getCertificateById,
    getAllCertificates,
    getDashboardStats,
    createCertificate,
    uploadExcel,
    deleteCertificate,
    revokeCertificate,
    trackDownload,
    updateCertificate,
    getVerificationHistory,
    searchCertificates,
};
