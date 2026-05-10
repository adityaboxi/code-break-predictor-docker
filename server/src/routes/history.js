const express = require('express');
const Analysis = require('../models/Analysis.js');
const { authenticate } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const analyses = await Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .select('repoUrl overallRiskPercentage status createdAt predictionDate');
        
        const total = await Analysis.countDocuments({ userId: req.user._id });
        
        res.json({
            analyses,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: offset + analyses.length < total
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:analysisId', authenticate, async (req, res) => {
    try {
        const analysis = await Analysis.findOne({
            _id: req.params.analysisId,
            userId: req.user._id
        });
        
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        
        res.json(analysis);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;