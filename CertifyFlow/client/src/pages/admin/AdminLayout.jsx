import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AdminDashboard from './AdminDashboard';
import UploadExcel from './UploadExcel';
import ManageUsers from './ManageUsers';
import ManageCertificates from './ManageCertificates';
import FraudDetection from './FraudDetection';
import { ShieldCheck, Bell, X, FileText, User, Clock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AdminLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [fraudAlertCount, setFraudAlertCount] = useState(0);
    const notificationRef = useRef(null);

    // Fetch notifications from backend
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = user?.token;
                if (!token) return;

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('http://localhost:5000/api/admin/notifications', config);
                setNotifications(data);
                setUnreadCount(data.length);
            } catch (err) {
                console.error('Error fetching notifications:', err);
            }
        };
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Fetch pending high-priority fraud alerts count
    useEffect(() => {
        const fetchFraudAlerts = async () => {
            try {
                const token = user?.token;
                if (!token) return;

                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('http://localhost:5000/api/fraud/stats', config);
                // Count pending high-severity alerts
                const pendingHighCount = data.pendingAlerts || 0;
                setFraudAlertCount(pendingHighCount > 0 && data.highSeverityAlerts > 0 ? data.highSeverityAlerts : 0);
            } catch (err) {
                console.error('Error fetching fraud stats:', err);
            }
        };
        fetchFraudAlerts();

        // Poll for new fraud alerts every 30 seconds
        const fraudInterval = setInterval(fetchFraudAlerts, 30000);
        return () => clearInterval(fraudInterval);
    }, [user]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notificationRef.current && !notificationRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get first letter of user's name for avatar
    const getInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'A';
    };

    // Format time ago
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="flex min-h-screen bg-[#EAF2EF]">
            <Sidebar />
            <div className="flex-1 ml-64">
                {/* Top Header Bar */}
                <motion.header
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border-b border-[#8FB9AA]/20 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm"
                >
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="bg-gradient-to-br from-[#6FA295] to-[#5F9487] p-2 rounded-xl shadow-md">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6FA295] to-[#5F9487]">
                            CertifyFlow
                        </span>
                    </motion.div>
                    <div className="flex items-center gap-4">
                        {/* Fraud Alert Badge */}
                        {fraudAlertCount > 0 && (
                            <motion.button
                                onClick={() => navigate('/admin/fraud')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                title="View Fraud Alerts"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                </motion.div>
                                <span className="text-xs font-bold">
                                    {fraudAlertCount} Alert{fraudAlertCount !== 1 ? 's' : ''}
                                </span>
                            </motion.button>
                        )}

                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <motion.button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    setUnreadCount(0);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-[#8FB9AA] hover:text-[#6FA295] transition-colors p-2 rounded-full hover:bg-[#EAF7F2] relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-[#8FB9AA]/10 overflow-hidden z-50"
                                    >
                                        <div className="p-4 border-b border-[#8FB9AA]/10 flex justify-between items-center">
                                            <h3 className="font-bold text-[#2F3E3A]">Notifications</h3>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="p-1 hover:bg-[#F5F9F8] rounded-lg"
                                            >
                                                <X className="w-4 h-4 text-[#8FB9AA]" />
                                            </button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif, index) => (
                                                    <div
                                                        key={notif.id || index}
                                                        className="p-4 border-b border-[#8FB9AA]/10 hover:bg-[#F5F9F8] transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${notif.type === 'certificate'
                                                                ? 'bg-[#EAF7F2] text-[#6FA295]'
                                                                : 'bg-blue-50 text-blue-500'
                                                                }`}>
                                                                {notif.type === 'certificate' ? (
                                                                    <FileText className="w-4 h-4" />
                                                                ) : (
                                                                    <User className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm text-[#2F3E3A]">{notif.message}</p>
                                                                <p className="text-xs text-[#8FB9AA] mt-1 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatTimeAgo(notif.time)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-8 h-8 text-[#8FB9AA] mx-auto mb-2" />
                                                    <p className="text-sm text-[#5F7A74]">No notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Profile Avatar with Name */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            {user?.name && (
                                <span className="text-sm font-medium text-[#5F7A74] group-hover:text-[#2F3E3A] transition-colors hidden sm:block">
                                    {user.name}
                                </span>
                            )}
                            <motion.div
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6FA295] to-[#5F9487] flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-[#EAF7F2]"
                            >
                                {getInitial()}
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.header>

                {/* Page Content */}
                <main className="p-6">
                    <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="upload" element={<UploadExcel />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="certificates" element={<ManageCertificates />} />
                        <Route path="fraud" element={<FraudDetection />} />
                    </Routes>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
