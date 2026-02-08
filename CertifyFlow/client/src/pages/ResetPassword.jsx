import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Client-side validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
                password,
                confirmPassword
            });

            if (data.success) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/student-login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                        <Lock className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-[#2F3E3A] mb-2">Reset Password</h1>
                    <p className="text-[#5F7A74] text-sm">
                        Enter your new password below
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
                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1">
                                        New Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-12 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8FB9AA] hover:text-[#6FA295] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#8FB9AA] ml-1">
                                        Minimum 6 characters
                                    </p>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8FB9AA] hover:text-[#6FA295] transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Match Indicator */}
                                {confirmPassword && (
                                    <div className={`flex items-center gap-2 text-sm ${password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                                        {password === confirmPassword ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Passwords match
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-4 h-4" />
                                                Passwords do not match
                                            </>
                                        )}
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading || password !== confirmPassword}
                                    className="w-full text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#6FA295]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg, #8FB9AA 0%, #6FA295 100%)' }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Reset Password'
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
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>

                            <h3 className="text-xl font-bold text-[#2F3E3A] mb-2">Password Reset Successful!</h3>
                            <p className="text-[#5F7A74] text-sm mb-6">
                                Your password has been updated successfully. You will be redirected to the login page shortly.
                            </p>

                            <div className="flex items-center justify-center gap-2 text-[#8FB9AA]">
                                <div className="w-2 h-2 bg-[#6FA295] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-[#6FA295] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-[#6FA295] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>

                            <Link
                                to="/student-login"
                                className="inline-flex items-center gap-2 mt-6 text-[#6FA295] hover:text-[#5F9487] font-bold transition-colors"
                            >
                                Go to Login Now
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Back to Login Link */}
                {!success && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/student-login"
                            className="inline-flex items-center gap-2 text-[#5F7A74] hover:text-[#2F3E3A] text-sm font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
