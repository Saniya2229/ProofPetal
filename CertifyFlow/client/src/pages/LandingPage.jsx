import React, { useState } from 'react';
import axios from 'axios';
import { Search, Download, CheckCircle, Award, Shield, Zap, Globe, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const [searchId, setSearchId] = useState('');
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId) return;

        setLoading(true);
        setError('');
        setCertificate(null);

        try {
            const { data } = await axios.get(`http://localhost:5000/api/certificates/search/${searchId}`);
            setCertificate(data);
            // Scroll to certificate view
            setTimeout(() => {
                document.getElementById('certificate-result')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            setError('Certificate not found. Please check the ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white selection:bg-primary-100 selection:text-primary-900">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-secondary-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-1.5 rounded-lg shadow-lg shadow-primary-500/30">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-secondary-900 tracking-tight">CertifyFlow</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors">How it Works</a>
                            <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700">Admin Login</Link>
                            <a href="#verify" className="bg-secondary-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-secondary-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                                Verify Certificate
                            </a>
                        </div>

                        {/* Mobile toggle */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary-600">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-secondary-100 p-4 space-y-4 shadow-xl absolute w-full">
                        <a href="#features" className="block text-secondary-600 font-medium">Features</a>
                        <Link to="/login" className="block text-primary-600 font-medium">Admin Login</Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl -z-10"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6 border border-primary-100">
                            Trusted Verification System
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary-900 leading-[1.1] mb-6 tracking-tight">
                            Verify Academic <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Credentials Instantly</span>
                        </h1>
                        <p className="text-xl text-secondary-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Secure, fast, and reliable certificate verification system for students and employers. Ensure authenticity with a single click.
                        </p>
                    </motion.div>

                    {/* Search Component */}
                    <motion.div
                        id="verify"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl shadow-primary-900/10 border border-secondary-200 flex flex-col md:flex-row gap-2 relative z-20"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <input
                                type="text"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Enter Certificate ID (e.g. CF-2024-001)"
                                className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-secondary-900 font-medium placeholder-secondary-400 text-lg"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading || !searchId}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 disabled:bg-secondary-300 shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying...' : <>Verify Now <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </motion.div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium border border-red-100"
                        >
                            <X className="w-4 h-4" /> {error}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Certificate Result Section */}
            <AnimatePresence>
                {certificate && (
                    <section id="certificate-result" className="py-20 bg-secondary-900 text-white relative overflow-hidden">
                        <div className="max-w-5xl mx-auto px-6 relative z-10">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold">Certificate Found</h2>
                                    <p className="text-secondary-400 mt-2">Verified successfully on {new Date().toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="bg-white text-secondary-900 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-secondary-100 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                            </div>

                            {/* Certificate Card */}
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white text-secondary-900 rounded-2xl shadow-2xl overflow-hidden relative"
                            >
                                <div className="p-12 md:p-16 text-center border-8 border-double border-primary-50 m-4 relative">
                                    {/* Watermark/Bg */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                        <Award className="w-96 h-96" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 border border-green-100">
                                            <CheckCircle className="w-4 h-4" /> Authenticity Verified
                                        </div>

                                        <h2 className="text-4xl font-serif font-bold text-secondary-800 mb-2">Certificate of Completion</h2>
                                        <p className="text-secondary-500 uppercase tracking-[0.2em] text-xs font-bold mb-12">This acknowledges that</p>

                                        <h1 className="text-3xl md:text-5xl font-bold text-primary-700 mb-8 border-b-2 border-dashed border-secondary-200 pb-8 inline-block px-12 font-serif">
                                            {certificate.studentName}
                                        </h1>

                                        <p className="text-secondary-600 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
                                            Has successfully completed the Internship Program in <span className="font-bold text-secondary-900 block text-xl mt-2">{certificate.internshipDomain}</span>
                                        </p>

                                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-sm text-secondary-500 mb-16">
                                            <span className="bg-secondary-50 px-4 py-2 rounded-lg border border-secondary-100">Start: {new Date(certificate.startDate).toLocaleDateString()}</span>
                                            <ArrowRight className="w-4 h-4 text-secondary-300 hidden md:block" />
                                            <span className="bg-secondary-50 px-4 py-2 rounded-lg border border-secondary-100">End: {new Date(certificate.endDate).toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex justify-between items-end px-4 md:px-20">
                                            <div className="text-center">
                                                <div className="w-32 md:w-48 border-b border-secondary-900 mb-2"></div>
                                                <p className="font-bold text-secondary-900 text-sm">Program Director</p>
                                            </div>
                                            <div className="h-20 w-20 md:h-24 md:w-24 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/50">
                                                <Award className="w-10 h-10 md:w-12 md:h-12" />
                                            </div>
                                            <div className="text-center">
                                                <div className="w-32 md:w-48 border-b border-secondary-900 mb-2"></div>
                                                <p className="font-bold text-secondary-900 text-sm">CEO, CertifyFlow</p>
                                            </div>
                                        </div>

                                        <div className="mt-12 text-xs text-secondary-300 font-mono">
                                            ID: {certificate.certificateId} • VERIFIED SOURCE
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}
            </AnimatePresence>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-secondary-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-secondary-900 mb-4">Why Choose CertifyFlow?</h2>
                        <p className="text-secondary-500 max-w-2xl mx-auto">We provide a seamless and secure ecosystem for managing and verifying academic credentials.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Shield, title: 'Secure & Tamper-Proof', desc: 'Encrypted database ensures that student records are immutable and safe.' },
                            { icon: Zap, title: 'Instant Verification', desc: 'Real-time retrieval of certificate details using our search algorithms.' },
                            { icon: Globe, title: 'Global Accessibility', desc: 'Access and verify certificates from anywhere in the world, 24/7.' }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl border border-secondary-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                                    <feature.icon className="w-7 h-7 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-secondary-900 mb-3">{feature.title}</h3>
                                <p className="text-secondary-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-secondary-100 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-secondary-900 p-1.5 rounded-lg">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-secondary-900">CertifyFlow</span>
                    </div>
                    <p className="text-secondary-500 text-sm">© 2026 CertifyFlow Systems. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors">Privacy</a>
                        <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors">Terms</a>
                        <a href="#" className="text-secondary-400 hover:text-primary-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
