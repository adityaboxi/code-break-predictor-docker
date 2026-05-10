/**
 * Validate repository URL
 */
const validateRepoUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'Repository URL is required' };
    }
    
    const githubPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/;
    if (!githubPattern.test(url)) {
        return { valid: false, error: 'Invalid GitHub repository URL' };
    }
    
    return { valid: true };
};

/**
 * Validate prediction date
 */
const validatePredictionDate = (date) => {
    if (!date) {
        return { valid: false, error: 'Prediction date is required' };
    }
    
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return { valid: false, error: 'Invalid date format' };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (parsedDate < today) {
        return { valid: false, error: 'Prediction date must be in the future' };
    }
    
    // Max 5 years into future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 5);
    if (parsedDate > maxDate) {
        return { valid: false, error: 'Prediction date cannot be more than 5 years in the future' };
    }
    
    return { valid: true, date: parsedDate };
};

/**
 * Validate email
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    
    if (email.length > 255) {
        return { valid: false, error: 'Email too long' };
    }
    
    return { valid: true };
};

/**
 * Validate username
 */
const validateUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }
    
    if (username.length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }
    
    if (username.length > 30) {
        return { valid: false, error: 'Username cannot exceed 30 characters' };
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { valid: true };
};

/**
 * Validate password
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }
    
    if (password.length > 100) {
        return { valid: false, error: 'Password too long' };
    }
    
    return { valid: true };
};

/**
 * Validate GitHub token (basic check)
 */
const validateGithubToken = (token) => {
    if (!token) return { valid: true }; // Token is optional
    
    if (typeof token !== 'string') {
        return { valid: false, error: 'Invalid token format' };
    }
    
    // GitHub tokens typically start with 'github_pat_' or 'ghp_'
    if (!token.startsWith('github_') && !token.startsWith('ghp_')) {
        return { valid: false, error: 'Invalid GitHub token format' };
    }
    
    return { valid: true };
};

module.exports = {
    validateRepoUrl,
    validatePredictionDate,
    validateEmail,
    validateUsername,
    validatePassword,
    validateGithubToken
};