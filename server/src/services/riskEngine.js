const EcosystemApis = require('./ecosystemApis.js');

class RiskEngine {
    constructor() {}

    async calculateRisk(packageName, currentVersion, futureDate, ecosystem) {
        try {
            const future = new Date(futureDate);
            if (isNaN(future.getTime())) throw new Error('Invalid date');

            // Fetch package info based on ecosystem
            let packageInfo = null;
            switch (ecosystem) {
                case 'npm':
                    packageInfo = await EcosystemApis.getNpmInfo(packageName);
                    break;
                case 'pypi':
                    packageInfo = await EcosystemApis.getPyPiInfo(packageName);
                    break;
                case 'maven':
                    // For Maven, packageName is "groupId:artifactId"
                    const [groupId, artifactId] = packageName.split(':');
                    packageInfo = await EcosystemApis.getMavenInfo(groupId, artifactId);
                    break;
                case 'go':
                    packageInfo = await EcosystemApis.getGoInfo(packageName);
                    break;
                case 'crates':
                    packageInfo = await EcosystemApis.getCratesInfo(packageName);
                    break;
                case 'packagist':
                    packageInfo = await EcosystemApis.getPackagistInfo(packageName);
                    break;
                case 'rubygems':
                    packageInfo = await EcosystemApis.getRubyGemsInfo(packageName);
                    break;
                case 'nuget':
                    packageInfo = await EcosystemApis.getNuGetInfo(packageName);
                    break;
                default:
                    packageInfo = await EcosystemApis.getNpmInfo(packageName);
            }

            const { latestVersion, lastPublishDate, deprecated } = packageInfo;
            let risk = 0;
            const reasons = [];

            // Deprecation (40% risk)
            if (deprecated) {
                risk += 40;
                reasons.push('⚠️ Package is deprecated');
            }

            // Staleness (based on last publish)
            if (lastPublishDate) {
                const monthsSince = (Date.now() - new Date(lastPublishDate)) / (30 * 24 * 60 * 60 * 1000);
                if (monthsSince > 36) { risk += 30; reasons.push(`📅 No update in ${Math.round(monthsSince/12)} years`); }
                else if (monthsSince > 24) { risk += 20; reasons.push(`📅 No update in 2+ years`); }
                else if (monthsSince > 12) { risk += 15; reasons.push(`📅 No update in 1+ years`); }
                else if (monthsSince > 6) { risk += 5; reasons.push(`📅 Last update ${Math.round(monthsSince)} months ago`); }
                else { reasons.push('✅ Recently updated'); }
            }

            // Version gap
            if (latestVersion && currentVersion && latestVersion !== 'unknown') {
                const currentMajor = parseInt(currentVersion.match(/^\d+/)?.[0]) || 0;
                const latestMajor = parseInt(latestVersion.match(/^\d+/)?.[0]) || 0;
                if (latestMajor > currentMajor) {
                    const gap = latestMajor - currentMajor;
                    risk += Math.min(gap * 10, 35);
                    reasons.push(`📦 Behind by ${gap} major version(s) (${currentVersion} → ${latestVersion})`);
                } else if (currentVersion !== latestVersion) {
                    reasons.push(`✅ Minor updates available (${currentVersion} → ${latestVersion})`);
                } else {
                    reasons.push(`✅ Up to date`);
                }
            }

            // Future multiplier
            const yearsToFuture = Math.max(0, (future - Date.now()) / (365 * 24 * 60 * 60 * 1000));
            const multiplier = 1 + Math.min(yearsToFuture * 0.15, 0.3);
            risk = risk * multiplier;

            // Minimum risk
            if (risk === 0 && yearsToFuture > 0.5) risk = 5;

            const finalRisk = Math.min(Math.round(risk), 100);
            const riskLevel = finalRisk > 70 ? 'high' : finalRisk > 30 ? 'medium' : 'low';

            return {
                riskPercentage: finalRisk,
                riskLevel,
                reasons,
                latestVersion: latestVersion || 'unknown',
                deprecated
            };
        } catch (err) {
            console.error(`Risk error for ${packageName} (${ecosystem}):`, err.message);
            return {
                riskPercentage: 0,
                riskLevel: 'low',
                reasons: ['Error calculating risk'],
                latestVersion: 'unknown',
                deprecated: false
            };
        }
    }
}

module.exports = RiskEngine;
