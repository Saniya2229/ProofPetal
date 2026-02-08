/**
 * Insights Service
 * Generates AI-powered analytics insights from verification data and certificate records
 */

const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');

/**
 * Get the most verified certificates
 * @param {number} limit - Number of top certificates to return
 * @param {number} days - Time window in days
 * @returns {Array} - Array of insight objects
 */
const getMostVerifiedCertificates = async (limit = 5, days = 7) => {
    const insights = [];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    try {
        // Aggregate verification logs to find most verified certificates
        const topVerified = await VerificationLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: since },
                    result: 'valid'
                }
            },
            {
                $group: {
                    _id: '$certificateId',
                    verificationCount: { $sum: 1 },
                    lastVerified: { $max: '$timestamp' }
                }
            },
            {
                $sort: { verificationCount: -1 }
            },
            {
                $limit: limit
            }
        ]);

        if (topVerified.length > 0) {
            // Get certificate details for the top verified
            const certIds = topVerified.map(v => v._id);
            const certificates = await Certificate.find({ certificateId: { $in: certIds } })
                .select('certificateId studentName internshipDomain')
                .lean();

            const certMap = {};
            certificates.forEach(c => { certMap[c.certificateId] = c; });

            // Create insight for top verified
            const topCert = topVerified[0];
            const topCertDetails = certMap[topCert._id];

            if (topCertDetails && topCert.verificationCount > 5) {
                insights.push({
                    id: `most_verified_${Date.now()}`,
                    type: 'most_verified',
                    priority: 'info',
                    icon: 'Trophy',
                    title: 'Most Verified Certificate',
                    message: `${topCertDetails.studentName}'s certificate (${topCert._id}) was verified ${topCert.verificationCount} times this week`,
                    data: {
                        certificateId: topCert._id,
                        studentName: topCertDetails.studentName,
                        verificationCount: topCert.verificationCount,
                        domain: topCertDetails.internshipDomain
                    }
                });
            }

            // If multiple certificates have high verification counts
            const highVerified = topVerified.filter(v => v.verificationCount >= 10);
            if (highVerified.length > 1) {
                insights.push({
                    id: `high_demand_${Date.now()}`,
                    type: 'high_demand',
                    priority: 'success',
                    icon: 'TrendingUp',
                    title: 'High Verification Demand',
                    message: `${highVerified.length} certificates have been verified 10+ times this week`,
                    data: {
                        count: highVerified.length,
                        certificates: highVerified.map(v => v._id)
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error in getMostVerifiedCertificates:', error);
    }

    return insights;
};

/**
 * Detect unusual verification activity patterns
 * @returns {Array} - Array of insight objects
 */
const detectUnusualActivity = async () => {
    const insights = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);

    try {
        // Check for IP addresses with high verification counts
        const suspiciousIPs = await VerificationLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: last24Hours },
                    ipAddress: { $ne: 'unknown' }
                }
            },
            {
                $group: {
                    _id: '$ipAddress',
                    count: { $sum: 1 },
                    certificates: { $addToSet: '$certificateId' }
                }
            },
            {
                $match: {
                    count: { $gte: 20 } // More than 20 verifications from same IP
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        suspiciousIPs.forEach(ip => {
            insights.push({
                id: `suspicious_ip_${ip._id}_${Date.now()}`,
                type: 'unusual_activity',
                priority: 'warning',
                icon: 'AlertTriangle',
                title: 'Unusual Verification Pattern',
                message: `IP ${ip._id.substring(0, 12)}... made ${ip.count} verification requests for ${ip.certificates.length} certificates`,
                data: {
                    ipAddress: ip._id,
                    requestCount: ip.count,
                    uniqueCertificates: ip.certificates.length
                }
            });
        });

        // Check for verification spikes in the last hour
        const recentCount = await VerificationLog.countDocuments({
            timestamp: { $gte: lastHour }
        });

        // Get average hourly rate over past 24 hours
        const totalLast24 = await VerificationLog.countDocuments({
            timestamp: { $gte: last24Hours }
        });
        const avgHourly = totalLast24 / 24;

        if (recentCount > avgHourly * 3 && recentCount > 10) {
            insights.push({
                id: `spike_${Date.now()}`,
                type: 'activity_spike',
                priority: 'warning',
                icon: 'Zap',
                title: 'Verification Spike Detected',
                message: `${recentCount} verifications in the last hour (${Math.round((recentCount / avgHourly - 1) * 100)}% above average)`,
                data: {
                    recentCount,
                    averageHourly: Math.round(avgHourly),
                    percentIncrease: Math.round((recentCount / avgHourly - 1) * 100)
                }
            });
        }

        // Check for failed verification attempts
        const invalidAttempts = await VerificationLog.countDocuments({
            timestamp: { $gte: last24Hours },
            result: 'invalid'
        });

        if (invalidAttempts > 10) {
            insights.push({
                id: `invalid_attempts_${Date.now()}`,
                type: 'invalid_attempts',
                priority: 'warning',
                icon: 'XCircle',
                title: 'Invalid Verification Attempts',
                message: `${invalidAttempts} attempts to verify non-existent certificates in the last 24 hours`,
                data: {
                    count: invalidAttempts
                }
            });
        }
    } catch (error) {
        console.error('Error in detectUnusualActivity:', error);
    }

    return insights;
};

/**
 * Get certificates nearing expiry
 * @param {number} daysAhead - How many days ahead to check
 * @returns {Array} - Array of insight objects
 */
const getCertificatesNearingExpiry = async (daysAhead = 30) => {
    const insights = [];
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    try {
        // Find certificates that end within the next X days
        const expiringCerts = await Certificate.find({
            status: 'active',
            endDate: {
                $gte: now,
                $lte: futureDate
            }
        })
            .select('certificateId studentName endDate internshipDomain')
            .sort({ endDate: 1 })
            .limit(10)
            .lean();

        if (expiringCerts.length > 0) {
            // Group by urgency
            const urgentCount = expiringCerts.filter(c => {
                const daysToExpiry = Math.ceil((new Date(c.endDate) - now) / (24 * 60 * 60 * 1000));
                return daysToExpiry <= 7;
            }).length;

            if (urgentCount > 0) {
                insights.push({
                    id: `urgent_expiry_${Date.now()}`,
                    type: 'expiring_soon',
                    priority: 'urgent',
                    icon: 'Clock',
                    title: 'Certificates Expiring Soon',
                    message: `${urgentCount} certificate${urgentCount !== 1 ? 's' : ''} will expire in the next 7 days`,
                    data: {
                        count: urgentCount,
                        certificates: expiringCerts.slice(0, 3).map(c => ({
                            id: c.certificateId,
                            name: c.studentName,
                            expiryDate: c.endDate
                        }))
                    }
                });
            }

            if (expiringCerts.length > urgentCount) {
                const nonUrgentCount = expiringCerts.length - urgentCount;
                insights.push({
                    id: `upcoming_expiry_${Date.now()}`,
                    type: 'expiring_upcoming',
                    priority: 'info',
                    icon: 'Calendar',
                    title: 'Upcoming Certificate Expirations',
                    message: `${nonUrgentCount} more certificate${nonUrgentCount !== 1 ? 's' : ''} will expire in the next ${daysAhead} days`,
                    data: {
                        count: nonUrgentCount
                    }
                });
            }
        }

        // Check for already expired certificates that are still active
        const expiredButActive = await Certificate.countDocuments({
            status: 'active',
            endDate: { $lt: now }
        });

        if (expiredButActive > 0) {
            insights.push({
                id: `already_expired_${Date.now()}`,
                type: 'already_expired',
                priority: 'warning',
                icon: 'AlertCircle',
                title: 'Expired Certificates Still Active',
                message: `${expiredButActive} certificate${expiredButActive !== 1 ? 's have' : ' has'} expired but ${expiredButActive !== 1 ? 'are' : 'is'} still marked as active`,
                data: {
                    count: expiredButActive
                }
            });
        }
    } catch (error) {
        console.error('Error in getCertificatesNearingExpiry:', error);
    }

    return insights;
};

/**
 * Generate summary insights about overall system health
 * @returns {Array} - Array of insight objects
 */
const getSystemHealthInsights = async () => {
    const insights = [];

    try {
        const [totalCerts, activeCerts, revokedCerts, totalVerifications] = await Promise.all([
            Certificate.countDocuments(),
            Certificate.countDocuments({ status: 'active' }),
            Certificate.countDocuments({ status: 'revoked' }),
            VerificationLog.countDocuments()
        ]);

        // System is healthy if we have data and low revocation rate
        if (totalCerts > 0) {
            const revocationRate = (revokedCerts / totalCerts * 100).toFixed(1);

            if (revokedCerts === 0) {
                insights.push({
                    id: `all_good_${Date.now()}`,
                    type: 'success',
                    priority: 'success',
                    icon: 'CheckCircle',
                    title: 'All Certificates in Good Standing',
                    message: `All ${activeCerts} certificates are active with no revocations`,
                    data: {
                        activeCerts,
                        totalVerifications
                    }
                });
            } else if (parseFloat(revocationRate) < 5) {
                insights.push({
                    id: `low_revocation_${Date.now()}`,
                    type: 'info',
                    priority: 'info',
                    icon: 'Info',
                    title: 'Low Revocation Rate',
                    message: `Only ${revocationRate}% revocation rate across ${totalCerts} certificates`,
                    data: {
                        revocationRate: parseFloat(revocationRate),
                        totalCerts
                    }
                });
            }
        }

        // Check for new certificates this week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newThisWeek = await Certificate.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        if (newThisWeek > 0) {
            insights.push({
                id: `new_certs_${Date.now()}`,
                type: 'new_certificates',
                priority: 'info',
                icon: 'Plus',
                title: 'New Certificates This Week',
                message: `${newThisWeek} new certificate${newThisWeek !== 1 ? 's were' : ' was'} issued this week`,
                data: {
                    count: newThisWeek
                }
            });
        }
    } catch (error) {
        console.error('Error in getSystemHealthInsights:', error);
    }

    return insights;
};

/**
 * Generate all insights and prioritize them
 * @returns {Object} - Object containing categorized insights
 */
const generateAllInsights = async () => {
    try {
        const [
            mostVerified,
            unusualActivity,
            expiringCerts,
            systemHealth
        ] = await Promise.all([
            getMostVerifiedCertificates(),
            detectUnusualActivity(),
            getCertificatesNearingExpiry(),
            getSystemHealthInsights()
        ]);

        // Combine all insights
        const allInsights = [
            ...unusualActivity,
            ...expiringCerts,
            ...mostVerified,
            ...systemHealth
        ];

        // Sort by priority
        const priorityOrder = { urgent: 0, warning: 1, info: 2, success: 3 };
        allInsights.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] ?? 4;
            const bPriority = priorityOrder[b.priority] ?? 4;
            return aPriority - bPriority;
        });

        // Limit to top 6 most important insights
        const topInsights = allInsights.slice(0, 6);

        return {
            success: true,
            insights: topInsights,
            totalGenerated: allInsights.length,
            generatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error generating insights:', error);
        return {
            success: false,
            insights: [],
            error: 'Failed to generate insights'
        };
    }
};

module.exports = {
    getMostVerifiedCertificates,
    detectUnusualActivity,
    getCertificatesNearingExpiry,
    getSystemHealthInsights,
    generateAllInsights
};
