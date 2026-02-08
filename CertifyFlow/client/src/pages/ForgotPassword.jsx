import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resetUrl, setResetUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email: email.trim().toLowerCase()
            });

            if (data.success) {
                setSuccess(true);
                setResetUrl(data.resetUrl);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#EAF2EF]" style={{ background: 'linear-gradient(135deg, #EAF2EF 0%, #D8E5DF 100%)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md p-8 md:p-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-gradient-to-br from-[#6FA295] to-[#5F9487] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#6FA295]/30"
                    >
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-[#2F3E3A] mb-2">Forgot Password?</h1>
                    <p className="text-[#5F7A74] text-sm">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 mb-6 flex items-center gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#6FA295]/30 transition-all flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #8FB9AA 0%, #6FA295 100%)' }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            {/* Success Icon */}
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>

                            <h3 className="text-xl font-bold text-[#2F3E3A] mb-2">Reset Link Generated!</h3>
                            <p className="text-[#5F7A74] text-sm mb-6">
                                In production, this link would be sent to your email. For demo purposes, use the link below:
                            </p>

                            {/* Reset Link Box */}
                            <div className="bg-[#F5F9F8] rounded-2xl p-4 mb-6 border border-[#8FB9AA]/20">
                                <p className="text-xs font-bold text-[#5F7A74] uppercase tracking-wider mb-2">
                                    Reset Link (Demo)
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={resetUrl}
                                        readOnly
                                        className="flex-1 bg-white border border-[#8FB9AA]/20 rounded-xl px-3 py-2 text-xs text-[#2F3E3A] font-mono"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={copyToClipboard}
                                        className="p-2 bg-[#6FA295] text-white rounded-xl hover:bg-[#5F9487] transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </motion.button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-500 mt-2 font-medium">
                                        ✓ Copied to clipboard!
                                    </p>
                                )}
                            </div>

                            {/* Open Reset Link Button */}
                            <Link
                                to={resetUrl.replace('http://localhost:5173', '')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2F3E3A] text-white font-bold rounded-2xl hover:bg-[#1E2D2B] transition-colors shadow-lg"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Reset Page
                            </Link>

                            <p className="text-xs text-[#8FB9AA] mt-4">
                                Link expires in 30 minutes
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Back to Login Link */}
                <div className="mt-8 text-center">
                    <Link
                        to="/student-login"
                        className="inline-flex items-center gap-2 text-[#5F7A74] hover:text-[#2F3E3A] text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
