/**
 * Extract major version from version string
 */
const getMajorVersion = (version) => {
    if (!version || typeof version !== 'string') return 0;
    const match = version.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

/**
 * Compare two versions (returns true if v1 > v2)
 */
const isVersionGreater = (v1, v2) => {
    const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(Number);
    const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const num1 = parts1[i] || 0;
        const num2 = parts2[i] || 0;
        if (num1 > num2) return true;
        if (num1 < num2) return false;
    }
    return false;
};

/**
 * Calculate months between two dates
 */
const monthsBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

/**
 * Calculate years between two dates
 */
const yearsBetween = (date1, date2) => {
    return monthsBetween(date1, date2) / 12;
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
};

/**
 * Calculate risk level from percentage
 */
const getRiskLevel = (percentage) => {
    if (percentage > 70) return 'high';
    if (percentage > 30) return 'medium';
    return 'low';
};

/**
 * Get risk color for UI
 */
const getRiskColor = (percentage) => {
    if (percentage > 70) return 'red';
    if (percentage > 30) return 'yellow';
    return 'green';
};

/**
 * Get risk emoji
 */
const getRiskEmoji = (percentage) => {
    if (percentage > 70) return '🔴';
    if (percentage > 30) return '🟡';
    return '🟢';
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
};

/**
 * Chunk array into smaller arrays
 */
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Remove duplicates from array
 */
const unique = (array, key = null) => {
    if (!key) return [...new Set(array)];
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate GitHub URL
 */
const isValidGitHubUrl = (url) => {
    const githubPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/;
    return githubPattern.test(url);
};

/**
 * Extract package name from version range
 */
const extractPackageName = (depString) => {
    // Handle scoped packages
    if (depString.startsWith('@')) {
        const match = depString.match(/^@[^\/]+\/[^@]+/);
        return match ? match[0] : depString;
    }
    // Handle regular packages
    const match = depString.match(/^[^@]+/);
    return match ? match[0] : depString;
};

/**
 * Sanitize package version
 */
const sanitizeVersion = (version) => {
    if (!version || typeof version !== 'string') return 'unknown';
    // Remove version prefixes
    return version.replace(/^[~^>=<*]/, '').trim();
};

module.exports = {
    getMajorVersion,
    isVersionGreater,
    monthsBetween,
    yearsBetween,
    formatDate,
    getRiskLevel,
    getRiskColor,
    getRiskEmoji,
    sleep,
    retry,
    chunkArray,
    unique,
    isValidEmail,
    isValidGitHubUrl,
    extractPackageName,
    sanitizeVersion
};