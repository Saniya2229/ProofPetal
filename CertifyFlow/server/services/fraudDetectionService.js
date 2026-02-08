const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const FraudAlert = require('../models/FraudAlert');

/**
 * Fraud Detection Service
 * Implements intelligent rule-based fraud detection
 */

// Configuration - Detection thresholds
const CONFIG = {
    velocity: {
        timeWindowMinutes: 5,
        mediumThreshold: 5,   // 5+ verifications in 5 min = Medium risk
        highThreshold: 15     // 15+ verifications in 5 min = High risk
    },
    location: {
        timeWindowHours: 1,
        mediumThreshold: 3,   // 3+ unique IPs in 1 hour = Medium
        highThreshold: 5      // 5+ unique IPs in 1 hour = High
    },
    cooldownMinutes: 5  // Minimum time between alerts for same certificate
};

/**
 * Main entry point - Analyze a verification attempt for fraud
 * @param {string} certificateId - The certificate being verified
 * @param {string} clientIp - IP address of the client
 * @returns {Promise<{riskLevel: string, alerts: Array}>}
 */
const analyzeVerification = async (certificateId, clientIp) => {
    try {
        // Get the certificate
        const certificate = await Certificate.findOne({ certificateId });
        if (!certificate) {
            return { riskLevel: 'none', alerts: [] };
        }

        // Update verification tracking
        await Certificate.updateOne(
            { certificateId },
            {
                $inc: { verificationCount: 1 },
                $set: {
                    lastVerifiedAt: new Date(),
                    lastVerificationIp: clientIp
                }
            }
        );

        // Run fraud detection checks
        const [velocityResult, locationResult] = await Promise.all([
            checkVelocity(certificateId),
            checkLocationAnomaly(certificateId, clientIp)
        ]);

        // Calculate combined risk level
        const riskLevel = calculateRiskLevel(velocityResult, locationResult);
        const alerts = [];

        // Check if we should create alerts (respecting cooldown)
        const shouldAlert = await shouldCreateAlert(certificateId);

        if (shouldAlert) {
            // Create velocity alert if needed
            if (velocityResult.risk !== 'none') {
                const alert = await triggerAlert(certificateId, 'velocity', {
                    severity: velocityResult.risk,
                    verificationCount: velocityResult.count,
                    timeWindow: `${CONFIG.velocity.timeWindowMinutes} minutes`,
                    anomalyScore: velocityResult.score,
                    description: `${velocityResult.count} verifications in ${CONFIG.velocity.timeWindowMinutes} minutes`
                });
                if (alert) alerts.push(alert);
            }

            // Create location alert if needed
            if (locationResult.risk !== 'none') {
                const alert = await triggerAlert(certificateId, 'location_anomaly', {
                    severity: locationResult.risk,
                    uniqueIPs: locationResult.uniqueIPs,
                    timeWindow: `${CONFIG.location.timeWindowHours} hour(s)`,
                    anomalyScore: locationResult.score,
                    description: `${locationResult.uniqueIPs.length} unique IPs in ${CONFIG.location.timeWindowHours} hour(s)`
                });
                if (alert) alerts.push(alert);
            }
        }

        // Update certificate risk level if changed
        if (riskLevel !== certificate.riskLevel) {
            await Certificate.updateOne(
                { certificateId },
                {
                    $set: {
                        riskLevel,
                        ...(riskLevel !== 'none' && !certificate.flaggedAt ? { flaggedAt: new Date() } : {})
                    }
                }
            );
        }

        return { riskLevel, alerts };
    } catch (error) {
        console.error('Fraud detection error:', error);
        return { riskLevel: 'none', alerts: [] };
    }
};

/**
 * Check for velocity anomalies (rapid repeated verifications)
 */
const checkVelocity = async (certificateId) => {
    const timeWindow = new Date(Date.now() - CONFIG.velocity.timeWindowMinutes * 60 * 1000);

    const count = await VerificationLog.countDocuments({
        certificateId,
        timestamp: { $gte: timeWindow }
    });

    let risk = 'none';
    let score = 0;

    if (count >= CONFIG.velocity.highThreshold) {
        risk = 'high';
        score = Math.min(100, (count / CONFIG.velocity.highThreshold) * 100);
    } else if (count >= CONFIG.velocity.mediumThreshold) {
        risk = 'medium';
        score = Math.min(70, (count / CONFIG.velocity.mediumThreshold) * 50);
    } else if (count >= CONFIG.velocity.mediumThreshold - 2) {
        risk = 'low';
        score = 25;
    }

    return { risk, count, score };
};

/**
 * Check for location anomalies (verifications from multiple IPs)
 */
const checkLocationAnomaly = async (certificateId, currentIp) => {
    const timeWindow = new Date(Date.now() - CONFIG.location.timeWindowHours * 60 * 60 * 1000);

    // Get unique IPs from recent verifications
    const logs = await VerificationLog.find({
        certificateId,
        timestamp: { $gte: timeWindow }
    }).select('ipAddress');

    const uniqueIPs = [...new Set(logs.map(log => log.ipAddress).filter(ip => ip && ip !== 'unknown'))];

    // Add current IP if not already in list
    if (currentIp && currentIp !== 'unknown' && !uniqueIPs.includes(currentIp)) {
        uniqueIPs.push(currentIp);
    }

    let risk = 'none';
    let score = 0;

    if (uniqueIPs.length >= CONFIG.location.highThreshold) {
        risk = 'high';
        score = Math.min(100, (uniqueIPs.length / CONFIG.location.highThreshold) * 100);
    } else if (uniqueIPs.length >= CONFIG.location.mediumThreshold) {
        risk = 'medium';
        score = Math.min(70, (uniqueIPs.length / CONFIG.location.mediumThreshold) * 50);
    }

    return { risk, uniqueIPs, score };
};

/**
 * Calculate combined risk level from multiple checks
 */
const calculateRiskLevel = (velocityResult, locationResult) => {
    // Highest risk wins
    if (velocityResult.risk === 'high' || locationResult.risk === 'high') {
        return 'high';
    }
    if (velocityResult.risk === 'medium' || locationResult.risk === 'medium') {
        return 'medium';
    }
    if (velocityResult.risk === 'low' || locationResult.risk === 'low') {
        return 'low';
    }
    return 'none';
};

/**
 * Check if we should create a new alert (respecting cooldown period)
 */
const shouldCreateAlert = async (certificateId) => {
    const cooldownTime = new Date(Date.now() - CONFIG.cooldownMinutes * 60 * 1000);

    const recentAlert = await FraudAlert.findOne({
        certificateId,
        triggeredAt: { $gte: cooldownTime }
    });

    return !recentAlert;
};

/**
 * Create a fraud alert
 */
const triggerAlert = async (certificateId, alertType, details) => {
    try {
        const alert = await FraudAlert.create({
            certificateId,
            alertType,
            severity: details.severity,
            details: {
                verificationCount: details.verificationCount || 0,
                uniqueIPs: details.uniqueIPs || [],
                timeWindow: details.timeWindow || '',
                anomalyScore: details.anomalyScore || 0,
                description: details.description || ''
            },
            triggeredAt: new Date()
        });

        return alert;
    } catch (error) {
        console.error('Error creating fraud alert:', error);
        return null;
    }
};

/**
 * Get fraud statistics for dashboard
 */
const getFraudStatistics = async () => {
    const [alertStats, highRiskCerts, pendingAlerts] = await Promise.all([
        FraudAlert.getStats(),
        Certificate.countDocuments({ riskLevel: { $in: ['medium', 'high'] } }),
        FraudAlert.find({ status: 'pending' })
            .sort({ severity: -1, triggeredAt: -1 })
            .limit(10)
            .lean()
    ]);

    return {
        ...alertStats,
        highRiskCertificates: highRiskCerts,
        recentAlerts: pendingAlerts
    };
};

module.exports = {
    analyzeVerification,
    checkVelocity,
    checkLocationAnomaly,
    calculateRiskLevel,
    triggerAlert,
    getFraudStatistics,
    CONFIG
};
