import React, { forwardRef } from 'react';
import { ShieldCheck, Award } from 'lucide-react';

const CertificateTemplate = forwardRef(({ certificate }, ref) => {
    if (!certificate) return null;

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div
            ref={ref}
            className="w-[800px] min-h-[566px] bg-white relative overflow-hidden"
            style={{
                fontFamily: "'Times New Roman', serif",
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
        >
            {/* Decorative Border */}
            <div className="absolute inset-3 border-4 border-[#2F3E3A]"></div>
            <div className="absolute inset-5 border-2 border-[#6FA295]"></div>

            {/* Corner Decorations */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 border-[#6FA295]"></div>
            <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 border-[#6FA295]"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 border-[#6FA295]"></div>
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 border-[#6FA295]"></div>

            {/* Content */}
            <div className="relative z-10 px-16 py-12 text-center">
                {/* Header with Logo */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-[#6FA295] to-[#5F9487] p-3 rounded-xl">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#2F3E3A] tracking-wide">CertifyFlow</h1>
                </div>

                {/* Certificate Title */}
                <div className="mt-6 mb-2">
                    <h2 className="text-lg text-[#6FA295] font-semibold uppercase tracking-[0.3em]">
                        Certificate of Completion
                    </h2>
                </div>

                {/* Award Icon */}
                <div className="flex justify-center my-4">
                    <Award className="w-12 h-12 text-[#D4AF37]" strokeWidth={1.5} />
                </div>

                {/* This is to certify */}
                <p className="text-[#5F7A74] text-lg italic mb-2">This is to certify that</p>

                {/* Student Name */}
                <h3 className="text-4xl font-bold text-[#2F3E3A] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    {certificate.studentName}
                </h3>

                {/* Email */}
                <p className="text-[#8FB9AA] text-sm mb-4">{certificate.studentEmail}</p>

                {/* Completion text */}
                <p className="text-[#5F7A74] text-lg leading-relaxed max-w-lg mx-auto mb-2">
                    has successfully completed the internship program in
                </p>

                {/* Domain */}
                <h4 className="text-2xl font-bold text-[#6FA295] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    {certificate.internshipDomain}
                </h4>

                {/* Duration */}
                <div className="flex justify-center items-center gap-6 text-[#5F7A74] text-sm mb-6">
                    <div className="text-center">
                        <p className="text-xs uppercase text-[#8FB9AA] mb-1">Start Date</p>
                        <p className="font-semibold">{formatDate(certificate.startDate)}</p>
                    </div>
                    <div className="w-16 h-px bg-[#8FB9AA]"></div>
                    <div className="text-center">
                        <p className="text-xs uppercase text-[#8FB9AA] mb-1">End Date</p>
                        <p className="font-semibold">{formatDate(certificate.endDate)}</p>
                    </div>
                </div>

                {/* Certificate ID */}
                <div className="inline-block bg-[#F5F9F8] px-4 py-2 rounded-lg mb-6">
                    <p className="text-xs text-[#8FB9AA]">
                        Certificate ID: <span className="font-bold text-[#6FA295]">{certificate.certificateId}</span>
                    </p>
                </div>

                {/* Signature Section */}
                <div className="flex justify-between items-end px-8 mt-4">
                    <div className="text-center">
                        <div className="w-32 h-px bg-[#2F3E3A] mb-2"></div>
                        <p className="text-sm text-[#5F7A74]">Date of Issue</p>
                        <p className="text-xs text-[#8FB9AA]">{formatDate(new Date())}</p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 relative">
                            <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-full flex items-center justify-center">
                                <span className="text-[#D4AF37] text-xs font-bold">VERIFIED</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="w-32 h-px bg-[#2F3E3A] mb-2"></div>
                        <p className="text-sm text-[#5F7A74]">Authorized Signature</p>
                        <p className="text-xs text-[#8FB9AA]">CertifyFlow Admin</p>
                    </div>
                </div>
            </div>

            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236FA295' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            ></div>
        </div>
    );
});

CertificateTemplate.displayName = 'CertificateTemplate';

export default CertificateTemplate;
