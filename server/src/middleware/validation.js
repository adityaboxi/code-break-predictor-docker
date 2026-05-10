const validateRepoUrl = (req, res, next) => {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }
    
    const githubPattern = /^https?:\/\/github\.com\/[^\/]+\/[^\/]+/;
    if (!githubPattern.test(repoUrl)) {
        return res.status(400).json({ error: 'Invalid GitHub repository URL' });
    }
    
    next();
};

const validatePredictionDate = (req, res, next) => {
    const { predictionDate } = req.body;
    
    if (!predictionDate) {
        return res.status(400).json({ error: 'Prediction date is required' });
    }
    
    const date = new Date(predictionDate);
    if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }
    
    if (date < new Date()) {
        return res.status(400).json({ error: 'Prediction date must be in the future' });
    }
    
    req.predictionDate = date;
    next();
};

module.exports = { validateRepoUrl, validatePredictionDate };