const GitHubService = require('./githubService.js');
const DependencyExtractor = require('./dependencyExtractor.js');
const LanguageDetector = require('./languageDetector.js');

class RecursiveScanner {
    constructor(githubToken) {
        this.githubService = new GitHubService(githubToken);
    }

    async scanRepository(repoUrl, branch = 'main') {
        const { owner, repo, detectedBranch } = this.parseGitHubUrl(repoUrl);
        const finalBranch = branch || detectedBranch || 'main';
        console.log(`🔍 Scanning: ${owner}/${repo} (${finalBranch})`);

        try {
            const tree = await this.githubService.getRepositoryTree(owner, repo, finalBranch, true);
            const files = tree.tree || [];
            
            // DEBUG: Log files count and sample
            console.log(`📄 Total files in repo: ${files.length}`);
            console.log(`📄 Sample files: ${files.slice(0, 10).map(f => f.path).join(', ')}`);
            
            const filePaths = files.map(f => f.path);
            
            // Detect languages
            const detectedLanguages = LanguageDetector.detectLanguages(filePaths);
            console.log(`🏷️  Languages detected: ${detectedLanguages.join(', ') || 'none'}`);

            // Find manifest files for each language
            const manifestFileMap = new Map(); // path -> ecosystem
            for (const lang of LanguageDetector.languagePatterns) {
                const manifests = Array.isArray(lang.manifest) ? lang.manifest : [lang.manifest];
                for (const pattern of manifests) {
                    const matched = filePaths.filter(p => {
                        if (pattern.includes('*')) {
                            const regex = new RegExp(pattern.replace('*', '.*'));
                            return regex.test(p);
                        }
                        return p.endsWith(pattern);
                    });
                    for (const m of matched) {
                        manifestFileMap.set(m, lang.ecosystem);
                    }
                }
            }

            const dependencies = [];
            const manifestDetails = [];
            for (const [manifestPath, ecosystem] of manifestFileMap) {
                try {
                    const fileContent = await this.githubService.getFileContent(owner, repo, manifestPath, finalBranch);
                    if (fileContent && fileContent.content) {
                        const deps = DependencyExtractor.extract(fileContent.content, manifestPath);
                        for (const dep of deps) {
                            dependencies.push({
                                ...dep,
                                ecosystem,
                                manifestPath
                            });
                        }
                        manifestDetails.push({ path: manifestPath, ecosystem, depCount: deps.length });
                        console.log(`   📄 ${manifestPath} (${ecosystem}): ${deps.length} deps`);
                    }
                } catch (err) {
                    console.log(`   ⚠️ Failed to read ${manifestPath}:`, err.message);
                }
            }

            // Group dependencies by ecosystem for summary
            const ecosystemSummary = {};
            for (const dep of dependencies) {
                ecosystemSummary[dep.ecosystem] = (ecosystemSummary[dep.ecosystem] || 0) + 1;
            }

            return {
                owner,
                repo,
                branch: finalBranch,
                languages: detectedLanguages,
                manifestFiles: manifestDetails,
                dependencies,
                totalDependencies: dependencies.length,
                ecosystemSummary
            };
        } catch (error) {
            console.error('Scan error:', error.message);
            throw error;
        }
    }

    parseGitHubUrl(url) {
        const patterns = [
            /github\.com\/([^\/]+)\/([^\/]+)/,
            /github\.com\/([^\/]+)\/([^\/]+)\.git/,
            /github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, ''),
                    detectedBranch: match[3] || 'main'
                };
            }
        }
        throw new Error('Invalid GitHub URL');
    }
}

module.exports = RecursiveScanner;