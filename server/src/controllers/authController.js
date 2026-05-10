const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const ActivityLog = require('../models/ActivityLog.js');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create user
        const user = await User.create({
            email,
            username,
            passwordHash: password
        });
        
        const token = generateToken(user._id);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                monthlyAnalysisLimit: user.monthlyAnalysisLimit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        // Log activity
        await ActivityLog.create({
            userId: user._id,
            action: 'login',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        const token = generateToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                monthlyAnalysisLimit: user.monthlyAnalysisLimit,
                analysesThisMonth: user.analysesThisMonth
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        await req.user.resetMonthlyCount();
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                username: req.user.username,
                role: req.user.role,
                monthlyAnalysisLimit: req.user.monthlyAnalysisLimit,
                analysesThisMonth: req.user.analysesThisMonth,
                preferences: req.user.preferences
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getMe };