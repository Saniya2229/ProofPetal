const express = require('express');
const router = express.Router();
const {
    sendContactMessage,
    getAllContactMessages,
    updateContactMessage,
    deleteContactMessage
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - anyone can send a message
router.post('/', sendContactMessage);

// Admin routes - require authentication
router.get('/', protect, admin, getAllContactMessages);
router.put('/:id', protect, admin, updateContactMessage);
router.delete('/:id', protect, admin, deleteContactMessage);

module.exports = router;
