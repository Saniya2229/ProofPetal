import React, { useState, useRef } from 'react';
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const UploadExcel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await axios.post('https://proofpetal.onrender.com/api/certificates/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setResult(data);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-5xl mx-auto"
        >
            {/* Upload Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#8FB9AA]/10 p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#2F3E3A]">Upload Student Data (Excel)</h1>
                    <p className="text-[#5F7A74] mt-2">
                        Upload an Excel file to generate certificates. Please ensure your file format is correct.
                    </p>
                </div>

                {/* Drop Zone */}
                <motion.div
                    whileHover={{ borderColor: '#6FA295', backgroundColor: '#F5F9F8' }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#8FB9AA]/30 rounded-2xl p-12 text-center cursor-pointer transition-all bg-white group"
                >
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <UploadIcon className="w-16 h-16 text-[#8FB9AA] group-hover:text-[#6FA295] mx-auto mb-4 transition-colors" />
                    </motion.div>
                    <p className="text-[#2F3E3A] font-medium text-lg">
                        Drag & drop your Excel file here, or <span className="text-[#6FA295] font-bold hover:underline">click to browse</span>
                    </p>
                    <p className="text-sm text-[#8FB9AA] mt-2">Supports .xlsx and .xls files up to 5MB</p>
                </motion.div>

                {/* File Selected Info */}
                {file && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 p-4 bg-[#EAF7F2] rounded-xl border border-[#8FB9AA]/20 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-lg">
                                <FileSpreadsheet className="w-6 h-6 text-[#6FA295]" />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-[#2F3E3A] block">{file.name}</span>
                                <span className="text-xs text-[#5F7A74]">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setFile(null)}
                            className="p-2 hover:bg-white rounded-full text-[#8FB9AA] hover:text-red-500 transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Messages */}
                {error && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-3 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                            <p className="font-bold">Success!</p>
                            <p className="text-sm">{result.message}</p>
                        </div>
                    </div>
                )}

                {/* Simple Process Button */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="mt-8 w-full py-4 bg-[#6FA295] hover:bg-[#5F9487] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-[#6FA295]/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    {uploading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <UploadIcon className="w-5 h-5" />
                            Process Upload
                        </>
                    )}
                </motion.button>
            </div>

            {/* Excel File Format Instructions */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#8FB9AA]/10 p-8">
                <h3 className="text-lg font-bold text-[#2F3E3A] mb-6">Excel File Format Requirements</h3>
                <div className="overflow-hidden rounded-xl border border-[#8FB9AA]/10">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[#F5F9F8] border-b border-[#8FB9AA]/10">
                                <th className="px-6 py-4 text-left font-bold text-[#5F7A74]">Column Name</th>
                                <th className="px-6 py-4 text-left font-bold text-[#5F7A74]">Example Data</th>
                                <th className="px-6 py-4 text-center font-bold text-[#5F7A74]">Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#8FB9AA]/10">
                            {[
                                { col: 'certificateId', ex: 'CF-2024-001' },
                                { col: 'studentName', ex: 'John Doe' },
                                { col: 'studentEmail', ex: 'john@example.com' },
                                { col: 'internshipDomain', ex: 'Web Development' },
                                { col: 'startDate', ex: '2024-01-01' },
                                { col: 'endDate', ex: '2024-03-31' },
                            ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-[#F5F9F8]/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-[#6FA295] font-medium">{row.col}</td>
                                    <td className="px-6 py-4 text-[#2F3E3A]">{row.ex}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center w-6 h-6 bg-[#EAF7F2] rounded text-[#6FA295]">
                                            <CheckCircle className="w-4 h-4" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default UploadExcel;
