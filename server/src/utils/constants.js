// Risk thresholds
const RISK_THRESHOLDS = {
    HIGH: 70,
    MEDIUM: 30,
    LOW: 0
};

// Risk levels
const RISK_LEVELS = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

// User roles
const USER_ROLES = {
    FREE: 'free',
    PRO: 'pro',
    ADMIN: 'admin'
};

// Analysis status
const ANALYSIS_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Action types for logging
const ACTION_TYPES = {
    ANALYSIS_STARTED: 'analysis_started',
    ANALYSIS_COMPLETED: 'analysis_completed',
    ANALYSIS_FAILED: 'analysis_failed',
    REPO_ADDED: 'repo_added',
    REPO_REMOVED: 'repo_removed',
    GITHUB_TOKEN_UPDATED: 'github_token_updated',
    LOGIN: 'login',
    LOGOUT: 'logout',
    SETTINGS_UPDATED: 'settings_updated'
};

// Dependency types
const DEPENDENCY_TYPES = {
    DEPENDENCIES: 'dependencies',
    DEV_DEPENDENCIES: 'devDependencies',
    PEER_DEPENDENCIES: 'peerDependencies',
    OPTIONAL_DEPENDENCIES: 'optionalDependencies'
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
    GITHUB_REPO: 3600,      // 1 hour
    GITHUB_TREE: 1800,      // 30 minutes
    GITHUB_FILE: 3600,      // 1 hour
    PACKAGE_META: 86400,    // 24 hours
    PACKAGE_DOCS: 604800,   // 7 days
    ANALYSIS_RESULT: 2592000 // 30 days
};

// Rate limits
const RATE_LIMITS = {
    FREE: {
        analysesPerMonth: 50,
        requestsPerHour: 100
    },
    PRO: {
        analysesPerMonth: 500,
        requestsPerHour: 500
    },
    ADMIN: {
        analysesPerMonth: 10000,
        requestsPerHour: 5000
    }
};

// GitHub API endpoints
const GITHUB_API = {
    BASE_URL: 'https://api.github.com',
    REPO: (owner, repo) => `/repos/${owner}/${repo}`,
    CONTENTS: (owner, repo, path) => `/repos/${owner}/${repo}/contents/${path}`,
    TREE: (owner, repo, branch) => `/repos/${owner}/${repo}/git/trees/${branch}`,
    RELEASES: (owner, repo) => `/repos/${owner}/${repo}/releases`
};

// NPM API endpoints
const NPM_API = {
    REGISTRY: (packageName) => `https://registry.npmjs.org/${packageName}`,
    DOWNLOADS: (packageName, period) => `https://api.npmjs.org/downloads/point/${period}/${packageName}`,
    SEARCH: (query, size) => `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`
};

// Ignored folders for scanning
const IGNORED_FOLDERS = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.nuxt',
    '.cache',
    '__pycache__',
    'venv',
    'env',
    'vendor',
    'bower_components'
]);

module.exports = {
    RISK_THRESHOLDS,
    RISK_LEVELS,
    USER_ROLES,
    ANALYSIS_STATUS,
    ACTION_TYPES,
    DEPENDENCY_TYPES,
    CACHE_TTL,
    RATE_LIMITS,
    GITHUB_API,
    NPM_API,
    IGNORED_FOLDERS
};