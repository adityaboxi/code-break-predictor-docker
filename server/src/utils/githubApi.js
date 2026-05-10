const axios = require('axios');

/**
 * Parse GitHub URL to extract owner, repo, and branch
 */
const parseGitHubUrl = (url) => {
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
                branch: match[3] || null
            };
        }
    }
    
    throw new Error('Invalid GitHub URL format');
};

/**
 * Check if repository exists and is accessible
 */
const checkRepoExists = async (owner, repo, token = null) => {
    try {
        const headers = token ? {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'CodeBreakPredictor/1.0'
        } : {
            'User-Agent': 'CodeBreakPredictor/1.0'
        };
        
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}`,
            { headers, timeout: 10000 }
        );
        
        return {
            exists: true,
            isPublic: true,
            defaultBranch: response.data.default_branch,
            data: response.data
        };
    } catch (error) {
        if (error.response?.status === 404) {
            return { exists: false, error: 'Repository not found' };
        }
        if (error.response?.status === 401) {
            return { exists: false, error: 'Invalid token or private repo' };
        }
        throw error;
    }
};

/**
 * Get repository file tree recursively
 */
const getRepositoryTree = async (owner, repo, branch, token = null) => {
    const headers = token ? {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeBreakPredictor/1.0'
    } : {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CodeBreakPredictor/1.0'
    };
    
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            { headers, timeout: 15000 }
        );
        return response.data.tree || [];
    } catch (error) {
        throw new Error(`Failed to get repository tree: ${error.message}`);
    }
};

module.exports = {
    parseGitHubUrl,
    checkRepoExists,
    getRepositoryTree
};