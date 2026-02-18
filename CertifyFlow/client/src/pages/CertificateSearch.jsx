import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, CheckCircle, Download, XCircle, X, User, Calendar, Printer, Shield, Zap, Award, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CertificateSearch = () => {
    const [searchId, setSearchId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [dob, setDob] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [expandAdvance, setExpandAdvance] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        // Check if user is logged in
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        setLoading(true);
        setSearched(true);
        setCertificate(null);
        setError('');
        setShowLoginPrompt(false);

        try {
            const { data } = await axios.get(`https://proofpetal.onrender.com/api/certificates/${searchId.trim()}`);
            setCertificate(data);
        } catch (err) {
            setCertificate(null);
            if (err.response?.status === 404) {
                setError('Certificate not found');
            } else {
                setError(err.response?.data?.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCloseResult = () => {
        setSearched(false);
        setCertificate(null);
        setError('');
    };

    const features = [
        {
            icon: Shield,
            title: 'Secure Verification',
            description: 'Every certificate is protected with unique encryption and verified through advanced security protocols.',
            badge: 'Secure'
        },
        {
            icon: Zap,
            title: 'Instant Search',
            description: 'Find and verify any certificate in seconds using unique Certificate IDs. Our lightning-fast database queries ensure you never wait.',
            badge: 'Fast'
        },
        {
            icon: Download,
            title: 'Easy Download',
            description: 'Download verified certificates as professional PDF documents instantly. Share with employers, universities, or print for your records.',
            badge: 'Easy'
        },
    ];

    const steps = [
        { step: '1', title: 'Create Account', description: 'Register as a student with your email to access the verification portal.' },
        { step: '2', title: 'Enter Certificate ID', description: 'Use your unique certificate ID to search and verify your internship certificate.' },
        { step: '3', title: 'Download & Share', description: 'View your verified certificate and download it as a PDF to share with employers.' },
    ];

    return (
        <div className="min-h-screen font-sans text-slate-900 selection:bg-[#6FA295]/20 selection:text-[#2F3E3A] flex flex-col bg-[#F5F9F8]">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#8FB9AA]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Left: Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-br from-[#6FA295] to-[#5F9487] p-2.5 rounded-xl shadow-lg shadow-[#6FA295]/20"
                        >
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </motion.div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2F3E3A] to-[#5F7A74] group-hover:to-[#6FA295] transition-all">
                            CertifyFlow
                        </span>
                    </Link>

                    {/* Right: Auth Buttons */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <Link
                                to="/student-dashboard"
                                className="flex items-center gap-2 text-sm font-bold text-white bg-[#2F3E3A] hover:bg-[#1E2D2B] transition-all px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg"
                            >
                                <User className="w-4 h-4" /> My Account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/student-login"
                                    className="text-sm font-bold text-[#2F3E3A] hover:text-[#6FA295] transition-colors"
                                >
                                    Student Login
                                </Link>
                                <Link
                                    to="/admin-login"
                                    className="text-sm font-bold text-white bg-[#2F3E3A] hover:bg-[#1E2E2A] transition-all px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    Admin Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section (Redesigned Split Layout) */}
            <main className="flex-grow flex flex-col relative overflow-hidden pb-24">
                {/* Background Shapes */}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-[#F0FDF9]"></div>

                {/* Curved Divider - SVG for complex shape */}
                <div className="absolute top-0 right-0 w-full lg:w-[60%] h-full z-0 pointer-events-none hidden lg:block">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-[#F5F9F8]">
                        <path d="M0,0 Q30,50 0,100 L100,100 L100,0 Z" fill="#EAF7F2" />
                    </svg>
                </div>
                {/* Mobile Background Curve */}
                <div className="absolute bottom-0 left-0 w-full h-[40%] z-0 pointer-events-none lg:hidden">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-[#EAF7F2]">
                        <path d="M0,50 Q50,0 100,50 L100,100 L0,100 Z" />
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 lg:min-h-[85vh]">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 text-center lg:text-left space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#2F3E3A]/10 shadow-sm text-[#2F3E3A] text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
                            <CheckCircle className="w-3 h-3 text-[#6FA295]" /> Official Verification Portal
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-sans font-black text-[#2F3E3A] tracking-tight leading-[1.1]">
                            Verify your <br />
                            <span className="text-[#6FA295] font-serif italic">Internship Certificate</span>
                        </h1>

                        <p className="text-lg text-[#5F7A74] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Enter your unique Certificate ID to instantly validate the authenticity of your professional achievements.
                        </p>

                        {/* Search Input (Pill Style) */}
                        <div className="relative max-w-lg mx-auto lg:mx-0">
                            <form onSubmit={handleSearch} className="relative group">
                                <div className="absolute inset-0 bg-[#6FA295]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative bg-white p-2 rounded-full shadow-xl border border-[#2F3E3A]/5 flex items-center gap-2 pr-2">
                                    <div className="pl-4 text-[#8FB9AA]">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        placeholder="Enter Certificate ID (e.g. CF-2024-001)"
                                        className="flex-1 bg-transparent border-none outline-none text-[#2F3E3A] font-medium placeholder:text-[#A0B8B2] py-3 text-base"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#6FA295] hover:bg-[#5F9487] text-white px-8 py-3 rounded-full font-bold text-sm shadow-md transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
                                    >
                                        {loading ? '...' : 'Verify'}
                                    </button>
                                </div>
                                <div className="mt-3 flex justify-center lg:justify-start gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setExpandAdvance(!expandAdvance)}
                                        className="text-xs font-bold text-[#5F7A74] hover:text-[#2F3E3A] flex items-center gap-1 transition-colors"
                                    >
                                        {expandAdvance ? 'Simple Search' : 'Advanced Search'}
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </form>

                            {/* Advanced Search Dropdown */}
                            <AnimatePresence>
                                {expandAdvance && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="absolute top-full left-0 right-0 mt-4 bg-white p-4 rounded-2xl shadow-xl border border-[#2F3E3A]/10 overflow-hidden z-30"
                                    >
                                        <div className="grid grid-cols-1 gap-3">
                                            <input type="text" placeholder="Student Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full p-3 bg-[#F5F9F8] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#6FA295]" />
                                            <input type="text" placeholder="DOB (DD/MM/YYYY)" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full p-3 bg-[#F5F9F8] rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#6FA295]" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Right Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:w-1/2 relative flex justify-center lg:justify-end"
                    >
                        <div className="relative w-full max-w-lg aspect-square">
                            {/* Decorative elements behind image */}
                            <div className="absolute top-0 right-10 w-20 h-20 bg-[#FCD34D] rounded-2xl rotate-12 opacity-80 animate-float"></div>
                            <div className="absolute bottom-10 left-10 w-16 h-16 bg-[#6FA295] rounded-full opacity-60 animate-float-delayed"></div>

                            <img
                                src="/src/assets/hero_illustration.png"
                                alt="Verification Illustration"
                                className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </motion.div>
                </div>


                {/* Results Section */}
                <div className="w-full max-w-4xl mt-20 relative z-10 px-4 mx-auto">
                    <AnimatePresence mode='wait'>
                        {/* Login Required Prompt */}
                        {showLoginPrompt && (
                            <motion.div
                                key="login-prompt"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-3xl shadow-xl border border-amber-100 text-center max-w-md mx-auto"
                            >
                                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2F3E3A] mb-2">Login Required</h3>
                                <p className="text-[#5F7A74] mb-6 text-sm">
                                    Please login to verify certificates. This ensures secure access to your documents.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/student-login" className="px-4 py-2.5 bg-[#6FA295] text-white font-bold rounded-xl text-sm hover:bg-[#5F9487]">
                                        Student Login
                                    </Link>
                                    <Link to="/admin-login" className="px-4 py-2.5 bg-[#F5F9F8] text-[#5F7A74] font-bold rounded-xl text-sm hover:bg-[#EAF7F2]">
                                        Admin Login
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* Not Found */}
                        {searched && !certificate && !loading && !showLoginPrompt && (
                            <motion.div
                                key="not-found"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center max-w-md mx-auto relative"
                            >
                                <button onClick={handleCloseResult} className="absolute top-4 right-4 text-[#8FB9AA] hover:text-[#5F7A74]"><X className="w-5 h-5" /></button>
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-[#2F3E3A] mb-2">Certificate Not Found</h3>
                                <p className="text-[#5F7A74] text-sm">
                                    We couldn't find a record for ID <span className="font-mono font-bold text-[#2F3E3A] bg-[#F5F9F8] px-2 py-0.5 rounded border border-[#8FB9AA]/20">{searchId}</span>.
                                </p>
                            </motion.div>
                        )}

                        {/* Certificate Viewer (Same as before) */}
                        {certificate && (
                            <motion.div
                                key="certificate"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className="bg-white rounded-3xl shadow-2xl border border-[#8FB9AA]/20 overflow-hidden relative print:shadow-none print:border-none"
                            >
                                {/* Close Button (Hidden in Print) */}
                                <button
                                    onClick={handleCloseResult}
                                    className="absolute top-4 right-4 z-20 p-2 text-white/60 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-all print:hidden"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Certificate Header */}
                                <div className="bg-[#2F3E3A] text-white px-8 py-6 md:px-12 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden print:bg-[#2F3E3A] print:text-white print:!print-color-adjust-exact">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
                                    <div className="relative z-10 flex items-center gap-5">
                                        <img src="/logo-placeholder.png" alt="Logo" className="w-16 h-16 object-contain bg-white/10 rounded-xl p-2 backdrop-blur-sm" onError={(e) => e.target.style.display = 'none'} />
                                        <div>
                                            <p className="text-[#8FB9AA] text-xs font-bold uppercase tracking-[0.2em] mb-1">Official Document</p>
                                            <h2 className="font-bold text-2xl md:text-3xl tracking-tight">Certificate of Completion</h2>
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-6 md:mt-0 text-left md:text-right">
                                        <p className="text-[#8FB9AA] text-xs font-bold uppercase tracking-widest mb-1">Certificate ID</p>
                                        <p className="font-mono font-bold text-xl md:text-2xl text-white tracking-wide">{certificate.certificateId}</p>
                                    </div>
                                </div>

                                <div className="p-10 md:p-20 text-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white print:bg-white print:p-10">
                                    {/* Verification Badge */}
                                    <div className="inline-flex items-center gap-2 bg-[#EAF7F2] text-[#6FA295] px-5 py-2 rounded-full text-xs font-bold border border-[#6FA295]/20 mb-12 print:border-2">
                                        <CheckCircle className="w-4 h-4" /> Authenticity Verified
                                    </div>

                                    <div className="space-y-6 mb-12">
                                        <p className="text-[#5F7A74] text-sm md:text-base font-bold uppercase tracking-[0.2em]">This is to certify that</p>
                                        <h1 className="text-4xl md:text-6xl font-extrabold text-[#2F3E3A] font-serif italic tracking-wide pb-2 border-b-2 border-[#8FB9AA]/20 inline-block px-10">
                                            {certificate.studentName}
                                        </h1>
                                    </div>

                                    <div className="max-w-2xl mx-auto mb-16 space-y-4">
                                        <p className="text-lg md:text-xl text-[#5F7A74] leading-relaxed font-light">
                                            Has successfully completed the internship program in
                                        </p>
                                        <h3 className="text-2xl md:text-3xl font-bold text-[#2F3E3A]">{certificate.internshipDomain}</h3>
                                        <p className="text-lg md:text-xl text-[#5F7A74] leading-relaxed font-light">
                                            from <span className="font-bold text-[#2F3E3A]">{new Date(certificate.startDate).toLocaleDateString()}</span> to <span className="font-bold text-[#2F3E3A]">{new Date(certificate.endDate).toLocaleDateString()}</span>.
                                        </p>
                                    </div>

                                    {/* Signatures */}
                                    <div className="grid grid-cols-2 gap-20 max-w-3xl mx-auto pt-10 border-t border-[#8FB9AA]/20">
                                        <div className="text-center">
                                            <div className="h-16 mb-2 flex items-end justify-center">
                                                <span className="font-dancing-script text-3xl text-[#2F3E3A] opacity-80 rotate-[-5deg] block transform translate-y-2">Emily Watson</span>
                                            </div>
                                            <div className="w-40 h-0.5 bg-[#2F3E3A] mx-auto mb-3 bg-opacity-20"></div>
                                            <p className="font-bold text-[#2F3E3A] text-sm">Dr. Emily Watson</p>
                                            <p className="text-[#8FB9AA] text-[10px] font-bold uppercase tracking-widest">Program Director</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="h-16 mb-2 flex items-end justify-center">
                                                <span className="font-dancing-script text-3xl text-[#2F3E3A] opacity-80 rotate-[-2deg] block transform translate-y-2">J. Reed</span>
                                            </div>
                                            <div className="w-40 h-0.5 bg-[#2F3E3A] mx-auto mb-3 bg-opacity-20"></div>
                                            <p className="font-bold text-[#2F3E3A] text-sm">Johnathan Reed</p>
                                            <p className="text-[#8FB9AA] text-[10px] font-bold uppercase tracking-widest">CEO, CertifyFlow</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons (Hidden in Print) */}
                                <div className="bg-[#F5F9F8] px-8 py-6 border-t border-[#8FB9AA]/10 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                                    <div className="text-[#8FB9AA] text-xs font-medium flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Securely generated by CertifyFlow System
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={() => window.print()}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#2F3E3A] font-bold rounded-xl border border-[#2F3E3A]/10 hover:bg-[#EAF7F2] transition-colors"
                                        >
                                            <Printer className="w-4 h-4" /> Print
                                        </button>
                                        <button
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#2F3E3A] text-white font-bold rounded-xl hover:bg-[#1E2D2B] shadow-lg transition-all"
                                        >
                                            <Download className="w-4 h-4" /> Download PDF
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Features Timeline Section (Playful Redesign) */}
            <section id="features" className="py-28 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2F3E3A] mb-4">
                            Certificate Verification is <span className="font-dancing-script text-5xl md:text-6xl text-[#6FA295] transform rotate-[-5deg] inline-block ml-2">Simple</span>
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-8 lg:gap-16 relative">
                        {/* Connecting Arrows SVG Layer (Desktop Only) */}
                        <svg className="absolute inset-0 w-full h-full hidden md:block pointer-events-none z-20" overflow="visible">
                            {/* Arrow 1 to 2 */}
                            <path
                                d="M280,180 C320,150 360,200 400,220"
                                fill="none"
                                stroke="#2F3E3A"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                markerEnd="url(#arrowhead)"
                                className="opacity-40"
                            />
                            {/* Arrow 2 to 3 */}
                            <path
                                d="M650,250 C700,280 750,220 800,200"
                                fill="none"
                                stroke="#2F3E3A"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                markerEnd="url(#arrowhead)"
                                className="opacity-40"
                            />
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#2F3E3A" className="opacity-40" />
                                </marker>
                            </defs>
                        </svg>

                        {/* Card 1 */}
                        <div className="relative group">
                            {/* Blob Background */}
                            <svg className="absolute -top-12 -left-12 w-64 h-64 text-[#EAF7F2] -z-10 transform rotate-45 transition-transform group-hover:rotate-12 duration-700" viewBox="0 0 200 200" fill="currentColor">
                                <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.6C59,41.7,47.1,49,35.6,54.8C24.1,60.6,13,64.9,-0.6,65.9C-14.2,67,-28.4,64.8,-39.6,57.7C-50.8,50.6,-59,38.6,-64.7,25.8C-70.4,13,-73.6,-0.6,-71.4,-13.3C-69.2,-26,-61.6,-37.8,-51.6,-46.5C-41.6,-55.2,-29.2,-60.8,-17.1,-65.9C-5,-71,7.5,-75.6,20.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" />
                            </svg>

                            <span className="font-dancing-script text-4xl text-[#2F3E3A] absolute -top-8 left-4 rotate-[-10deg]">01</span>

                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#FAFAFA] w-64 h-64 flex flex-col items-center justify-center text-center transform transition-all group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-[#F5F9F8] rounded-2xl flex items-center justify-center mb-4 text-[#6FA295]">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-[#2F3E3A] text-lg mb-2">Secure Verification</h3>
                                <p className="text-xs text-[#5F7A74] leading-relaxed">
                                    Describe what you need by submitting a custom project request.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="relative mt-0 md:mt-24 group">
                            {/* Blob Background */}
                            <svg className="absolute -top-8 -right-12 w-64 h-64 text-[#6FA295]/20 -z-10 transform -rotate-12 transition-transform group-hover:rotate-12 duration-700" viewBox="0 0 200 200" fill="currentColor">
                                <path d="M42.7,-72.2C54.8,-66.6,63.9,-54.2,69.9,-41.4C75.9,-28.6,78.8,-15.4,76.9,-2.7C75,10,68.2,22.2,60.2,33.1C52.2,44,43,53.6,32.3,60.8C21.6,68,9.4,72.8,-1.8,75.9C-13,79,-26,80.4,-37,74.7C-48,69,-57,56.2,-63.9,42.8C-70.8,29.4,-75.6,15.4,-74.6,1.7C-73.6,-12,-66.8,-25.4,-57.8,-36.8C-48.8,-48.2,-37.6,-57.6,-25.4,-63.2C-13.2,-68.8,0,-70.6,13.2,-72.2L42.7,-72.2Z" transform="translate(100 100)" />
                            </svg>

                            <span className="font-dancing-script text-4xl text-[#2F3E3A] absolute -top-8 right-6 rotate-[5deg]">02</span>

                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#FAFAFA] w-64 h-64 flex flex-col items-center justify-center text-center transform transition-all group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-[#F5F9F8] rounded-2xl flex items-center justify-center mb-4 text-[#6FA295]">
                                    <Zap className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-[#2F3E3A] text-lg mb-2">Instant Search</h3>
                                <p className="text-xs text-[#5F7A74] leading-relaxed">
                                    A CertifyFlow expert will provide you with verified data instantly.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="relative group">
                            {/* Blob Background */}
                            <svg className="absolute -bottom-12 -right-8 w-72 h-72 text-[#FFEAD0] -z-10 transform rotate-90 transition-transform group-hover:rotate-45 duration-700" viewBox="0 0 200 200" fill="currentColor">
                                <path d="M45.7,-76.3C58.9,-69.3,69.1,-55.5,76.5,-41.3C83.9,-27.1,88.5,-12.5,85.6,0.5C82.7,13.5,72.3,24.9,62.8,35.4C53.3,45.9,44.7,55.5,33.9,62.4C23.1,69.3,10.1,73.5,-2.1,77.1C-14.3,80.7,-25.7,83.7,-35.3,78.2C-44.9,72.7,-52.7,58.7,-60.7,46.2C-68.7,33.7,-76.9,22.7,-79.8,10.2C-82.7,-2.3,-80.3,-16.3,-72.3,-27.4C-64.3,-38.5,-50.7,-46.7,-37.8,-53.9C-24.9,-61.1,-12.8,-67.3,1.3,-69.5C15.4,-71.7,32.5,-83.3,45.7,-76.3Z" transform="translate(100 100)" />
                            </svg>

                            <span className="font-dancing-script text-4xl text-[#2F3E3A] absolute -top-8 left-0 rotate-[-15deg]">03</span>

                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-[#FAFAFA] w-64 h-64 flex flex-col items-center justify-center text-center transform transition-all group-hover:-translate-y-2">
                                <div className="w-16 h-16 bg-[#F5F9F8] rounded-2xl flex items-center justify-center mb-4 text-[#6FA295]">
                                    <Download className="w-8 h-8" />
                                </div>
                                <h3 className="font-bold text-[#2F3E3A] text-lg mb-2">Easy Download</h3>
                                <p className="text-xs text-[#5F7A74] leading-relaxed">
                                    The results are delivered on time and to your satisfaction.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Scribbles */}
                    <div className="absolute top-1/4 left-10 md:left-20 pointer-events-none hidden md:block">
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#6FA295" strokeWidth="3" className="opacity-60">
                            <path d="M10,50 Q30,10 50,50 T90,50" />
                        </svg>
                    </div>
                    <div className="absolute bottom-1/4 right-20 pointer-events-none hidden md:block">
                        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#2F3E3A" strokeWidth="3" className="opacity-40">
                            <path d="M20,20 L80,80 M80,20 L20,80" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* How It Works Section (New Redesign) */}
            <section id="how-it-works" className="py-28 bg-[#F5F9F8] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mb-20"
                    >
                        <span className="text-[#6FA295] font-bold tracking-[0.2em] text-sm uppercase mb-3 block">Simple Process</span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2F3E3A]">How It Works</h2>
                    </motion.div>

                    <div className="relative h-[600px] hidden md:block w-full max-w-6xl mx-auto">
                        {/* Wavy Line SVG */}
                        <svg className="absolute inset-0 w-full h-full" overflow="visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#6FA295" stopOpacity="0.2" />
                                    <stop offset="50%" stopColor="#6FA295" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#6FA295" stopOpacity="0.2" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,450 C300,450 300,150 600,150 S900,450 1200,450"
                                fill="none"
                                stroke="url(#gradientLine)"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="absolute left-[10%] top-[65%] w-72 text-left"
                        >
                            <span className="text-[120px] font-black text-[#E1ECEA] absolute -top-32 -left-4 -z-10 leading-none select-none opacity-60">1</span>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#6FA295]/20 flex items-center justify-center mb-6 transform -translate-y-12">
                                    <User className="w-8 h-8 text-[#6FA295]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2F3E3A] mb-3">Create Account</h3>
                                <p className="text-[#5F7A74] leading-relaxed">
                                    Register as a student with your email to access the verification portal securely.
                                </p>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="absolute left-[50%] top-[15%] w-72 text-center transform -translate-x-1/2"
                        >
                            <span className="text-[120px] font-black text-[#E1ECEA] absolute -top-12 left-1/2 -translate-x-1/2 -z-10 leading-none select-none opacity-60">2</span>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#6FA295]/20 flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-[#6FA295]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2F3E3A] mb-3">Enter Certificate ID</h3>
                                <p className="text-[#5F7A74] leading-relaxed">
                                    Use your unique certificate ID to search and verify your internship certificate.
                                </p>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6 }}
                            className="absolute right-[10%] top-[65%] w-72 text-right"
                        >
                            <span className="text-[120px] font-black text-[#E1ECEA] absolute -top-32 -right-4 -z-10 leading-none select-none opacity-60">3</span>
                            <div className="relative z-10 flex flex-col items-end">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#6FA295]/20 flex items-center justify-center mb-6 transform -translate-y-12">
                                    <Download className="w-8 h-8 text-[#6FA295]" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2F3E3A] mb-3">Download & Share</h3>
                                <p className="text-[#5F7A74] leading-relaxed">
                                    View your verified certificate and download it as a PDF to share with employers.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile Fallback */}
                    <div className="md:hidden space-y-16 relative">
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[#6FA295]/20"></div>
                        {steps.map((item, index) => (
                            <div key={index} className="relative pl-20 text-left">
                                <div className="absolute left-0 top-0 w-12 h-12 bg-white rounded-xl shadow-md border border-[#6FA295]/20 flex items-center justify-center z-10">
                                    <span className="text-xl font-bold text-[#6FA295]">{index + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#2F3E3A] mb-2">{item.title}</h3>
                                <p className="text-[#5F7A74]">{item.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20">
                        <Link
                            to="/student-login"
                            className="inline-block px-10 py-4 bg-[#6FA295] text-white font-bold rounded-full shadow-xl hover:bg-[#5F9487] transition-all transform hover:-translate-y-1 text-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="py-8 text-center text-[#8FB9AA] text-sm font-medium border-t border-[#8FB9AA]/10 bg-white">
                &copy; {new Date().getFullYear()} CertifyFlow Verification Systems. Secure & Trusted.
            </footer>
        </div >
    );
};

export default CertificateSearch;
