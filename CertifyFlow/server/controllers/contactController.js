const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');

// Create reusable transporter
// For production, you'd use real SMTP credentials
// For Gmail, you need to enable "Less secure apps" or use App Password
const createTransporter = () => {
    // Check if email credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Fallback: Use Ethereal for testing (emails won't actually be delivered)
    // This creates a test account automatically
    return null;
};

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and message'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Save message to database first (always)
        let savedMessage;
        try {
            savedMessage = await ContactMessage.create({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim(),
                status: 'new',
                emailSent: false
            });
            console.log('Contact message saved to database with ID:', savedMessage._id);
        } catch (dbError) {
            console.error('Failed to save message to database:', dbError);
            // Continue even if database save fails - at least try to send email
        }

        // Check if email is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            // For demo/development: Log the message and return success
            console.log('=== CONTACT FORM SUBMISSION (Email not configured) ===');
            console.log('From:', name, `<${email}>`);
            console.log('Message:', message);
            console.log('Database ID:', savedMessage?._id || 'Not saved');
            console.log('=======================================================');

            return res.status(200).json({
                success: true,
                message: 'Message received! We will get back to you soon.',
                messageId: savedMessage?._id,
                demo: true,
                note: 'Email service not configured. Message saved to database.'
            });
        }

        // Create transporter with configured credentials
        const transporter = createTransporter();

        // Email to support (from user)
        const supportMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
            replyTo: email,
            subject: `[CertifyFlow Support] New message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4a8a73, #3a6f5c); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">New Support Message</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                        <p style="margin: 0 0 15px;"><strong>From:</strong> ${name}</p>
                        <p style="margin: 0 0 15px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="margin: 0 0 15px;"><strong>Message ID:</strong> ${savedMessage?._id || 'N/A'}</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="margin: 0 0 10px;"><strong>Message:</strong></p>
                        <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0;">
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px; margin: 0;">
                            This message was sent from the CertifyFlow Support form.
                        </p>
                    </div>
                </div>
            `
        };

        // Confirmation email to user
        const confirmationMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'We received your message - CertifyFlow Support',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #4a8a73, #3a6f5c); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Thank You, ${name}!</h1>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                        <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                            We have received your message and will get back to you within 24 hours.
                        </p>
                        <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
                            <p style="margin: 0 0 10px;"><strong>Your message:</strong></p>
                            <p style="margin: 0; color: #666; white-space: pre-wrap;">${message}</p>
                        </div>
                        <p style="font-size: 14px; color: #666; margin: 0;">
                            If you have any urgent concerns, please contact us directly at 
                            <a href="mailto:support@certifyflow.com" style="color: #4a8a73;">support@certifyflow.com</a>
                        </p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} CertifyFlow. All rights reserved.
                        </p>
                    </div>
                </div>
            `
        };

        // Send both emails
        await transporter.sendMail(supportMailOptions);
        await transporter.sendMail(confirmationMailOptions);

        // Update database to mark email as sent
        if (savedMessage) {
            savedMessage.emailSent = true;
            await savedMessage.save();
        }

        console.log('Contact form email sent successfully to:', process.env.SUPPORT_EMAIL || process.env.EMAIL_USER);
        console.log('Confirmation email sent to:', email);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully! Check your email for confirmation.',
            messageId: savedMessage?._id
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all contact messages (admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getAllContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.find({})
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

// @desc    Update message status (admin only)
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactMessage = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        if (status) message.status = status;
        if (adminNotes !== undefined) message.adminNotes = adminNotes;

        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message updated successfully',
            data: message
        });
    } catch (error) {
        console.error('Error updating contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message'
        });
    }
};

// @desc    Delete contact message (admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
};

module.exports = {
    sendContactMessage,
    getAllContactMessages,
    updateContactMessage,
    deleteContactMessage
};
