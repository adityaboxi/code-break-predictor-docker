const mongoose = require('mongoose');

const dependencySchema = new mongoose.Schema({
    analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    packageName: { type: String, required: true, index: true },
    currentVersion: String,
    latestVersion: String,
    filePath: String,
    dependencyType: {
        type: String,
        enum: ['dependencies', 'devDependencies', 'peerDependencies', 'requirements', 'default'],
        default: 'dependencies'
    },
    ecosystem: { type: String, enum: ['npm', 'pypi', 'maven', 'go', 'crates', 'packagist', 'rubygems', 'nuget'], default: 'npm' },
    deprecated: { type: Boolean, default: false },
    riskPercentage: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    factors: { monthsSinceLastUpdate: Number, majorVersionsBehind: Number },
    reasons: [String],
    documentationUrl: String,
    lastPublishDate: Date
}, { timestamps: true });

dependencySchema.index({ analysisId: 1 });
dependencySchema.index({ packageName: 1, riskPercentage: -1 });
dependencySchema.index({ userId: 1, ecosystem: 1 });

module.exports = mongoose.model('Dependency', dependencySchema);