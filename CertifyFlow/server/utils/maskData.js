/**
 * Data Masking Utility
 * Masks sensitive data for public verification responses
 */

/**
 * Mask an email address
 * Example: 'john.doe@example.com' => 'jo***@ex***.com'
 * @param {string} email - The email to mask
 * @returns {string} - Masked email
 */
const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '';

    const parts = email.split('@');
    if (parts.length !== 2) return '***@***.***';

    const [local, domain] = parts;
    const domainParts = domain.split('.');

    // Mask local part: show first 2 chars + ***
    const maskedLocal = local.length > 2
        ? local.substring(0, 2) + '***'
        : local[0] + '***';

    // Mask domain: show first 2 chars of domain name + ***
    const maskedDomain = domainParts.length > 1
        ? (domainParts[0].length > 2
            ? domainParts[0].substring(0, 2) + '***'
            : domainParts[0][0] + '***') + '.' + domainParts[domainParts.length - 1]
        : domain.substring(0, 2) + '***';

    return `${maskedLocal}@${maskedDomain}`;
};

/**
 * Mask a phone number
 * Example: '1234567890' => '******7890'
 * @param {string} phone - The phone number to mask
 * @returns {string} - Masked phone number
 */
const maskPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return '';

    // Remove non-digit characters for processing
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 4) return '***';

    // Show last 4 digits only
    const visibleLength = 4;
    const maskedLength = digits.length - visibleLength;
    const masked = '*'.repeat(maskedLength) + digits.slice(-visibleLength);

    return masked;
};

/**
 * Mask a generic string (partial visibility)
 * Example: 'John Doe' => 'Jo** ***'
 * @param {string} str - String to mask
 * @param {number} visibleChars - Number of visible characters at start
 * @returns {string} - Masked string
 */
const maskString = (str, visibleChars = 2) => {
    if (!str || typeof str !== 'string') return '';

    if (str.length <= visibleChars) return str[0] + '***';

    return str.substring(0, visibleChars) + '***';
};

module.exports = {
    maskEmail,
    maskPhone,
    maskString
};
