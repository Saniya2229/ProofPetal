import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, ArrowRight, Leaf, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLogin = () => {
    const [isRegistering, setIsRegistering] = useState(false);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { studentLogin, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let result;
            if (isRegistering) {
                result = await register(name, email, password, 'student');
            } else {
                // Use studentLogin to enforce student-only access
                result = await studentLogin(email, password);
            }

            if (result.success) {
                // Students go to their dashboard
                navigate('/student-dashboard');
            } else {
                setError(result.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#EAF2EF]" style={{ background: 'linear-gradient(135deg, #EAF2EF 0%, #D8E5DF 100%)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-[#2F4F4F] rounded-[30px] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px] relative"
            >
                {/* Visual Side (Left) */}
                <div className="w-full md:w-1/2 p-12 relative flex flex-col justify-between overflow-hidden bg-[#739E82]" style={{ background: 'linear-gradient(135deg, #8FB9AA 0%, #6FA295 100%)' }}>
                    <div className="absolute top-[-20%] left-[-20%] w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-[#2F3E3A] opacity-10 rounded-full blur-3xl"></div>

                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-sm">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-wide">Student Portal</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
                            Welcome, <br /> Future Achiever!
                        </h1>
                        <p className="text-[#EAF7F2] text-lg leading-relaxed max-w-sm opacity-90 font-medium">
                            Access and verify your internship certificates. Your achievements, securely stored and easily accessible.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative z-10 mt-12 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#EAF7F2] flex items-center justify-center shadow-md">
                                <Leaf className="w-6 h-6 text-[#6FA295]" />
                            </div>
                            <div>
                                <p className="font-bold text-base text-white">Eco-Friendly System</p>
                                <p className="text-sm text-white/80">Digital Verification</p>
                            </div>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "80%" }}
                                transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            ></motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-1/2 bg-white flex flex-col justify-center relative">
                    <div className="absolute top-0 bottom-0 left-[-50px] w-[60px] bg-white rounded-l-[50%] hidden md:block"></div>

                    <div className="p-8 md:p-12 md:pl-8 max-w-md mx-auto w-full relative z-10">
                        <motion.div
                            key={isRegistering ? "register" : "login"}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-extrabold text-[#2F3E3A] mb-2 font-sans tracking-tight">
                                    {isRegistering ? 'Create Student Account' : 'Student Login'}
                                </h2>
                                <p className="text-[#5F7A74] font-medium">
                                    {isRegistering ? 'Join CertifyFlow to access your certificates.' : 'Welcome back! Enter your credentials.'}
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 mb-6 flex items-center gap-3 shadow-sm"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence>
                                    {isRegistering && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-1 overflow-hidden"
                                        >
                                            <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1 mb-1.5">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required={isRegistering}
                                                    className="w-full pl-12 pr-4 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider block ml-1 mb-1.5">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA] group-focus-within:text-[#6FA295] transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-[#F5F9F8] border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#8FB9AA] focus:ring-0 outline-none transition-all text-[#2F3E3A] placeholder-[#A0B8B2] font-medium"
                                            placeholder="student@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1 mb-1.5">
                                        <label className="text-xs font-bold text-[#2F3E3A] uppercase tracking-wider">Password</label>
                                        {!isRegistering && (
                                            <Link to="/forgot-password" className="text-xs text-[#6FA295] hover:text-[#5F9487] font-bold hover:underline">
                                                Forgot Password?
                                            </Link>
                                        )}
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
                                    className="w-full text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#6FA295]/30 transition-all flex items-center justify-center gap-2 mt-6"
                                    style={{ background: 'linear-gradient(135deg, #8FB9AA 0%, #6FA295 100%)' }}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            {isRegistering ? 'Create Account' : 'Login'}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="text-center pt-8">
                                <p className="text-[#5F7A74] text-sm font-medium">
                                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                                    <button
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="ml-2 font-bold text-[#4A7A6D] hover:text-[#2F3E3A] transition-colors"
                                    >
                                        {isRegistering ? 'Sign In' : 'Register Now'}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentLogin;
