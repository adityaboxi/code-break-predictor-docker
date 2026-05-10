const { analysisQueue } = require('../config/bull.js');
const Analysis = require('../models/Analysis.js');
const Dependency = require('../models/Dependency.js');
const Repository = require('../models/Repository.js');
const ActivityLog = require('../models/ActivityLog.js');
const RecursiveScanner = require('../services/recursiveScanner.js');
const PackageDocService = require('../services/packageDocService.js');
const RiskEngine = require('../services/riskEngine.js');

const startAnalysis = async (req, res) => {
    try {
        const { repoUrl, predictionDate, githubToken } = req.body;
        
        // Check monthly limit
        await req.user.resetMonthlyCount();
        if (req.user.analysesThisMonth >= req.user.monthlyAnalysisLimit) {
            return res.status(429).json({ 
                error: 'Monthly analysis limit reached. Upgrade to pro plan.' 
            });
        }
        
        // Create analysis record
        const analysis = await Analysis.create({
            userId: req.user._id,
            repoUrl,
            predictionDate: new Date(predictionDate),
            status: 'pending'
        });
        
        // Log activity
        await ActivityLog.create({
            userId: req.user._id,
            action: 'analysis_started',
            details: { repoUrl, analysisId: analysis._id },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        // Increment monthly count
        req.user.analysesThisMonth += 1;
        await req.user.save();
        
        // Add to Bull queue
        const job = await analysisQueue.add({
            analysisId: analysis._id,
            userId: req.user._id,
            repoUrl,
            predictionDate,
            githubToken,
            startedAt: Date.now()
        }, {
            priority: req.user.role === 'pro' ? 1 : 3
        });
        
        // Update analysis with job ID
        analysis.jobId = job.id;
        await analysis.save();
        
        res.json({
            success: true,
            analysisId: analysis._id,
            jobId: job.id,
            message: 'Analysis queued successfully'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnalysisStatus = async (req, res) => {
    try {
        const { analysisId } = req.params;
        
        const analysis = await Analysis.findOne({
            _id: analysisId,
            userId: req.user._id
        });
        
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        // Get job status from Bull
        let queueStatus = null;
        if (analysis.jobId) {
            const job = await analysisQueue.getJob(analysis.jobId);
            if (job) {
                const state = await job.getState();
                queueStatus = {
                    status: state,
                    progress: job._progress,
                    attempts: job.attemptsMade
                };
            }
        }
        
        res.json({
            ...analysis.toJSON(),
            progress: analysis.queueProgress,
            queueStatus
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnalysisResults = async (req, res) => {
    try {
        const { analysisId } = req.params;
        
        const analysis = await Analysis.findOne({
            _id: analysisId,
            userId: req.user._id
        });
        
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        const dependencies = await Dependency.find({ analysisId })
            .sort({ riskPercentage: -1 })
            .limit(100);
        
        res.json({
            analysis,
            dependencies,
            summary: {
                total: analysis.totalDependencies,
                high: dependencies.filter(d => d.riskPercentage > 70).length,
                medium: dependencies.filter(d => d.riskPercentage > 30 && d.riskPercentage <= 70).length,
                low: dependencies.filter(d => d.riskPercentage <= 30).length
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { startAnalysis, getAnalysisStatus, getAnalysisResults };