import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Search, FileText, Download, LogOut, CheckCircle, Award, Calendar, Clock, Home, XCircle, HelpCircle, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const StudentDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchId, setSearchId] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);

    // New state for backend data
    const [profile, setProfile] = useState(null);
    const [myCertificates, setMyCertificates] = useState([]);
    const [profileLoading, setProfileLoading] = useState(true);
    const [certificatesLoading, setCertificatesLoading] = useState(true);

    // Edit Profile Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // Scroll detection for header visibility
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollDiff = currentScrollY - lastScrollY.current;

                    // Only trigger if scrolled more than 5px to avoid jitter
                    if (Math.abs(scrollDiff) > 5) {
                        if (scrollDiff > 0 && currentScrollY > 80) {
                            // Scrolling DOWN past header height - hide
                            setShowHeader(false);
                        } else if (scrollDiff < 0) {
                            // Scrolling UP - show
                            setShowHeader(true);
                        }
                        lastScrollY.current = currentScrollY;
                    }

                    // Always show at top
                    if (currentScrollY < 50) {
                        setShowHeader(true);
                    }

                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch student profile from backend
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = user?.token;
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('http://localhost:5000/api/student/profile', config);
                setProfile(data);
            } catch (err) {
                console.error('Error fetching profile:', err);
            } finally {
                setProfileLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    // Fetch student certificates from backend
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const token = user?.token;
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('http://localhost:5000/api/student/certificates', config);
                // API returns { success, certificates: [...], total, active, revoked }
                setMyCertificates(data.certificates || data);
            } catch (err) {
                console.error('Error fetching certificates:', err);
            } finally {
                setCertificatesLoading(false);
            }
        };
        if (user) fetchCertificates();
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setLoading(true);
        setSearched(true);
        setCertificate(null);
        setError('');

        try {
            // First verify the certificate exists
            const { data } = await axios.get(`http://localhost:5000/api/certificates/${searchId.trim()}`);
            // If certificate exists, navigate to the beautiful certificate preview page
            if (data) {
                navigate(`/certificate/${searchId.trim()}`);
            }
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

    // Handle download with tracking
    const handleDownload = async (certId) => {
        try {
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            await axios.post(`http://localhost:5000/api/student/certificates/${certId}/download`, {}, config);
            // Trigger browser print
            window.print();
        } catch (err) {
            console.error('Download error:', err);
            // Still allow print even if tracking fails
            window.print();
        }
    };

    const getInitials = () => {
        if (user?.name) {
            const names = user.name.split(' ');
            return names.length > 1
                ? `${names[0][0]}${names[1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
        }
        return 'S';
    };

    // Open edit profile modal
    const openEditModal = () => {
        setEditName(user?.name || '');
        setEditError('');
        setEditSuccess('');
        setShowEditModal(true);
    };

    // Handle profile update
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSuccess('');

        if (!editName.trim() || editName.trim().length < 2) {
            setEditError('Name must be at least 2 characters');
            return;
        }

        setEditLoading(true);

        try {
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            const { data } = await axios.put(
                'http://localhost:5000/api/student/profile',
                { name: editName.trim() },
                config
            );

            if (data.success) {
                setEditSuccess('Profile updated successfully!');
                // Update the user context with new name (no page reload needed)
                updateUser({ name: editName.trim() });
                setProfile(prev => ({ ...prev, name: editName.trim() }));
                // Close modal after success
                setTimeout(() => {
                    setShowEditModal(false);
                }, 1500);
            }
        } catch (err) {
            setEditError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setEditLoading(false);
        }
    };

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/student-dashboard' },
        { icon: HelpCircle, label: 'Support & FAQ', path: '/support' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar - Sage Green Theme */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 bg-gradient-to-b from-[#4a8a73] to-[#3a6f5c] min-h-screen fixed left-0 top-0 flex flex-col z-20 shadow-xl"
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"
                        >
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </motion.div>
                        <span className="text-xl font-bold text-white tracking-wide">CertifyFlow</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6">
                    <p className="text-xs font-semibold text-white/60 uppercase tracking-widest px-3 mb-4">Menu</p>
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${isActive
                                    ? 'bg-white text-[#3a6f5c] font-bold shadow-lg'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Sign Out - Distinct styling */}
                <div className="p-4 border-t border-white/10">
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white/90 bg-white/10 backdrop-blur-sm w-full transition-all font-semibold border border-white/20 hover:border-white/40"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Header - Scroll-aware with fixed positioning */}
                <motion.header
                    initial={{ y: 0 }}
                    animate={{ y: showHeader ? 0 : '-100%' }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="bg-white/95 backdrop-blur-md px-8 py-5 flex justify-between items-center fixed top-0 right-0 left-64 z-30 shadow-sm border-b border-gray-100">

                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl font-bold text-gray-800"
                        >
                            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                        </motion.h1>
                        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your certificates today.</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all"
                        >
                            <Search className="w-5 h-5" />
                        </motion.button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-gray-800 text-sm font-bold">{user?.name}</p>
                                <p className="text-gray-500 text-xs">Student Account</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-11 h-11 rounded-full bg-[#4a8a73] flex items-center justify-center text-white text-lg font-bold shadow-md"
                            >
                                {getInitials()}
                            </motion.div>
                        </div>
                    </div>
                </motion.header>

                {/* Dashboard Content - With top padding for fixed header */}
                <main className="p-8 pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Search Verification Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                whileHover={{ y: -2 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0f7f4] text-[#4a8a73] rounded-full text-xs font-bold mb-3">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Instant Verification
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">Verify a Certificate</h2>
                                        <p className="text-gray-500 text-sm">Enter any certificate ID to instantly verify its authenticity and view details.</p>
                                    </div>
                                    <div className="p-3 bg-[#f0f7f4] rounded-xl hidden sm:block">
                                        <Search className="w-6 h-6 text-[#4a8a73]" />
                                    </div>
                                </div>

                                <form onSubmit={handleSearch} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={searchId}
                                        onChange={(e) => setSearchId(e.target.value)}
                                        placeholder="Enter Certificate ID (e.g., CF-2024-001)"
                                        className="flex-1 px-4 py-3.5 bg-gray-50 text-gray-800 rounded-xl font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a8a73]/30 focus:bg-white border border-gray-200 focus:border-[#4a8a73] transition-all"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#4a8a73] hover:bg-[#3a6f5c] text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md"
                                    >
                                        {loading ? '...' : 'Verify'}
                                    </motion.button>
                                </form>
                            </motion.div>

                            {/* Verification Result */}
                            <AnimatePresence mode="wait">
                                {searched && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                                    >
                                        <button
                                            onClick={handleCloseResult}
                                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>

                                        {certificate ? (
                                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                                <motion.div
                                                    whileHover={{ scale: 1.02 }}
                                                    className="w-full md:w-1/3 aspect-[4/3] bg-[#f0f7f4] rounded-xl flex items-center justify-center"
                                                >
                                                    <FileText className="w-14 h-14 text-[#4a8a73]/50" />
                                                </motion.div>
                                                <div className="w-full md:w-2/3">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-400">ID: {certificate.certificateId}</span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{certificate.internshipDomain}</h3>
                                                    <p className="text-gray-500 text-sm mb-4">Issued to <span className="text-gray-800 font-semibold">{certificate.studentName}</span></p>

                                                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500 mb-4">
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                            <Calendar className="w-3.5 h-3.5 text-[#4a8a73]" />
                                                            {new Date(certificate.startDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                            <Clock className="w-3.5 h-3.5 text-[#4a8a73]" />
                                                            {new Date(certificate.endDate).toLocaleDateString()}
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => window.print()}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-all"
                                                    >
                                                        <Download className="w-4 h-4" /> Download PDF
                                                    </motion.button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <XCircle className="w-7 h-7" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Not Found</h3>
                                                <p className="text-gray-500 max-w-xs mx-auto text-sm">{error || 'Certificate not found.'}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* My Certificates */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    <Award className="w-5 h-5 text-[#4a8a73]" />
                                    My Certificates
                                </h3>

                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {myCertificates.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {myCertificates.map((cert) => (
                                                <div key={cert._id || cert.certificateId} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-[#f0f7f4] flex items-center justify-center text-[#4a8a73]">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 group-hover:text-[#4a8a73] transition-colors">{cert.internshipDomain}</h4>
                                                            <p className="text-xs text-gray-400">{cert.certificateId} • {new Date(cert.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/certificate/${cert.certificateId}`}
                                                            className="px-3 py-1.5 text-xs font-semibold text-[#4a8a73] bg-[#f0f7f4] hover:bg-[#e0f0ea] rounded-lg transition-all"
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            to={`/certificate/${cert.certificateId}`}
                                                            className="p-2 text-gray-400 hover:text-[#4a8a73] hover:bg-[#f0f7f4] rounded-lg transition-all"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 px-6">
                                            <div className="w-16 h-16 bg-[#f0f7f4] text-[#4a8a73]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                            <h4 className="text-base font-bold text-gray-800 mb-2">No Certificates Yet</h4>
                                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                                You haven't earned any certificates yet. Complete an internship to get your first certificate here!
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Profile Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -2 }}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-20 h-20 mx-auto bg-[#4a8a73] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4"
                                >
                                    {getInitials()}
                                </motion.div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{user?.name}</h3>
                                <p className="text-gray-400 text-sm mb-6">{user?.email}</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-[#4a8a73] text-xl font-bold">{profile?.certificateCount || myCertificates.length}</p>
                                        <p className="text-gray-400 text-xs font-semibold uppercase">Certificates</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-[#4a8a73] text-xl font-bold">Active</p>
                                        <p className="text-gray-400 text-xs font-semibold uppercase">Status</p>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={openEditModal}
                                    className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-all"
                                >
                                    Edit Profile
                                </motion.button>
                            </motion.div>

                            {/* Help Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ y: -2 }}
                                className="bg-[#4a8a73] rounded-2xl p-6 text-white shadow-lg"
                            >
                                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Need Assistance?</h3>
                                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                                    Having trouble finding your certificate or need to update your details? We're here to help.
                                </p>
                                <Link to="/support">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-5 py-3 bg-white text-[#4a8a73] font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors w-full"
                                    >
                                        Contact Support
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-[#4a8a73] to-[#3a6f5c] p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-xl font-bold">Edit Profile</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                                {/* Error Message */}
                                {editError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100"
                                    >
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        {editError}
                                    </motion.div>
                                )}

                                {/* Success Message */}
                                {editSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-green-100"
                                    >
                                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                        {editSuccess}
                                    </motion.div>
                                )}

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-[#4a8a73] outline-none transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                                            placeholder="Enter your full name"
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 ml-1">
                                        Minimum 2 characters required
                                    </p>
                                </div>

                                {/* Email Display (Read-only) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 ml-1">
                                        Email cannot be changed. Contact support if needed.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={editLoading}
                                        className="flex-1 py-3 bg-[#4a8a73] text-white font-semibold rounded-xl hover:bg-[#3a6f5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {editLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentDashboard;
