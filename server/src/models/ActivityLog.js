const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: [
            'analysis_started',
            'analysis_completed',
            'analysis_failed',
            'repo_added',
            'repo_removed',
            'github_token_updated',
            'login',
            'logout',
            'settings_updated'
        ],
        required: true
    },
    details: {
        repoUrl: String,
        analysisId: mongoose.Schema.Types.ObjectId,
        riskScore: Number,
        errorMessage: String,
        durationMs: Number,
        changes: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);