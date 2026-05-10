const axios = require('axios');
const redisClient = require('../config/redis.js');

class GitHubService {
    constructor(token = null) {
        this.token = token;
        this.headers = token ? {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CodeBreakPredictor/1.0'
        } : {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CodeBreakPredictor/1.0'
        };
    }

    async getRepository(owner, repo) {
        const cacheKey = `github:repo:${owner}:${repo}`;
        
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            // Cache miss or error, continue
        }
        
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${owner}/${repo}`,
                { headers: this.headers, timeout: 10000 }
            );
            
            try {
                await redisClient.set(cacheKey, JSON.stringify(response.data), 'EX', 3600);
            } catch (err) {
                // Cache set failed, continue
            }
            
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Repository not found');
            }
            if (error.response?.status === 401) {
                throw new Error('Invalid GitHub token');
            }
            throw error;
        }
    }

    async getRepositoryTree(owner, repo, branch, recursive = true) {
        const cacheKey = `github:tree:${owner}:${repo}:${branch}:${recursive}`;
        
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            // Cache miss, continue
        }
        
        try {
            const url = recursive
                ? `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
                : `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}`;
            
            const response = await axios.get(url, { headers: this.headers, timeout: 15000 });
            
            try {
                await redisClient.set(cacheKey, JSON.stringify(response.data), 'EX', 1800);
            } catch (err) {
                // Cache set failed
            }
            
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get repository tree: ${error.message}`);
        }
    }

    async getFileContent(owner, repo, path, branch) {
        const cacheKey = `github:file:${owner}:${repo}:${path}:${branch}`;
        
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            // Cache miss
        }
        
        try {
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
            const response = await axios.get(url, { headers: this.headers, timeout: 10000 });
            
            const content = Buffer.from(response.data.content, 'base64').toString();
            const result = {
                path: response.data.path,
                content: path.endsWith('.json') ? JSON.parse(content) : content,
                sha: response.data.sha
            };
            
            try {
                await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
            } catch (err) {
                // Cache set failed
            }
            
            return result;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async findPackageJsonFiles(owner, repo, branch) {
        try {
            const tree = await this.getRepositoryTree(owner, repo, branch, true);
            const files = tree.tree || [];
            
            const packageJsonFiles = files.filter(file => 
                file.path.endsWith('package.json') && 
                !file.path.includes('node_modules') &&
                file.type === 'blob'
            );
            
            console.log(`📦 Found ${packageJsonFiles.length} package.json files`);
            
            const results = [];
            for (const file of packageJsonFiles) {
                const content = await this.getFileContent(owner, repo, file.path, branch);
                if (content && content.content) {
                    results.push({
                        path: file.path,
                        content: content.content
                    });
                }
            }
            
            return results;
        } catch (error) {
            console.error('Error finding package.json files:', error.message);
            return [];
        }
    }
}

module.exports = GitHubService;
