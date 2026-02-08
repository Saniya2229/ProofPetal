const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    getStudentCertificates,
    getStudentCertificateById,
    downloadCertificate,
    updateStudentProfile,
} = require('../controllers/studentController');
const { protect, student } = require('../middleware/authMiddleware');

// All routes require authentication + student role
router.use(protect, student);

// Profile routes
router.route('/profile')
    .get(getStudentProfile)
    .put(updateStudentProfile);

// Certificate routes
router.route('/certificates')
    .get(getStudentCertificates);

router.route('/certificates/:id')
    .get(getStudentCertificateById);

router.route('/certificates/:id/download')
    .post(downloadCertificate);

module.exports = router;
