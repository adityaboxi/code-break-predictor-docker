const axios = require('axios');
const PackageCache = require('../models/PackageCache.js');

// Helper: delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: retry with exponential backoff on rate limits
async function fetchWithRetry(url, options = {}, retries = 3, baseDelay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, options);
            return response;
        } catch (error) {
            const isRateLimit = error.response?.status === 429 || error.response?.status === 403;
            if (isRateLimit && i < retries - 1) {
                const waitTime = baseDelay * Math.pow(2, i);
                console.log(`⏳ Rate limited for ${url}, retrying in ${waitTime}ms...`);
                await delay(waitTime);
                continue;
            }
            throw error;
        }
    }
    throw new Error(`Max retries exceeded for ${url}`);
}

class PackageDocService {
    async getPackageInfo(packageName) {
        let cached = await PackageCache.findOne({ packageName });
        
        if (cached && cached.expiresAt > new Date()) {
            console.log(`📦 Cache hit for ${packageName}`);
            return cached;
        }
        
        console.log(`📡 Fetching fresh data for ${packageName}`);
        
        try {
            // 1. Fetch npm registry data with retry
            const npmResponse = await fetchWithRetry(`https://registry.npmjs.org/${packageName}`, {
                timeout: 10000,
                headers: { 'User-Agent': 'CodeBreakPredictor/1.0' }
            });
            await delay(300); // Short delay to avoid burst
            
            const data = npmResponse.data;
            const latestVersion = data['dist-tags']?.latest;
            const versionData = data.versions?.[latestVersion];
            
            // 2. Fetch download stats (optional, non-critical)
            let downloadStats = { lastDay: 0, lastWeek: 0, lastMonth: 0 };
            try {
                const downloadResponse = await fetchWithRetry(
                    `https://api.npmjs.org/downloads/point/last-month/${packageName}`,
                    { timeout: 5000 },
                    2,
                    500
                );
                downloadStats = {
                    lastDay: downloadResponse.data.downloads || 0,
                    lastWeek: downloadResponse.data.downloads || 0,
                    lastMonth: downloadResponse.data.downloads || 0
                };
                await delay(200);
            } catch (err) {
                console.log(`⚠️ Download stats unavailable for ${packageName}`);
            }
            
            // 3. Extract GitHub repo from package metadata
            let githubRepo = null;
            if (versionData?.repository) {
                const repoUrl = versionData.repository.url || versionData.repository;
                const match = repoUrl.match(/github\.com\/([^\/]+\/[^\/]+)/);
                if (match) {
                    githubRepo = match[1];
                }
            }
            
            // 4. Fetch breaking changes from GitHub releases (only if we have a repo)
            let breakingChanges = [];
            let migrationGuides = [];
            if (githubRepo) {
                try {
                    const releasesResponse = await fetchWithRetry(
                        `https://api.github.com/repos/${githubRepo}/releases`,
                        { 
                            timeout: 8000,
                            headers: { 'User-Agent': 'CodeBreakPredictor/1.0' }
                        },
                        2,
                        1000
                    );
                    await delay(300);
                    
                    for (const release of releasesResponse.data) {
                        if (release.body) {
                            if (release.body.toLowerCase().includes('breaking')) {
                                breakingChanges.push({
                                    version: release.tag_name,
                                    date: release.created_at,
                                    notes: release.body.substring(0, 500)
                                });
                            }
                            if (release.body.toLowerCase().includes('migration') || 
                                release.body.toLowerCase().includes('upgrade guide')) {
                                migrationGuides.push({
                                    fromVersion: release.tag_name,
                                    url: release.html_url
                                });
                            }
                        }
                    }
                } catch (err) {
                    console.log(`⚠️ GitHub releases unavailable for ${githubRepo}`);
                }
            }
            
            // 5. Build cache document
            const cacheDoc = {
                packageName,
                latestVersion,
                allVersions: Object.keys(data.versions || {}),
                metadata: {
                    description: versionData?.description || '',
                    homepage: versionData?.homepage || '',
                    repository: versionData?.repository || {},
                    keywords: versionData?.keywords || [],
                    author: versionData?.author?.name || '',
                    license: versionData?.license || ''
                },
                maintainers: data.maintainers || [],
                downloadStats,
                deprecationInfo: {
                    isDeprecated: !!versionData?.deprecated,
                    message: versionData?.deprecated || '',
                    alternative: null
                },
                timeSeries: {
                    created: data.time?.created,
                    modified: data.time?.modified,
                    versions: data.time
                },
                documentation: {
                    url: versionData?.homepage || `https://www.npmjs.com/package/${packageName}`,
                    breakingChanges,
                    migrationGuides,
                    lastFetched: new Date()
                },
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                fetchCount: (cached?.fetchCount || 0) + 1
            };
            
            const result = await PackageCache.findOneAndUpdate(
                { packageName },
                cacheDoc,
                { upsert: true, new: true }
            );
            
            console.log(`✅ Cached ${packageName} (v${latestVersion})`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error fetching package ${packageName}:`, error.message);
            
            if (cached) {
                console.log(`⚠️ Using expired cache for ${packageName}`);
                return cached;
            }
            
            // Return minimal info to avoid crashes
            return {
                packageName,
                latestVersion: 'unknown',
                metadata: {},
                downloadStats: { lastDay: 0, lastWeek: 0, lastMonth: 0 },
                deprecationInfo: { isDeprecated: false },
                documentation: { breakingChanges: [], migrationGuides: [] }
            };
        }
    }
    
    async getDocumentationUrl(packageName) {
        const info = await this.getPackageInfo(packageName);
        return info.documentation?.url || `https://www.npmjs.com/package/${packageName}`;
    }
    
    async hasBreakingChanges(packageName, fromVersion, toVersion) {
        const info = await this.getPackageInfo(packageName);
        const breakingVersions = info.documentation?.breakingChanges || [];
        const fromMajor = parseInt(fromVersion?.match(/^\d+/)?.[0]) || 0;
        
        return breakingVersions.some(bc => {
            const bcMajor = parseInt(bc.version?.match(/^\d+/)?.[0]) || 0;
            return bcMajor > fromMajor;
        });
    }
}

module.exports = PackageDocService;