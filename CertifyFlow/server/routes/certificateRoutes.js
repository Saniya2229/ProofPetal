const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getCertificateById,
    getAllCertificates,
    getDashboardStats,
    createCertificate,
    uploadExcel,
    deleteCertificate,
    revokeCertificate,
    updateCertificate,
    getVerificationHistory,
    searchCertificates
} = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/authMiddleware');
const { verificationLimiter } = require('../middleware/rateLimiter');

// Multer config for file upload (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin dashboard stats
router.get('/stats', protect, admin, getDashboardStats);

// Smart certificate search (must be before /:id to avoid conflicts)
router.get('/search', protect, admin, searchCertificates);

router.route('/')
    .get(protect, admin, getAllCertificates)
    .post(protect, admin, createCertificate);

router.route('/upload')
    .post(protect, admin, upload.single('file'), uploadExcel);

// Certificate-specific routes (must be after /stats and /upload to avoid conflicts)
router.route('/:id')
    .get(verificationLimiter, getCertificateById)
    .put(protect, admin, updateCertificate)
    .delete(protect, admin, deleteCertificate);

router.put('/:id/revoke', protect, admin, revokeCertificate);
router.get('/:id/history', protect, admin, getVerificationHistory);

module.exports = router;

