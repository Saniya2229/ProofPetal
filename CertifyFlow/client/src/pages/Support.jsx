import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Send, MessageSquare, HelpCircle, ChevronDown, Phone, MapPin, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Support = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const faqs = [
        {
            question: "How do I verify my internship certificate?",
            answer: "You can verify your certificate by entering the unique Certificate ID (e.g., CF-2024-001) on the home page or your dashboard. The system will instantly validate its authenticity."
        },
        {
            question: "What if my Certificate ID is not found?",
            answer: "Please double-check the ID from your completion email. If you're sure it's correct but still facing issues, please contact support using the form below."
        },
        {
            question: "Can I download a digital copy?",
            answer: "Yes! Once your certificate is verified, you will see a 'Download PDF' button to save a high-quality digital copy for your records."
        },
        {
            question: "Is the digital certificate valid for jobs?",
            answer: "Absolutely. CertifyFlow certificates are securely generated and can be verified by any employer using the unique ID, making them valid for professional use."
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/contact', {
                name: formData.name,
                email: formData.email,
                message: formData.message
            });

            if (data.success) {
                setSuccess(data.message || 'Message sent successfully! We will get back to you soon.');
                setFormData({ name: '', email: '', message: '' });

                // Auto-clear success message after 5 seconds
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F9F8] font-sans selection:bg-[#6FA295]/20 selection:text-[#2F3E3A]">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#8FB9AA]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-[#6FA295] to-[#5F9487] p-2.5 rounded-xl shadow-lg shadow-[#6FA295]/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2F3E3A] to-[#5F7A74]">
                            CertifyFlow
                        </span>
                    </Link>
                    <Link
                        to="/student-dashboard"
                        className="flex items-center gap-2 text-sm font-bold text-[#5F7A74] hover:text-[#2F3E3A] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-[#EAF7F2] text-[#6FA295] text-xs font-bold rounded-full uppercase tracking-wider"
                    >
                        We're here to help
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-extrabold text-[#2F3E3A]"
                    >
                        Support Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-[#5F7A74] text-lg max-w-2xl mx-auto"
                    >
                        Find answers to common questions or reach out to our team for assistance with your certificates.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* FAQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-[#2F3E3A] mb-8 flex items-center gap-3">
                            <HelpCircle className="w-6 h-6 text-[#6FA295]" />
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-[#8FB9AA]/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="font-bold text-[#2F3E3A] text-lg">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-[#8FB9AA] transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-6 pb-6"
                                            >
                                                <p className="text-[#5F7A74] leading-relaxed border-t border-[#F5F9F8] pt-4">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-[#2F3E3A] rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6FA295]/20 rounded-full blur-[40px]"></div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Other ways to connect</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-3 text-white/80">
                                    <Mail className="w-5 h-5 text-[#6FA295]" />
                                    <span>support@certifyflow.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <Phone className="w-5 h-5 text-[#6FA295]" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <MapPin className="w-5 h-5 text-[#6FA295]" />
                                    <span>123 Tech Park, Innovation Way</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#8FB9AA]/10 h-fit"
                    >
                        <h2 className="text-2xl font-bold text-[#2F3E3A] mb-2 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-[#6FA295]" />
                            Send us a Message
                        </h2>
                        <p className="text-[#5F7A74] mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Success Message */}
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100"
                                    >
                                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{success}</span>
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
                                        className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-sm font-bold text-[#2F3E3A] mb-2">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-5 py-3.5 bg-[#F5F9F8] rounded-xl text-[#2F3E3A] placeholder:text-[#A0B8B2] focus:outline-none focus:ring-2 focus:ring-[#6FA295]/20 font-medium transition-all disabled:opacity-50"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#2F3E3A] mb-2">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled={loading}
                                        className="w-full px-5 py-3.5 bg-[#F5F9F8] rounded-xl text-[#2F3E3A] placeholder:text-[#A0B8B2] focus:outline-none focus:ring-2 focus:ring-[#6FA295]/20 font-medium transition-all disabled:opacity-50"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#2F3E3A] mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    disabled={loading}
                                    rows="4"
                                    className="w-full px-5 py-3.5 bg-[#F5F9F8] rounded-xl text-[#2F3E3A] placeholder:text-[#A0B8B2] focus:outline-none focus:ring-2 focus:ring-[#6FA295]/20 font-medium transition-all resize-none disabled:opacity-50"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#2F3E3A] text-white font-bold rounded-xl hover:bg-[#1E2D2B] transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>

            <footer className="py-8 text-center text-[#8FB9AA] text-sm font-medium border-t border-[#8FB9AA]/10 bg-white mt-auto">
                &copy; {new Date().getFullYear()} CertifyFlow Verification Systems. Secure & Trusted.
            </footer>
        </div>
    );
};

export default Support;
