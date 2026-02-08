import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Use adminLogin to enforce admin-only access
            const result = await adminLogin(email, password);

            if (result.success) {
                navigate('/admin');
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1E2D2B 0%, #2F3E3A 100%)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[30px] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px]"
            >
                {/* Visual Side (Left) - Admin Theme */}
                <div className="w-full md:w-1/2 p-12 relative flex flex-col justify-between overflow-hidden" style={{ background: 'linear-gradient(135deg, #2F3E3A 0%, #1E2D2B 100%)' }}>
                    <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-[#8FB9AA] opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-[#6FA295] opacity-10 rounded-full blur-3xl"></div>

                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 text-sm font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-[#8FB9AA]/20 backdrop-blur-md p-2.5 rounded-2xl border border-[#8FB9AA]/20 shadow-sm">
                                <Shield className="w-8 h-8 text-[#8FB9AA]" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-wide">Admin Portal</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
                            Secure <br /> Admin Access
                        </h1>
                        <p className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
                            Manage certificates, users, and system settings with full administrative control.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative z-10 mt-12 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="font-bold text-base text-white">Restricted Access</p>
                                <p className="text-sm text-white/60">Authorized personnel only</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-1/2 bg-white flex flex-col justify-center relative">
                    <div className="absolute top-0 bottom-0 left-[-50px] w-[60px] bg-white rounded-l-[50%] hidden md:block"></div>

                    <div className="p-8 md:p-12 md:pl-8 max-w-md mx-auto w-full relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-[#2F3E3A] mb-2 tracking-tight">
                                    Admin Login
                                </h2>
                                <p className="text-[#5F7A74] font-medium">
                                    Enter your admin credentials to continue.
                                </p>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">Secure Portal</p>
                                        <p className="text-xs text-amber-700 mt-0.5">Unauthorized access attempts are monitored.</p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 mb-6 flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1 mb-1.5">Admin Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="admin@certifyflow.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1 mb-1.5">
                                        <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-[#6FA295] hover:text-[#5F9487] font-bold hover:underline">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full text-white font-bold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 mt-6 bg-[#2F3E3A] hover:bg-[#1E2D2B]"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Access Dashboard
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="text-center pt-8">
                                <p className="text-[#5F7A74] text-sm font-medium">
                                    Not an admin? <Link to="/student-login" className="font-bold text-[#6FA295] hover:text-[#5F9487]">Go to Student Login</Link>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
