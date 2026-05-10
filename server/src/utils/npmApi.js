const axios = require('axios');

/**
 * Get package metadata from npm registry
 */
const getPackageMetadata = async (packageName) => {
    try {
        const response = await axios.get(
            `https://registry.npmjs.org/${packageName}`,
            { timeout: 5000 }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

/**
 * Get package download counts
 */
const getPackageDownloads = async (packageName, period = 'last-month') => {
    try {
        const response = await axios.get(
            `https://api.npmjs.org/downloads/point/${period}/${packageName}`,
            { timeout: 5000 }
        );
        return response.data;
    } catch (error) {
        return { downloads: 0, start: null, end: null };
    }
};

/**
 * Get multiple packages download stats
 */
const getMultiplePackagesDownloads = async (packages, period = 'last-month') => {
    const results = {};
    for (const pkg of packages) {
        results[pkg] = await getPackageDownloads(pkg, period);
    }
    return results;
};

/**
 * Search npm packages
 */
const searchNpmPackages = async (query, size = 10) => {
    try {
        const response = await axios.get(
            `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`,
            { timeout: 5000 }
        );
        return response.data.objects || [];
    } catch (error) {
        return [];
    }
};

/**
 * Get package version history
 */
const getPackageVersions = async (packageName) => {
    const metadata = await getPackageMetadata(packageName);
    if (!metadata) return [];
    return Object.keys(metadata.versions || {});
};

module.exports = {
    getPackageMetadata,
    getPackageDownloads,
    getMultiplePackagesDownloads,
    searchNpmPackages,
    getPackageVersions
};