const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    repoUrl: {
        type: String,
        required: true
    },
    owner: String,
    repoName: String,
    branch: {
        type: String,
        default: 'main'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    githubCreatedAt: Date,
    githubUpdatedAt: Date,
    lastAnalyzedAt: Date,
    analysisCount: {
        type: Number,
        default: 0
    },
    averageRiskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    tags: [String],
    starred: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

repositorySchema.index({ userId: 1, repoUrl: 1 }, { unique: true });
repositorySchema.index({ userId: 1, lastAnalyzedAt: -1 });
repositorySchema.index({ userId: 1, averageRiskScore: -1 });

module.exports = mongoose.model('Repository', repositorySchema);