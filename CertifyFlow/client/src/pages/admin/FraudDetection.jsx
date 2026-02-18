import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Filter,
    RefreshCw,
    ChevronDown,
    Activity,
    MapPin,
    Zap,
    TrendingUp,
    X,
    AlertCircle,
    FileText,
    User,
    Calendar
} from 'lucide-react';

const FraudDetection = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveData, setResolveData] = useState({ status: 'reviewed', resolution: '' });
    const [resolveLoading, setResolveLoading] = useState(false);

    // Filter state
    const [filters, setFilters] = useState({
        status: '',
        severity: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const config = {
        headers: { Authorization: `Bearer ${user?.token}` },
        withCredentials: true,
    };

    // Fetch fraud stats and alerts
    useEffect(() => {
        fetchData();
    }, [user, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.severity) params.append('severity', filters.severity);

            const [statsRes, alertsRes] = await Promise.all([
                axios.get('https://proofpetal.onrender.com/api/fraud/stats', config),
                axios.get(`https://proofpetal.onrender.com /api/fraud/alerts?${params.toString()}`, config)
            ]);

            setStats(statsRes.data.stats);
            setAlerts(alertsRes.data.alerts);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch fraud data');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveAlert = async () => {
        if (!selectedAlert) return;

        try {
            setResolveLoading(true);
            await axios.put(
                `https://proofpetal.onrender.com/api/fraud/alerts/${selectedAlert._id}/resolve`,
                resolveData,
                config
            );

            // Refresh data
            await fetchData();
            setShowResolveModal(false);
            setSelectedAlert(null);
            setResolveData({ status: 'reviewed', resolution: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resolve alert');
        } finally {
            setResolveLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-500/20 text-orange-400';
            case 'reviewed': return 'bg-blue-500/20 text-blue-400';
            case 'confirmed': return 'bg-red-500/20 text-red-400';
            case 'dismissed': return 'bg-green-500/20 text-green-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getAlertTypeIcon = (type) => {
        switch (type) {
            case 'velocity': return <Zap className="w-4 h-4" />;
            case 'location_anomaly': return <MapPin className="w-4 h-4" />;
            case 'pattern_anomaly': return <Activity className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#6FA295] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/60">Loading fraud detection data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="w-7 h-7 text-[#6FA295]" />
                        Fraud Detection
                    </h1>
                    <p className="text-white/60 mt-1">Monitor and manage suspicious verification activity</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6FA295]/20 text-[#6FA295] rounded-lg hover:bg-[#6FA295]/30 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl p-5 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats?.pending || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Pending Alerts</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl p-5 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats?.highSeverity || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">High Severity</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl p-5 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-[#6FA295]/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[#6FA295]" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats?.highRiskCertificates || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Flagged Certificates</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl p-5 border border-white/5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-3xl font-bold text-white">{stats?.reviewed || 0}</span>
                    </div>
                    <p className="text-white/60 text-sm">Resolved Alerts</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl border border-white/5 p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                    {(filters.status || filters.severity) && (
                        <button
                            onClick={() => setFilters({ status: '', severity: '' })}
                            className="text-sm text-[#6FA295] hover:text-[#8FB8AC] transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-2 bg-[#1E2D2B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6FA295] transition-colors"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="dismissed">Dismissed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm mb-2">Severity</label>
                                    <select
                                        value={filters.severity}
                                        onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                                        className="w-full px-4 py-2 bg-[#1E2D2B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#6FA295] transition-colors"
                                    >
                                        <option value="">All Severities</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Alerts Table */}
            <div className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-[#6FA295]" />
                        Fraud Alerts
                        <span className="text-sm font-normal text-white/50">({alerts.length} total)</span>
                    </h2>
                </div>

                {alerts.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShieldAlert className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No alerts found</p>
                        <p className="text-white/40 text-sm mt-1">The system is monitoring for suspicious activity</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Certificate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Severity</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Details</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {alerts.map((alert) => (
                                    <tr key={alert._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2 text-white">
                                                {getAlertTypeIcon(alert.alertType)}
                                                <span className="capitalize text-sm">{alert.alertType.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-white font-mono text-sm">{alert.certificateId}</p>
                                                {alert.certificate && (
                                                    <p className="text-white/50 text-xs mt-0.5">{alert.certificate.studentName}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                                                {alert.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white/70 text-sm max-w-xs truncate">
                                                {alert.details?.description || 'No details'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white/60 text-sm">{formatDate(alert.triggeredAt)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAlert(alert);
                                                        setShowResolveModal(true);
                                                    }}
                                                    disabled={alert.status !== 'pending'}
                                                    className={`p-2 rounded-lg transition-colors ${alert.status === 'pending'
                                                            ? 'bg-[#6FA295]/20 text-[#6FA295] hover:bg-[#6FA295]/30'
                                                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                                                        }`}
                                                    title={alert.status === 'pending' ? 'Resolve Alert' : 'Already resolved'}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            <AnimatePresence>
                {showResolveModal && selectedAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowResolveModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#2A3F3B] to-[#1E2D2B] rounded-2xl border border-white/10 w-full max-w-lg overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-[#6FA295]" />
                                    Resolve Alert
                                </h3>
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4">
                                {/* Alert Info */}
                                <div className="bg-[#1E2D2B] rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${getSeverityColor(selectedAlert.severity)}`}>
                                            {getAlertTypeIcon(selectedAlert.alertType)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium capitalize">
                                                {selectedAlert.alertType.replace('_', ' ')} Alert
                                            </p>
                                            <p className="text-white/50 text-sm">
                                                {selectedAlert.details?.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <FileText className="w-4 h-4" />
                                            <span className="font-mono">{selectedAlert.certificateId}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/60 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(selectedAlert.triggeredAt)}</span>
                                        </div>
                                        {selectedAlert.certificate && (
                                            <div className="flex items-center gap-2 text-white/60 text-sm col-span-2">
                                                <User className="w-4 h-4" />
                                                <span>{selectedAlert.certificate.studentName}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unique IPs if location anomaly */}
                                    {selectedAlert.details?.uniqueIPs?.length > 0 && (
                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-white/60 text-xs mb-2">Unique IPs ({selectedAlert.details.uniqueIPs.length})</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedAlert.details.uniqueIPs.map((ip, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/70 font-mono">
                                                        {ip}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resolution Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white/60 text-sm mb-2">Resolution Status</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['reviewed', 'dismissed', 'confirmed'].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setResolveData(prev => ({ ...prev, status }))}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${resolveData.status === status
                                                            ? status === 'confirmed'
                                                                ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                                                                : status === 'dismissed'
                                                                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                                                                    : 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white/60 text-sm mb-2">Resolution Notes (Optional)</label>
                                        <textarea
                                            value={resolveData.resolution}
                                            onChange={(e) => setResolveData(prev => ({ ...prev, resolution: e.target.value }))}
                                            placeholder="Add any notes about this resolution..."
                                            className="w-full px-4 py-3 bg-[#1E2D2B] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#6FA295] transition-colors resize-none h-24"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResolveAlert}
                                    disabled={resolveLoading}
                                    className="flex items-center gap-2 px-6 py-2 bg-[#6FA295] text-white rounded-lg hover:bg-[#5F9487] transition-colors disabled:opacity-50"
                                >
                                    {resolveLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Resolving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Resolve Alert
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FraudDetection;
