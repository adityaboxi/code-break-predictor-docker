const axios = require('axios');

class EcosystemApis {
    // npm registry
    static async getNpmInfo(packageName) {
        try {
            const response = await axios.get(`https://registry.npmjs.org/${packageName}`, { timeout: 5000 });
            const data = response.data;
            const latestVersion = data['dist-tags']?.latest;
            const lastPublishDate = data.time?.[latestVersion];
            const deprecated = !!data.versions?.[latestVersion]?.deprecated;
            return { latestVersion, lastPublishDate, deprecated };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // PyPI (Python)
    static async getPyPiInfo(packageName) {
        try {
            const response = await axios.get(`https://pypi.org/pypi/${packageName}/json`, { timeout: 5000 });
            const data = response.data;
            const latestVersion = data.info.version;
            const lastPublishDate = data.releases?.[latestVersion]?.[0]?.upload_time;
            // PyPI doesn't have a formal deprecation flag
            const deprecated = false;
            return { latestVersion, lastPublishDate, deprecated };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // Maven Central (Java/Kotlin)
    static async getMavenInfo(groupId, artifactId) {
        try {
            const url = `https://search.maven.org/solrsearch/select?q=g:${groupId}+AND+a:${artifactId}&rows=1&wt=json`;
            const response = await axios.get(url, { timeout: 5000 });
            const docs = response.data?.response?.docs;
            if (docs && docs.length > 0) {
                const latestVersion = docs[0].latestVersion;
                const lastPublishDate = docs[0].timestamp;
                return { latestVersion, lastPublishDate, deprecated: false };
            }
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // Go modules
    static async getGoInfo(packageName) {
        try {
            // Use go proxy to list versions
            const url = `https://proxy.golang.org/${packageName}/@v/list`;
            const response = await axios.get(url, { timeout: 5000 });
            const versions = response.data.split('\n').filter(v => v);
            const latestVersion = versions[versions.length - 1];
            // Go doesn't have deprecation flags in proxy
            return { latestVersion, lastPublishDate: null, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // Crates.io (Rust)
    static async getCratesInfo(packageName) {
        try {
            const response = await axios.get(`https://crates.io/api/v1/crates/${packageName}`, { timeout: 5000 });
            const crate = response.data?.crate;
            const latestVersion = crate?.max_version;
            const lastPublishDate = crate?.updated_at;
            // No deprecation flag in crates.io API
            return { latestVersion, lastPublishDate, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // Packagist (PHP)
    static async getPackagistInfo(packageName) {
        try {
            const response = await axios.get(`https://repo.packagist.org/p2/${packageName}.json`, { timeout: 5000 });
            const packages = response.data?.packages || {};
            const versions = Object.keys(packages).sort();
            const latestVersion = versions[versions.length - 1];
            // No deprecation flag
            return { latestVersion, lastPublishDate: null, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // Rubygems
    static async getRubyGemsInfo(packageName) {
        try {
            const response = await axios.get(`https://rubygems.org/api/v1/gems/${packageName}.json`, { timeout: 5000 });
            const data = response.data;
            const latestVersion = data.version;
            const lastPublishDate = data.updated_at;
            return { latestVersion, lastPublishDate, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }

    // NuGet (.NET)
    static async getNuGetInfo(packageName) {
        try {
            const response = await axios.get(`https://api.nuget.org/v3/registration5-semver1/${packageName.toLowerCase()}/index.json`, { timeout: 5000 });
            const items = response.data?.items;
            if (items && items.length > 0) {
                const latest = items[items.length - 1];
                const latestVersion = latest?.upper;
                return { latestVersion, lastPublishDate: null, deprecated: false };
            }
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        } catch (error) {
            return { latestVersion: 'unknown', lastPublishDate: null, deprecated: false };
        }
    }
}

module.exports = EcosystemApis;
