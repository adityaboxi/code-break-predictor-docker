const mongoose = require('mongoose');

const packageCacheSchema = new mongoose.Schema({
    packageName: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    latestVersion: String,
    allVersions: [String],
    metadata: {
        description: String,
        homepage: String,
        repository: {
            // Accept string or object; store as string URL for simplicity
            type: mongoose.Schema.Types.Mixed,
            default: '',
            // Automatically extract URL from object if needed
            set: function(value) {
                if (!value) return '';
                if (typeof value === 'string') return value;
                if (typeof value === 'object' && value.url) return value.url;
                return '';
            }
        },
        keywords: [String],
        author: String,
        license: String
    },
    maintainers: [{
        name: String,
        email: String
    }],
    downloadStats: {
        lastDay: Number,
        lastWeek: Number,
        lastMonth: Number
    },
    deprecationInfo: {
        isDeprecated: { type: Boolean, default: false },
        message: String,
        alternative: String
    },
    timeSeries: {
        created: Date,
        modified: Date,
        versions: mongoose.Schema.Types.Mixed
    },
    documentation: {
        url: String,
        breakingChanges: [{
            version: String,
            date: Date,
            notes: String
        }],
        migrationGuides: [{
            fromVersion: String,
            toVersion: String,
            url: String
        }],
        lastFetched: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    fetchCount: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

packageCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
packageCacheSchema.index({ packageName: 1, 'downloadStats.lastMonth': -1 });

module.exports = mongoose.model('PackageCache', packageCacheSchema);