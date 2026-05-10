const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    passwordHash: {
        type: String,
        required: true
    },
    githubToken: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['free', 'pro', 'admin'],
        default: 'free'
    },
    monthlyAnalysisLimit: {
        type: Number,
        default: 50
    },
    analysesThisMonth: {
        type: Number,
        default: 0
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    preferences: {
        defaultPredictionDays: { type: Number, default: 365 },
        emailNotifications: { type: Boolean, default: false }
    },
    resetOtp: {
        type: String,
        select: false
    },
    resetOtpExpiry: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Only hash password on save if it's modified AND not already hashed
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) return next();
    
    // Check if already hashed (starts with $2a$)
    if (this.passwordHash.startsWith('$2a$')) {
        return next();
    }
    
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Reset monthly analysis count
userSchema.methods.resetMonthlyCount = async function() {
    const now = new Date();
    const lastReset = this.lastResetDate;
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        this.analysesThisMonth = 0;
        this.lastResetDate = now;
        await this.save();
    }
    return this.analysesThisMonth;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
