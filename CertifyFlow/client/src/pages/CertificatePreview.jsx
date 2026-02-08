import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Loader2, ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from '../components/CertificateTemplate';
import { useAuth } from '../context/AuthContext';

const CertificatePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const certificateRef = useRef(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    // Check if certificate is revoked
    const isRevoked = certificate?.isRevoked || certificate?.status === 'revoked';

    // Fetch certificate data
    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/certificates/${id}`);
                setCertificate(data);
            } catch (err) {
                setError('Certificate not found');
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    // Track download if user is logged in
    const trackDownload = async () => {
        if (user?.token) {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                    withCredentials: true,
                };
                await axios.post(`http://localhost:5000/api/student/certificates/${id}/download`, {}, config);
            } catch (err) {
                console.error('Error tracking download:', err);
            }
        }
    };

    // Download as PDF
    const handleDownload = async () => {
        // Block download for revoked certificates
        if (isRevoked) {
            setError('This certificate has been revoked and cannot be downloaded.');
            return;
        }

        if (!certificateRef.current) return;

        setDownloading(true);
        try {
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Certificate-${certificate.certificateId}.pdf`);

            // Track download
            await trackDownload();
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) {
            console.error('Error generating PDF:', err);
            setError('Failed to generate PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Share certificate
    const handleShare = async () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Certificate - ${certificate?.studentName}`,
                    text: `Check out this certificate from CertifyFlow`,
                    url: shareUrl
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#EAF2EF] to-[#D5E8E0] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#6FA295] animate-spin mx-auto mb-4" />
                    <p className="text-[#5F7A74] font-medium">Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#EAF2EF] to-[#D5E8E0] flex items-center justify-center">
                <div className="text-center bg-white p-12 rounded-3xl shadow-xl">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2F3E3A] mb-2">Certificate Not Found</h2>
                    <p className="text-[#5F7A74] mb-6">The certificate you're looking for doesn't exist.</p>
                    <Link to="/">
                        <button className="px-6 py-3 bg-[#6FA295] text-white font-bold rounded-xl hover:bg-[#5F9487] transition-all">
                            Go Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EAF2EF] to-[#D5E8E0]">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-[#8FB9AA]/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <motion.button
                        onClick={() => navigate(-1)}
                        whileHover={{ x: -4 }}
                        className="flex items-center gap-2 text-[#5F7A74] hover:text-[#2F3E3A] font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#6FA295] to-[#5F9487] p-2 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-[#2F3E3A]">CertifyFlow</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            onClick={handleShare}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-[#F5F9F8] text-[#6FA295] rounded-xl hover:bg-[#EAF7F2] transition-all"
                        >
                            <Share2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            onClick={handleDownload}
                            disabled={downloading || isRevoked}
                            whileHover={{ scale: isRevoked ? 1 : 1.02 }}
                            whileTap={{ scale: isRevoked ? 1 : 0.98 }}
                            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-lg transition-all ${isRevoked
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-gray-400/20'
                                    : 'bg-[#6FA295] hover:bg-[#5F9487] text-white shadow-[#6FA295]/30'
                                }`}
                            title={isRevoked ? 'Cannot download revoked certificate' : 'Download PDF'}
                        >
                            {downloading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : downloadSuccess ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            {downloading ? 'Generating...' : downloadSuccess ? 'Downloaded!' : isRevoked ? 'Download Disabled' : 'Download PDF'}
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Revoked Warning Banner */}
            {isRevoked && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500 text-white py-3 px-6"
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">
                            This certificate has been revoked and is no longer valid.
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Certificate Display */}
            <main className="max-w-5xl mx-auto py-12 px-6">
                {/* Verification Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mb-8"
                >
                    {isRevoked ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold border border-red-200">
                            <XCircle className="w-4 h-4" />
                            Certificate Revoked
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-200">
                            <CheckCircle className="w-4 h-4" />
                            Verified Certificate
                        </div>
                    )}
                </motion.div>

                {/* Certificate */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`flex justify-center ${isRevoked ? 'opacity-60' : ''}`}
                >
                    <CertificateTemplate ref={certificateRef} certificate={certificate} />
                </motion.div>

                {/* Certificate Details */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto"
                >
                    <h3 className="font-bold text-[#2F3E3A] mb-4">Certificate Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-[#8FB9AA]">Certificate ID</p>
                            <p className="font-semibold text-[#2F3E3A]">{certificate.certificateId}</p>
                        </div>
                        <div>
                            <p className="text-[#8FB9AA]">Status</p>
                            <p className={`font-semibold flex items-center gap-1.5 ${isRevoked ? 'text-red-600' : 'text-green-600'}`}>
                                {isRevoked ? (
                                    <><XCircle className="w-4 h-4" /> Revoked</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Active</>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-[#8FB9AA]">Issued To</p>
                            <p className="font-semibold text-[#2F3E3A]">{certificate.studentName}</p>
                        </div>
                        <div>
                            <p className="text-[#8FB9AA]">Downloads</p>
                            <p className="font-semibold text-[#2F3E3A]">{certificate.downloadCount || 0}</p>
                        </div>
                        <div>
                            <p className="text-[#8FB9AA]">Internship Domain</p>
                            <p className="font-semibold text-[#2F3E3A]">{certificate.internshipDomain}</p>
                        </div>
                        <div>
                            <p className="text-[#8FB9AA]">Duration</p>
                            <p className="font-semibold text-[#2F3E3A]">
                                {new Date(certificate.startDate).toLocaleDateString()} - {new Date(certificate.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Revoked Info */}
                    {isRevoked && certificate.revokedAt && (
                        <div className="mt-4 pt-4 border-t border-red-100">
                            <div className="bg-red-50 text-red-700 p-4 rounded-xl">
                                <p className="font-medium flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Certificate Revoked
                                </p>
                                <p className="text-sm">
                                    Revoked on {new Date(certificate.revokedAt).toLocaleDateString()}
                                    {certificate.revokeReason && ` - Reason: ${certificate.revokeReason}`}
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default CertificatePreview;
