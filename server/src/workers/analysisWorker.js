const { analysisQueue } = require('../config/bull.js');
const connectDB = require('../config/database.js');
const Analysis = require('../models/Analysis.js');
const Dependency = require('../models/Dependency.js');
const Repository = require('../models/Repository.js');
const ActivityLog = require('../models/ActivityLog.js');
const RecursiveScanner = require('../services/recursiveScanner.js');
const RiskEngine = require('../services/riskEngine.js');

connectDB();
console.log('🚀 Bull worker starting...');

analysisQueue.process(async (job) => {
    const { analysisId, userId, repoUrl, predictionDate, githubToken, startedAt } = job.data;
    console.log(`🔨 [Job ${job.id}] Starting analysis for ${repoUrl}`);
    await job.progress(10);

    try {
        await Analysis.findByIdAndUpdate(analysisId, { status: 'processing', queueProgress: 10 });
        await job.progress(20);

        const scanner = new RecursiveScanner(githubToken);
        const scanResult = await scanner.scanRepository(repoUrl);
        await job.progress(40);

        const riskEngine = new RiskEngine();
        const futureDate = new Date(predictionDate);
        const allDependencies = [];

        let processed = 0;
        const total = scanResult.dependencies.length;

        for (const dep of scanResult.dependencies) {
            console.log(`   🔍 Analyzing: ${dep.name} (${dep.ecosystem})`);
            const riskResult = await riskEngine.calculateRisk(dep.name, dep.version, futureDate, dep.ecosystem);

            allDependencies.push({
                analysisId,
                userId,
                packageName: dep.name,
                currentVersion: dep.version,
                latestVersion: riskResult.latestVersion,
                filePath: dep.manifestPath,
                dependencyType: dep.dependencyType || 'dependencies',  // Use the correct field
                ecosystem: dep.ecosystem,
                deprecated: riskResult.deprecated,
                riskPercentage: riskResult.riskPercentage,
                riskLevel: riskResult.riskLevel,
                reasons: riskResult.reasons,
                documentationUrl: riskResult.documentationUrl || `https://www.npmjs.com/package/${dep.name}`,
                lastPublishDate: riskResult.lastPublishDate,
            });

            processed++;
            await job.progress(40 + Math.floor((processed / total) * 50));
        }

        await job.progress(90);
        const totalDeps = allDependencies.length;
        const highRiskCount = allDependencies.filter(d => d.riskPercentage > 70).length;
        const mediumRiskCount = allDependencies.filter(d => d.riskPercentage > 30 && d.riskPercentage <= 70).length;
        const lowRiskCount = allDependencies.filter(d => d.riskPercentage <= 30).length;
        const overallRisk = totalDeps > 0 ? Math.round(allDependencies.reduce((sum, d) => sum + d.riskPercentage, 0) / totalDeps) : 0;

        if (allDependencies.length) await Dependency.insertMany(allDependencies);

        await Analysis.findByIdAndUpdate(analysisId, {
            status: 'completed',
            completedAt: new Date(),
            overallRiskPercentage: overallRisk,
            totalDependencies: totalDeps,
            highRiskCount,
            mediumRiskCount,
            lowRiskCount,
            packageJsonFilesFound: scanResult.manifestFiles.map(m => m.path),
            totalFilesScanned: scanResult.manifestFiles.length,
            scanDurationMs: Date.now() - startedAt,
            queueProgress: 100
        });

        const { owner, repo, branch } = scanResult;
        await Repository.findOneAndUpdate(
            { userId, repoUrl },
            { userId, repoUrl, owner, repoName: repo, branch, lastAnalyzedAt: new Date(), $inc: { analysisCount: 1 }, $set: { averageRiskScore: overallRisk } },
            { upsert: true }
        );

        await ActivityLog.create({ userId, action: 'analysis_completed', details: { repoUrl, analysisId, riskScore: overallRisk, durationMs: Date.now() - startedAt } });

        console.log(`✅ [Job ${job.id}] Completed! Risk: ${overallRisk}%`);
        return { analysisId, overallRisk, totalDependencies: totalDeps, highRiskCount, mediumRiskCount, lowRiskCount };
    } catch (error) {
        console.error(`❌ [Job ${job.id}] Failed:`, error.message);
        await Analysis.findByIdAndUpdate(analysisId, { status: 'failed', errorMessage: error.message });
        await ActivityLog.create({ userId, action: 'analysis_failed', details: { repoUrl, analysisId, errorMessage: error.message } });
        throw error;
    }
});

console.log('✅ Bull queue processor ready');