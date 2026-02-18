import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, ClipboardList, FileText, Users as UsersIcon, Clock, AlertCircle, CheckCircle, Award, TrendingUp, ShieldAlert, Lightbulb, Zap, XCircle, Calendar, Info, Plus, Trophy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        revoked: 0,
        thisWeek: 0,
        recentCertificates: []
    });
    const [loading, setLoading] = useState(true);

    // AI Insights state
    const [insights, setInsights] = useState([]);
    const [insightsLoading, setInsightsLoading] = useState(true);

    // Icon mapping for insights
    const iconMap = {
        Trophy: Trophy,
        TrendingUp: TrendingUp,
        AlertTriangle: AlertCircle,
        AlertCircle: AlertCircle,
        Clock: Clock,
        Calendar: Calendar,
        CheckCircle: CheckCircle,
        XCircle: XCircle,
        Info: Info,
        Plus: Plus,
        Zap: Zap,
        Lightbulb: Lightbulb
    };

    // Fetch dashboard stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = user?.token;
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                };
                const { data } = await axios.get('https://proofpetal.onrender.com/api/certificates/stats', config);
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user]);

    // Fetch AI insights
    const fetchInsights = async () => {
        try {
            setInsightsLoading(true);
            const token = user?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            };
            const { data } = await axios.get('https://proofpetal.onrender.com/api/admin/insights', config);
            if (data.success) {
                setInsights(data.insights || []);
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
        } finally {
            setInsightsLoading(false);
        }
    };

    // Fetch insights on mount and auto-refresh every 60 seconds
    useEffect(() => {
        if (user) {
            fetchInsights();
            const interval = setInterval(fetchInsights, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.h1
                variants={itemVariants}
                className="text-2xl font-bold text-[#2F3E3A]"
            >
                Overview
            </motion.h1>

            {/* Stats Cards - Stacked Design */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Total Certificates */}
                <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative"
                >
                    {/* Stacked layers behind */}
                    <div className="absolute inset-0 bg-[#8FB9AA]/20 rounded-3xl transform translate-y-2 translate-x-1"></div>
                    <div className="absolute inset-0 bg-[#8FB9AA]/30 rounded-3xl transform translate-y-1 translate-x-0.5"></div>

                    {/* Main card */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-[#8FB9AA]/10">
                        <p className="text-sm font-medium text-[#5F7A74] mb-4">Total Certificates Issued</p>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#EAF7F2] rounded-2xl">
                                <Award className="w-7 h-7 text-[#6FA295]" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-[#2F3E3A]">{loading ? '...' : stats.total.toLocaleString()}</h3>
                                <p className="text-xs text-[#8FB9AA]">Total Certificates</p>
                            </div>
                        </div>
                        <p className="text-xs text-[#8FB9AA] mt-4 leading-relaxed">
                            Across all internship programs and batches
                        </p>
                    </div>
                </motion.div>

                {/* Card 2 - Pending Verifications */}
                <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative"
                >
                    {/* Stacked layers behind */}
                    <div className="absolute inset-0 bg-[#6FA295]/20 rounded-3xl transform translate-y-2 translate-x-1"></div>
                    <div className="absolute inset-0 bg-[#6FA295]/30 rounded-3xl transform translate-y-1 translate-x-0.5"></div>

                    {/* Main card */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-[#8FB9AA]/10">
                        <p className="text-sm font-medium text-[#5F7A74] mb-4">Revoked Certificates</p>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#EAF7F2] rounded-2xl">
                                <Clock className="w-7 h-7 text-[#6FA295]" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-[#6FA295]">{loading ? '...' : stats.revoked}</h3>
                                <p className="text-xs text-[#8FB9AA]">Revoked Status</p>
                            </div>
                        </div>
                        <p className="text-xs text-[#8FB9AA] mt-4 leading-relaxed">
                            Certificates marked as revoked by admin
                        </p>
                    </div>
                </motion.div>

                {/* Card 3 - Recent Uploads */}
                <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    className="relative"
                >
                    {/* Stacked layers behind */}
                    <div className="absolute inset-0 bg-[#5F9487]/20 rounded-3xl transform translate-y-2 translate-x-1"></div>
                    <div className="absolute inset-0 bg-[#5F9487]/30 rounded-3xl transform translate-y-1 translate-x-0.5"></div>

                    {/* Main card */}
                    <div className="relative bg-white p-6 rounded-3xl shadow-lg border border-[#8FB9AA]/10">
                        <p className="text-sm font-medium text-[#5F7A74] mb-4">Recent Uploads</p>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#EAF7F2] rounded-2xl">
                                <TrendingUp className="w-7 h-7 text-[#6FA295]" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-[#5F9487]">{loading ? '...' : stats.thisWeek}</h3>
                                <p className="text-xs text-[#8FB9AA]">This Week</p>
                            </div>
                        </div>
                        <p className="text-xs text-[#8FB9AA] mt-4 leading-relaxed">
                            Certificates created in the last 7 days
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* AI Insights Section */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#2F3E3A] flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                            <Lightbulb className="w-5 h-5 text-purple-600" />
                        </div>
                        AI Insights
                    </h2>
                    <button
                        onClick={fetchInsights}
                        disabled={insightsLoading}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#6FA295] hover:bg-[#EAF7F2] rounded-lg transition-colors"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${insightsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {insightsLoading && insights.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-[#8FB9AA]/10 text-center">
                        <RefreshCw className="w-6 h-6 text-[#8FB9AA] animate-spin mx-auto mb-2" />
                        <p className="text-sm text-[#8FB9AA]">Generating insights...</p>
                    </div>
                ) : insights.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-[#8FB9AA]/10 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-[#5F7A74] font-medium">All Systems Normal</p>
                        <p className="text-xs text-[#8FB9AA] mt-1">No insights to display at this time</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {insights.map((insight, index) => {
                                const IconComponent = iconMap[insight.icon] || Lightbulb;
                                const priorityStyles = {
                                    urgent: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200',
                                    warning: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200',
                                    info: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
                                    success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                                };
                                const iconStyles = {
                                    urgent: 'bg-red-100 text-red-600',
                                    warning: 'bg-amber-100 text-amber-600',
                                    info: 'bg-blue-100 text-blue-600',
                                    success: 'bg-green-100 text-green-600'
                                };
                                return (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className={`rounded-2xl p-5 border shadow-sm cursor-pointer ${priorityStyles[insight.priority] || priorityStyles.info}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2.5 rounded-xl ${iconStyles[insight.priority] || iconStyles.info}`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-[#2F3E3A] text-sm mb-1">
                                                    {insight.title}
                                                </h3>
                                                <p className="text-xs text-[#5F7A74] leading-relaxed">
                                                    {insight.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Bottom Section - Events & Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latest System Events */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-3xl shadow-sm border border-[#8FB9AA]/10 p-6"
                >
                    <h3 className="font-bold text-[#2F3E3A] mb-5 flex items-center gap-3">
                        <div className="p-2 bg-[#EAF7F2] rounded-xl">
                            <Clock className="w-4 h-4 text-[#6FA295]" />
                        </div>
                        Latest System Events
                    </h3>
                    <div className="space-y-3">
                        {stats.recentCertificates && stats.recentCertificates.length > 0 ? (
                            stats.recentCertificates.map((cert, index) => (
                                <motion.div
                                    key={cert.certificateId || index}
                                    whileHover={{ x: 4, backgroundColor: '#F5F9F8' }}
                                    className="flex justify-between items-center text-sm p-3 rounded-xl cursor-pointer transition-all"
                                >
                                    <span className="text-[#5F7A74]">Certificate for {cert.studentName}</span>
                                    <span className="text-[#8FB9AA] text-xs">{new Date(cert.createdAt).toLocaleDateString()}</span>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-[#8FB9AA] text-sm">No recent certificates</p>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-3xl shadow-sm border border-[#8FB9AA]/10 p-6"
                >
                    <h3 className="font-bold text-[#2F3E3A] mb-5 flex items-center gap-3">
                        <div className="p-2 bg-[#EAF7F2] rounded-xl">
                            <CheckCircle className="w-4 h-4 text-[#6FA295]" />
                        </div>
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        {[
                            { icon: UsersIcon, label: 'View All Users', link: '/admin/users' },
                            { icon: FileText, label: 'Upload Excel Data', link: '/admin/upload' },
                            { icon: ClipboardList, label: 'Manage Certificates', link: '/admin/certificates' },
                            { icon: ShieldAlert, label: 'Fraud Detection', link: '/admin/fraud' },
                        ].map((action, index) => (
                            <Link key={index} to={action.link}>
                                <motion.div
                                    whileHover={{ x: 8, backgroundColor: '#EAF7F2' }}
                                    className="flex items-center gap-4 text-sm text-[#5F7A74] hover:text-[#6FA295] p-3 rounded-xl cursor-pointer transition-all"
                                >
                                    <div className="p-2 bg-[#F5F9F8] rounded-lg">
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{action.label}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.p
                variants={itemVariants}
                className="text-center text-xs text-[#8FB9AA] pt-4"
            >
                © 2026 CertifyFlow. All rights reserved.
            </motion.p>
        </motion.div>
    );
};

export default AdminDashboard;
