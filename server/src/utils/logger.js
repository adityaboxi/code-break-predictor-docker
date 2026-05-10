const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || 'info';
const levelValue = LOG_LEVELS[currentLevel.toUpperCase()] || LOG_LEVELS.INFO;

/**
 * Write to log file
 */
const writeToFile = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data })
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${date}.log`);
    
    fs.appendFileSync(logFile, logLine);
};

/**
 * Log error message
 */
const error = (message, data = null) => {
    if (levelValue >= LOG_LEVELS.ERROR) {
        console.error(`❌ ERROR: ${message}`, data || '');
        writeToFile('ERROR', message, data);
    }
};

/**
 * Log warning message
 */
const warn = (message, data = null) => {
    if (levelValue >= LOG_LEVELS.WARN) {
        console.warn(`⚠️ WARN: ${message}`, data || '');
        writeToFile('WARN', message, data);
    }
};

/**
 * Log info message
 */
const info = (message, data = null) => {
    if (levelValue >= LOG_LEVELS.INFO) {
        console.log(`ℹ️ INFO: ${message}`, data || '');
        writeToFile('INFO', message, data);
    }
};

/**
 * Log debug message
 */
const debug = (message, data = null) => {
    if (levelValue >= LOG_LEVELS.DEBUG) {
        console.log(`🐛 DEBUG: ${message}`, data || '');
        writeToFile('DEBUG', message, data);
    }
};

/**
 * Log API request
 */
const logRequest = (req, res, durationMs) => {
    const message = `${req.method} ${req.url} - ${res.statusCode} (${durationMs}ms)`;
    if (res.statusCode >= 500) {
        error(message, { ip: req.ip, userAgent: req.headers['user-agent'] });
    } else if (res.statusCode >= 400) {
        warn(message, { ip: req.ip });
    } else {
        debug(message);
    }
};

module.exports = {
    error,
    warn,
    info,
    debug,
    logRequest
};