const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    repositoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository'
    },
    repoUrl: {
        type: String,
        required: true
    },
    predictionDate: {
        type: Date,
        required: true
    },
    overallRiskPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    totalDependencies: {
        type: Number,
        default: 0
    },
    highRiskCount: {
        type: Number,
        default: 0
    },
    mediumRiskCount: {
        type: Number,
        default: 0
    },
    lowRiskCount: {
        type: Number,
        default: 0
    },
    packageJsonFilesFound: [String],
    totalFilesScanned: {
        type: Number,
        default: 0
    },
    scanDurationMs: Number,
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    errorMessage: String,
    jobId: String,
    queueProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ repoUrl: 1, createdAt: -1 });
analysisSchema.index({ status: 1, createdAt: 1 });
analysisSchema.index({ userId: 1, overallRiskPercentage: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);