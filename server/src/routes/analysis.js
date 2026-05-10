const express = require('express');
const { startAnalysis, getAnalysisStatus, getAnalysisResults } = require('../controllers/analysisController.js');
const { authenticate } = require('../middleware/auth.js');
const { analysisLimiter } = require('../middleware/rateLimit.js');
const { validateRepoUrl, validatePredictionDate } = require('../middleware/validation.js');

const router = express.Router();

router.post('/start', 
    authenticate, 
    analysisLimiter,
    validateRepoUrl,
    validatePredictionDate,
    startAnalysis
);

router.get('/status/:analysisId', authenticate, getAnalysisStatus);
router.get('/results/:analysisId', authenticate, getAnalysisResults);

module.exports = router;