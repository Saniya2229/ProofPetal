import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileX,
    CheckCircle,
    XCircle,
    Trash2,
    Eye,
    RefreshCw,
    Download,
    Filter,
    ChevronDown,
    AlertTriangle,
    X,
    Edit3,
    Clock,
    History,
    Calendar,
    User,
    BookOpen,
    Globe,
    Save,
    ShieldAlert,
    Sparkles,
    ArrowRight
} from 'lucide-react';

const ManageCertificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, revoked
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, type: '', certificate: null });
    const [successMessage, setSuccessMessage] = useState('');

    // Edit modal state
    const [editModal, setEditModal] = useState({ show: false, certificate: null });
    const [editForm, setEditForm] = useState({
        studentName: '',
        internshipDomain: '',
        startDate: '',
        endDate: ''
    });
    const [editLoading, setEditLoading] = useState(false);

    // History modal state
    const [historyModal, setHistoryModal] = useState({ show: false, certificate: null });
    const [verificationHistory, setVerificationHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Smart search state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [correction, setCorrection] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Fetch all certificates
    const fetchCertificates = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            const { data } = await axios.get('http://localhost:5000/api/certificates', config);
            setCertificates(data.certificates || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch certificates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchCertificates();
        }
    }, [user]);

    // Debounced smart search function
    const performSmartSearch = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setCorrection(null);
            setShowSuggestions(false);
            return;
        }

        try {
            setSearchLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            const { data } = await axios.get(
                `http://localhost:5000/api/certificates/search?q=${encodeURIComponent(query)}&limit=8`,
                config
            );

            setSuggestions(data.suggestions || []);
            setCorrection(data.correction || null);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
        } catch (err) {
            console.error('Smart search error:', err);
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
        }
    }, [user?.token]);

    // Handle search input change with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear previous debounce timer
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce the API call (300ms)
        debounceRef.current = setTimeout(() => {
            performSmartSearch(value);
        }, 300);
    };

    // Handle suggestion selection
    const selectSuggestion = (suggestion) => {
        setSearchTerm(suggestion.certificate.certificateId);
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
    };

    // Handle correction click
    const applyCorrectionSuggestion = () => {
        if (correction) {
            setSearchTerm(correction.suggestion);
            performSmartSearch(correction.suggestion);
        }
    };

    // Handle keyboard navigation in suggestions
    const handleSearchKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                    selectSuggestion(suggestions[selectedSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Toggle revoke status
    const handleRevoke = async (certificateId, currentStatus) => {
        try {
            setActionLoading(certificateId);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            const { data } = await axios.put(
                `http://localhost:5000/api/certificates/${certificateId}/revoke`,
                {},
                config
            );

            // Update local state
            setCertificates(prev => prev.map(cert =>
                cert.certificateId === certificateId
                    ? { ...cert, isRevoked: !currentStatus, status: currentStatus ? 'active' : 'revoked' }
                    : cert
            ));

            setSuccessMessage(data.message || `Certificate ${currentStatus ? 'restored' : 'revoked'} successfully`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update certificate');
        } finally {
            setActionLoading(null);
            setConfirmModal({ show: false, type: '', certificate: null });
        }
    };

    // Delete certificate
    const handleDelete = async (certificateId) => {
        try {
            setActionLoading(certificateId);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            await axios.delete(`http://localhost:5000/api/certificates/${certificateId}`, config);

            // Remove from local state
            setCertificates(prev => prev.filter(cert => cert.certificateId !== certificateId));

            setSuccessMessage('Certificate deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete certificate');
        } finally {
            setActionLoading(null);
            setConfirmModal({ show: false, type: '', certificate: null });
        }
    };

    // Open edit modal
    const openEditModal = (certificate) => {
        setEditForm({
            studentName: certificate.studentName,
            internshipDomain: certificate.internshipDomain,
            startDate: new Date(certificate.startDate).toISOString().split('T')[0],
            endDate: new Date(certificate.endDate).toISOString().split('T')[0]
        });
        setEditModal({ show: true, certificate });
    };

    // Handle edit certificate
    const handleEdit = async () => {
        try {
            setEditLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            const { data } = await axios.put(
                `http://localhost:5000/api/certificates/${editModal.certificate.certificateId}`,
                editForm,
                config
            );

            // Update local state
            setCertificates(prev => prev.map(cert =>
                cert.certificateId === editModal.certificate.certificateId
                    ? { ...cert, ...data.certificate }
                    : cert
            ));

            setSuccessMessage('Certificate updated successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
            setEditModal({ show: false, certificate: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update certificate');
        } finally {
            setEditLoading(false);
        }
    };

    // Fetch verification history
    const fetchVerificationHistory = async (certificateId) => {
        try {
            setHistoryLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
                withCredentials: true,
            };
            const { data } = await axios.get(
                `http://localhost:5000/api/certificates/${certificateId}/history`,
                config
            );
            setVerificationHistory(data.history || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch verification history');
            setVerificationHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Open history modal
    const openHistoryModal = (certificate) => {
        setHistoryModal({ show: true, certificate });
        fetchVerificationHistory(certificate.certificateId);
    };

    // Filter certificates
    const filteredCertificates = certificates.filter(cert => {
        const matchesSearch =
            cert.certificateId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.internshipDomain.toLowerCase().includes(searchTerm.toLowerCase());

        const isRevoked = cert.isRevoked || cert.status === 'revoked';
        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'active' && !isRevoked) ||
            (filterStatus === 'revoked' && isRevoked);

        return matchesSearch && matchesFilter;
    });

    // Stats
    const stats = {
        total: certificates.length,
        active: certificates.filter(c => !c.isRevoked && c.status !== 'revoked').length,
        revoked: certificates.filter(c => c.isRevoked || c.status === 'revoked').length,
    };

    // Format date for display
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format timestamp for history
    const formatTimestamp = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2F3E3A]">Manage Certificates</h1>
                    <p className="text-[#5F7A74] text-sm mt-1">View, edit, revoke, or delete certificates</p>
                </div>
                <motion.button
                    onClick={fetchCertificates}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6FA295] text-white rounded-xl font-medium hover:bg-[#5F9487] transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </motion.button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            {error}
                        </div>
                        <button onClick={() => setError('')} className="hover:bg-red-100 p-1 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl p-5 border border-[#8FB9AA]/20 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-[#EAF7F2] text-[#6FA295]">
                            <FileX className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#2F3E3A]">{stats.total}</p>
                            <p className="text-xs text-[#5F7A74]">Total Certificates</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl p-5 border border-[#8FB9AA]/20 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-50 text-green-500">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#2F3E3A]">{stats.active}</p>
                            <p className="text-xs text-[#5F7A74]">Active Certificates</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl p-5 border border-[#8FB9AA]/20 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-red-50 text-red-500">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#2F3E3A]">{stats.revoked}</p>
                            <p className="text-xs text-[#5F7A74]">Revoked Certificates</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1" ref={searchRef}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FB9AA]" />
                    {searchLoading && (
                        <RefreshCw className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6FA295] animate-spin" />
                    )}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        placeholder="Smart search by ID, name, email... (AI-powered)"
                        className="w-full pl-12 pr-10 py-3 rounded-xl border border-[#8FB9AA]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#6FA295]/30 focus:border-[#6FA295] transition-all"
                    />

                    {/* Smart Search Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && (suggestions.length > 0 || correction) && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-14 left-0 right-0 bg-white border border-[#8FB9AA]/20 rounded-xl shadow-2xl z-30 overflow-hidden"
                            >
                                {/* AI Badge Header */}
                                <div className="px-4 py-2 bg-gradient-to-r from-[#6FA295]/10 to-[#8FB9AA]/10 border-b border-[#8FB9AA]/10 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#6FA295]" />
                                    <span className="text-xs font-medium text-[#5F7A74]">Smart Suggestions</span>
                                    {suggestions.length > 0 && (
                                        <span className="ml-auto text-xs text-[#8FB9AA]">
                                            {suggestions.length} result{suggestions.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {/* Did you mean? Correction */}
                                {correction && (
                                    <button
                                        onClick={applyCorrectionSuggestion}
                                        className="w-full px-4 py-3 flex items-center gap-3 bg-amber-50 border-b border-amber-100 hover:bg-amber-100 transition-colors text-left"
                                    >
                                        <span className="text-amber-600 text-sm">Did you mean:</span>
                                        <span className="font-mono font-bold text-amber-700">{correction.suggestion}</span>
                                        <span className="text-xs text-amber-500">({correction.similarity}% match)</span>
                                        <ArrowRight className="w-4 h-4 text-amber-500 ml-auto" />
                                    </button>
                                )}

                                {/* Suggestions List */}
                                <div className="max-h-64 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion.certificate.certificateId}
                                            onClick={() => selectSuggestion(suggestion)}
                                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F5F9F8] transition-colors text-left border-b border-[#8FB9AA]/10 last:border-0 ${selectedSuggestionIndex === index ? 'bg-[#EAF7F2]' : ''}`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-medium text-[#2F3E3A] truncate">
                                                        {suggestion.certificate.certificateId}
                                                    </span>
                                                    {/* Similarity Badge */}
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${suggestion.similarity >= 90
                                                            ? 'bg-green-100 text-green-700'
                                                            : suggestion.similarity >= 70
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {suggestion.similarity}%
                                                    </span>
                                                    {suggestion.matchType === 'exact' && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                                                            Exact
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-[#5F7A74] truncate">
                                                    {suggestion.certificate.studentName} • {suggestion.certificate.internshipDomain}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${suggestion.certificate.status === 'revoked'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-green-50 text-green-600'
                                                }`}>
                                                {suggestion.certificate.status || 'active'}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Keyboard Hints */}
                                <div className="px-4 py-2 bg-[#F5F9F8] border-t border-[#8FB9AA]/10 flex items-center gap-4 text-xs text-[#8FB9AA]">
                                    <span>↑↓ Navigate</span>
                                    <span>↵ Select</span>
                                    <span>Esc Close</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-[#8FB9AA]/20 rounded-xl hover:border-[#6FA295] transition-colors"
                    >
                        <Filter className="w-4 h-4 text-[#6FA295]" />
                        <span className="text-[#2F3E3A] font-medium capitalize">{filterStatus}</span>
                        <ChevronDown className="w-4 h-4 text-[#8FB9AA]" />
                    </button>

                    <AnimatePresence>
                        {showFilterDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-14 bg-white border border-[#8FB9AA]/20 rounded-xl shadow-lg z-20 overflow-hidden min-w-[150px]"
                            >
                                {['all', 'active', 'revoked'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setShowFilterDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm capitalize hover:bg-[#F5F9F8] transition-colors ${filterStatus === status ? 'bg-[#EAF7F2] text-[#6FA295] font-medium' : 'text-[#2F3E3A]'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-2xl border border-[#8FB9AA]/20 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-[#6FA295] animate-spin mx-auto mb-3" />
                        <p className="text-[#5F7A74]">Loading certificates...</p>
                    </div>
                ) : filteredCertificates.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileX className="w-12 h-12 text-[#8FB9AA] mx-auto mb-3" />
                        <p className="text-[#5F7A74] font-medium">No certificates found</p>
                        <p className="text-[#8FB9AA] text-sm mt-1">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter'
                                : 'Upload certificates via Excel to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#F5F9F8] border-b border-[#8FB9AA]/20">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Certificate ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Domain</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Risk</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-[#5F7A74] uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#8FB9AA]/10">
                                {filteredCertificates.map((cert) => {
                                    const isRevoked = cert.isRevoked || cert.status === 'revoked';
                                    return (
                                        <motion.tr
                                            key={cert.certificateId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-[#F5F9F8] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-medium text-[#2F3E3A] bg-[#F5F9F8] px-2 py-1 rounded">
                                                    {cert.certificateId}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-[#2F3E3A]">{cert.studentName}</p>
                                                    <p className="text-xs text-[#8FB9AA]">{cert.studentEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#5F7A74]">{cert.internshipDomain}</td>
                                            <td className="px-6 py-4 text-[#5F7A74] text-sm">
                                                {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isRevoked
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-green-50 text-green-600'
                                                    }`}>
                                                    {isRevoked ? (
                                                        <><XCircle className="w-3 h-3" /> Revoked</>
                                                    ) : (
                                                        <><CheckCircle className="w-3 h-3" /> Active</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {cert.riskLevel && cert.riskLevel !== 'none' ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cert.riskLevel === 'high'
                                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                                        : cert.riskLevel === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                        }`}>
                                                        <ShieldAlert className="w-3 h-3" />
                                                        {cert.riskLevel.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#8FB9AA] text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View */}
                                                    <motion.button
                                                        onClick={() => window.open(`/certificate/${cert.certificateId}`, '_blank')}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-[#6FA295] hover:bg-[#EAF7F2] rounded-lg transition-colors"
                                                        title="View Certificate"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </motion.button>

                                                    {/* Edit */}
                                                    <motion.button
                                                        onClick={() => openEditModal(cert)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Certificate"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </motion.button>

                                                    {/* History */}
                                                    <motion.button
                                                        onClick={() => openHistoryModal(cert)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Verification History"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </motion.button>

                                                    {/* Revoke/Restore */}
                                                    <motion.button
                                                        onClick={() => setConfirmModal({
                                                            show: true,
                                                            type: 'revoke',
                                                            certificate: cert
                                                        })}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        disabled={actionLoading === cert.certificateId}
                                                        className={`p-2 rounded-lg transition-colors ${isRevoked
                                                            ? 'text-green-500 hover:bg-green-50'
                                                            : 'text-amber-500 hover:bg-amber-50'
                                                            }`}
                                                        title={isRevoked ? 'Restore Certificate' : 'Revoke Certificate'}
                                                    >
                                                        {actionLoading === cert.certificateId ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : isRevoked ? (
                                                            <CheckCircle className="w-4 h-4" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                    </motion.button>

                                                    {/* Delete */}
                                                    <motion.button
                                                        onClick={() => setConfirmModal({
                                                            show: true,
                                                            type: 'delete',
                                                            certificate: cert
                                                        })}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        disabled={actionLoading === cert.certificateId}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Certificate"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setConfirmModal({ show: false, type: '', certificate: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.type === 'delete' ? 'bg-red-50' : 'bg-amber-50'
                                }`}>
                                <AlertTriangle className={`w-8 h-8 ${confirmModal.type === 'delete' ? 'text-red-500' : 'text-amber-500'
                                    }`} />
                            </div>

                            <h3 className="text-xl font-bold text-[#2F3E3A] text-center mb-2">
                                {confirmModal.type === 'delete'
                                    ? 'Delete Certificate?'
                                    : (confirmModal.certificate?.isRevoked || confirmModal.certificate?.status === 'revoked')
                                        ? 'Restore Certificate?'
                                        : 'Revoke Certificate?'}
                            </h3>

                            <p className="text-[#5F7A74] text-center text-sm mb-6">
                                {confirmModal.type === 'delete'
                                    ? 'This action cannot be undone. The certificate will be permanently removed.'
                                    : (confirmModal.certificate?.isRevoked || confirmModal.certificate?.status === 'revoked')
                                        ? 'This will restore the certificate and make it valid again.'
                                        : 'This will mark the certificate as revoked. Students will not be able to download it.'}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ show: false, type: '', certificate: null })}
                                    className="flex-1 px-4 py-3 border border-[#8FB9AA]/20 rounded-xl text-[#5F7A74] font-medium hover:bg-[#F5F9F8] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModal.type === 'delete') {
                                            handleDelete(confirmModal.certificate.certificateId);
                                        } else {
                                            handleRevoke(confirmModal.certificate.certificateId, confirmModal.certificate.isRevoked || confirmModal.certificate.status === 'revoked');
                                        }
                                    }}
                                    disabled={actionLoading}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-colors flex items-center justify-center gap-2 ${confirmModal.type === 'delete'
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : (confirmModal.certificate?.isRevoked || confirmModal.certificate?.status === 'revoked')
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-amber-500 hover:bg-amber-600'
                                        }`}
                                >
                                    {actionLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : confirmModal.type === 'delete' ? (
                                        'Delete'
                                    ) : (confirmModal.certificate?.isRevoked || confirmModal.certificate?.status === 'revoked') ? (
                                        'Restore'
                                    ) : (
                                        'Revoke'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setEditModal({ show: false, certificate: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
                                        <Edit3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#2F3E3A]">Edit Certificate</h3>
                                        <p className="text-sm text-[#8FB9AA]">{editModal.certificate?.certificateId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditModal({ show: false, certificate: null })}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[#5F7A74] mb-2">
                                        <User className="w-4 h-4" /> Student Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.studentName}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, studentName: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-[#8FB9AA]/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-[#5F7A74] mb-2">
                                        <BookOpen className="w-4 h-4" /> Internship Domain
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.internshipDomain}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, internshipDomain: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-[#8FB9AA]/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-[#5F7A74] mb-2">
                                            <Calendar className="w-4 h-4" /> Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-[#8FB9AA]/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-[#5F7A74] mb-2">
                                            <Calendar className="w-4 h-4" /> End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={editForm.endDate}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-[#8FB9AA]/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setEditModal({ show: false, certificate: null })}
                                    className="flex-1 px-4 py-3 border border-[#8FB9AA]/20 rounded-xl text-[#5F7A74] font-medium hover:bg-[#F5F9F8] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEdit}
                                    disabled={editLoading}
                                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {editLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verification History Modal */}
            <AnimatePresence>
                {historyModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setHistoryModal({ show: false, certificate: null })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-xl bg-purple-50 text-purple-500">
                                        <History className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#2F3E3A]">Verification History</h3>
                                        <p className="text-sm text-[#8FB9AA]">{historyModal.certificate?.certificateId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setHistoryModal({ show: false, certificate: null })}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {historyLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                                    </div>
                                ) : verificationHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Clock className="w-12 h-12 text-[#8FB9AA] mx-auto mb-3" />
                                        <p className="text-[#5F7A74] font-medium">No verification attempts yet</p>
                                        <p className="text-sm text-[#8FB9AA] mt-1">
                                            Verification history will appear here when someone searches for this certificate
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {verificationHistory.map((log, index) => (
                                            <motion.div
                                                key={log._id || index}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-[#F5F9F8] rounded-xl p-4"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                                            ${log.result === 'valid' ? 'bg-green-100 text-green-600' :
                                                                log.result === 'revoked' ? 'bg-amber-100 text-amber-600' :
                                                                    'bg-red-100 text-red-600'}`}>
                                                            {log.result === 'valid' ? (
                                                                <><CheckCircle className="w-3 h-3" /> Valid</>
                                                            ) : log.result === 'revoked' ? (
                                                                <><AlertTriangle className="w-3 h-3" /> Revoked</>
                                                            ) : (
                                                                <><XCircle className="w-3 h-3" /> Invalid</>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-[#8FB9AA] flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTimestamp(log.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    <div className="flex items-center gap-1 text-[#5F7A74]">
                                                        <Globe className="w-3 h-3" />
                                                        <span className="truncate">{log.ipAddress || 'Unknown IP'}</span>
                                                    </div>
                                                    <div className="text-[#8FB9AA] truncate" title={log.userAgent}>
                                                        {log.userAgent ? log.userAgent.substring(0, 40) + '...' : 'Unknown Browser'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#8FB9AA]/20">
                                <button
                                    onClick={() => setHistoryModal({ show: false, certificate: null })}
                                    className="w-full px-4 py-3 bg-[#6FA295] hover:bg-[#5F9487] text-white rounded-xl font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageCertificates;
