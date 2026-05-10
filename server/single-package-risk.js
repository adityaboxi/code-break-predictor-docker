#!/usr/bin/env node

const axios = require('axios');

/**
 * Calculate break probability for a single npm package.
 * @param {string} packageName - e.g., 'express'
 * @param {string} currentVersion - e.g., '4.18.2'
 * @param {Date|string} futureDate - JavaScript Date or ISO string (e.g., '2026-12-31')
 * @returns {Promise<Object>} { percentage, level, reasons, deprecated, latestVersion }
 */
async function calculatePackageRisk(packageName, currentVersion, futureDate) {
    // Normalise future date
    const future = futureDate instanceof Date ? futureDate : new Date(futureDate);
    if (isNaN(future.getTime())) throw new Error('Invalid future date');

    // 1. Fetch package metadata from npm registry
    let npmData;
    try {
        const res = await axios.get(`https://registry.npmjs.org/${packageName}`, {
            timeout: 10000,
            headers: { 'User-Agent': 'SinglePackageRisk/1.0' }
        });
        npmData = res.data;
    } catch (err) {
        throw new Error(`Failed to fetch package data: ${err.message}`);
    }

    const latestVersion = npmData['dist-tags']?.latest;
    const timeData = npmData.time || {};
    const lastPublishDate = timeData[latestVersion];
    const versionData = npmData.versions?.[latestVersion];
    const isDeprecated = !!versionData?.deprecated;

    let risk = 0;
    const reasons = [];

    // 2. Deprecation
    if (isDeprecated) {
        risk += 40;
        reasons.push('⚠️ Package is deprecated by maintainer');
    }

    // 3. Staleness (time since last publish)
    if (lastPublishDate) {
        const monthsSince = (Date.now() - new Date(lastPublishDate)) / (1000 * 60 * 60 * 24 * 30);
        if (monthsSince > 24) {
            risk += 30;
            reasons.push(`📅 No update in ${Math.round(monthsSince / 12)} years`);
        } else if (monthsSince > 12) {
            risk += 20;
            reasons.push(`📅 No update in 1+ years`);
        } else if (monthsSince > 6) {
            risk += 10;
            reasons.push(`📅 Last update ${Math.round(monthsSince)} months ago`);
        } else {
            reasons.push(`✅ Recently updated (${Math.round(monthsSince)} months ago)`);
        }
    }

    // 4. Version gap (major versions behind)
    if (latestVersion && currentVersion) {
        const currentMajor = parseInt(currentVersion.match(/^\d+/)?.[0]) || 0;
        const latestMajor = parseInt(latestVersion.match(/^\d+/)?.[0]) || 0;
        if (latestMajor > currentMajor) {
            const gap = latestMajor - currentMajor;
            const added = Math.min(gap * 10, 35);
            risk += added;
            reasons.push(`📦 Behind by ${gap} major version(s) (${currentVersion} → ${latestVersion})`);
        } else if (currentVersion !== latestVersion) {
            reasons.push(`✅ On latest major version, minor updates available`);
        } else {
            reasons.push(`✅ Up to date`);
        }
    }

    // 5. Future date multiplier
    const yearsToFuture = Math.max(0, (future - Date.now()) / (1000 * 60 * 60 * 24 * 365));
    const multiplier = 1 + Math.min(yearsToFuture * 0.15, 0.3);
    const originalRisk = risk;
    risk = risk * multiplier;

    if (yearsToFuture > 0) {
        reasons.push(`⏰ ${yearsToFuture.toFixed(1)} years from now → +${Math.round((multiplier - 1) * 100)}% risk multiplier`);
    }

    // 6. Minimum risk floor for distant future
    if (risk === 0 && yearsToFuture > 0.5) risk = 5;

    const finalRisk = Math.min(Math.round(risk), 100);
    const riskLevel = finalRisk > 70 ? 'high' : finalRisk > 30 ? 'medium' : 'low';

    return {
        percentage: finalRisk,
        level: riskLevel,
        reasons,
        deprecated: isDeprecated,
        latestVersion: latestVersion || 'unknown'
    };
}

// === CLI usage ===
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error(`
Usage: node single-package-risk.js <package-name> <current-version> <future-date>

Example:
  node single-package-risk.js express 4.18.2 2026-12-31
  node single-package-risk.js react 18.2.0 "2027-06-01"
`);
        process.exit(1);
    }

    const [pkgName, currentVer, dateStr] = args;
    calculatePackageRisk(pkgName, currentVer, dateStr)
        .then(result => {
            console.log(`\n📦 Package: ${pkgName} (current ${currentVer})`);
            console.log(`📅 Prediction date: ${dateStr}`);
            console.log(`⚠️ Deprecated: ${result.deprecated ? 'Yes' : 'No'}`);
            console.log(`🔮 Latest version: ${result.latestVersion}`);
            console.log(`🎯 Break probability: ${result.percentage}% (${result.level} risk)`);
            console.log(`\n📋 Reasons:`);
            result.reasons.forEach(r => console.log(`   ${r}`));
        })
        .catch(err => {
            console.error('❌ Error:', err.message);
            process.exit(1);
        });
}

module.exports = { calculatePackageRisk };