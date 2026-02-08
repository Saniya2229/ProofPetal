/**
 * Fuzzy Search Service
 * Provides intelligent string matching using Levenshtein distance algorithm
 * for certificate ID and student name searches.
 */

/**
 * Calculate Levenshtein distance between two strings
 * Uses dynamic programming approach for efficiency
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance (number of operations needed to transform str1 to str2)
 */
const levenshteinDistance = (str1, str2) => {
    // Normalize inputs
    const s1 = (str1 || '').toLowerCase().trim();
    const s2 = (str2 || '').toLowerCase().trim();

    // Quick checks for edge cases
    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    // Create distance matrix
    const matrix = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the matrix using dynamic programming
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       // Deletion
                matrix[i][j - 1] + 1,       // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return matrix[s1.length][s2.length];
};

/**
 * Calculate similarity percentage between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
const calculateSimilarity = (str1, str2) => {
    const s1 = (str1 || '').toLowerCase().trim();
    const s2 = (str2 || '').toLowerCase().trim();

    if (s1 === s2) return 100;
    if (s1.length === 0 || s2.length === 0) return 0;

    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity * 10) / 10; // Round to 1 decimal place
};

/**
 * Check if string contains query (for prefix/partial matching)
 * @param {string} str - String to search in
 * @param {string} query - Query to find
 * @returns {boolean} - True if match found
 */
const containsMatch = (str, query) => {
    const s = (str || '').toLowerCase().trim();
    const q = (query || '').toLowerCase().trim();
    return s.includes(q);
};

/**
 * Find similar certificate IDs from a list
 * Combines exact matching, prefix matching, and fuzzy matching
 * @param {string} query - Search query
 * @param {Array} certificates - Array of certificate objects
 * @param {Object} options - Search options
 * @returns {Array} - Array of matching certificates with similarity scores
 */
const findSimilarCertificates = (query, certificates, options = {}) => {
    const {
        limit = 10,
        minSimilarity = 50,      // Minimum similarity threshold (%)
        searchFields = ['certificateId', 'studentName', 'studentEmail']
    } = options;

    if (!query || query.length < 2) {
        return [];
    }

    const q = query.toLowerCase().trim();
    const results = [];
    const seen = new Set(); // Prevent duplicates

    certificates.forEach(cert => {
        if (seen.has(cert.certificateId)) return;

        let bestMatch = { field: null, similarity: 0, matchType: 'fuzzy' };

        searchFields.forEach(field => {
            const value = cert[field];
            if (!value) return;

            const fieldValue = value.toString().toLowerCase();

            // Check for exact match (100% similarity)
            if (fieldValue === q) {
                if (100 > bestMatch.similarity) {
                    bestMatch = { field, similarity: 100, matchType: 'exact' };
                }
                return;
            }

            // Check for prefix match (starts with query)
            if (fieldValue.startsWith(q)) {
                const prefixSimilarity = 90 + (q.length / fieldValue.length) * 10;
                if (prefixSimilarity > bestMatch.similarity) {
                    bestMatch = { field, similarity: Math.round(prefixSimilarity), matchType: 'prefix' };
                }
                return;
            }

            // Check for contains match
            if (containsMatch(fieldValue, q)) {
                const containsSimilarity = 70 + (q.length / fieldValue.length) * 20;
                if (containsSimilarity > bestMatch.similarity) {
                    bestMatch = { field, similarity: Math.round(containsSimilarity), matchType: 'contains' };
                }
                return;
            }

            // Fuzzy matching using Levenshtein distance
            const similarity = calculateSimilarity(q, fieldValue);
            if (similarity > bestMatch.similarity) {
                bestMatch = { field, similarity, matchType: 'fuzzy' };
            }

            // Also check for partial ID matches (e.g., "2024001" matches "CRT-2024001")
            if (field === 'certificateId') {
                const idParts = fieldValue.split(/[-_]/);
                idParts.forEach(part => {
                    const partSimilarity = calculateSimilarity(q, part);
                    if (partSimilarity > bestMatch.similarity) {
                        bestMatch = { field, similarity: partSimilarity, matchType: 'partial' };
                    }
                });
            }
        });

        // Only include results above threshold
        if (bestMatch.similarity >= minSimilarity) {
            seen.add(cert.certificateId);
            results.push({
                certificate: {
                    certificateId: cert.certificateId,
                    studentName: cert.studentName,
                    studentEmail: cert.studentEmail,
                    internshipDomain: cert.internshipDomain,
                    status: cert.status || (cert.isRevoked ? 'revoked' : 'active')
                },
                matchField: bestMatch.field,
                similarity: bestMatch.similarity,
                matchType: bestMatch.matchType
            });
        }
    });

    // Sort by similarity (descending) and limit results
    return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
};

/**
 * Generate auto-correction suggestions for a query
 * Returns the most likely intended certificate ID
 * @param {string} query - Potentially misspelled query
 * @param {Array} certificateIds - Array of valid certificate IDs
 * @param {number} threshold - Minimum similarity for suggestion (default 70%)
 * @returns {Object|null} - Suggested correction or null
 */
const autoCorrect = (query, certificateIds, threshold = 70) => {
    if (!query || query.length < 3) return null;

    const q = query.toLowerCase().trim();
    let bestMatch = null;

    certificateIds.forEach(id => {
        const similarity = calculateSimilarity(q, id);
        if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
            bestMatch = {
                original: query,
                suggestion: id,
                similarity
            };
        }
    });

    // Only suggest if it's different from the original
    if (bestMatch && bestMatch.suggestion.toLowerCase() !== q) {
        return bestMatch;
    }

    return null;
};

/**
 * Normalize query for search (remove common typos, standardize format)
 * @param {string} query - User input query
 * @returns {string} - Normalized query
 */
const normalizeQuery = (query) => {
    if (!query) return '';

    // Common replacements for certificate ID typos
    let normalized = query.trim()
        .replace(/[oO](?=\d)/g, '0')  // Replace 'O' followed by digit with '0'
        .replace(/[lI](?=\d)/g, '1')  // Replace 'l' or 'I' followed by digit with '1'
        .replace(/\s+/g, '')          // Remove spaces
        .toUpperCase();

    return normalized;
};

module.exports = {
    levenshteinDistance,
    calculateSimilarity,
    findSimilarCertificates,
    autoCorrect,
    normalizeQuery,
    containsMatch
};
