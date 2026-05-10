import { useState } from 'react';
import { analysisAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Home = () => {
    const { user, logout } = useAuthStore();
    const [repoUrl, setRepoUrl] = useState('');
    const [predictionDate, setPredictionDate] = useState('');
    const [useToken, setUseToken] = useState(false);
    const [githubToken, setGithubToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [dependencies, setDependencies] = useState([]);
    const [error, setError] = useState('');

    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 6);
    const defaultDateStr = defaultDate.toISOString().split('T')[0];

    const startPolling = (analysisId) => {
        const interval = setInterval(async () => {
            try {
                const statusRes = await analysisAPI.getStatus(analysisId);
                setAnalysis(statusRes.data);
                
                if (statusRes.data.status === 'completed') {
                    clearInterval(interval);
                    setLoading(false);
                    const resultsRes = await analysisAPI.getResults(analysisId);
                    setDependencies(resultsRes.data.dependencies || []);
                } else if (statusRes.data.status === 'failed') {
                    clearInterval(interval);
                    setLoading(false);
                    setError(statusRes.data.errorMessage || 'Analysis failed');
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setAnalysis(null);
        setDependencies([]);
        const date = predictionDate || defaultDateStr;
        try {
            const payload = { repoUrl, predictionDate: date };
            if (useToken && githubToken) {
                payload.githubToken = githubToken;
            }
            const response = await analysisAPI.start(payload);
            startPolling(response.data.analysisId);
        } catch (err) {
            setError(err.response?.data?.error || 'Analysis failed');
            setLoading(false);
        }
    };

    // Group dependencies by ecosystem
    const groupedDeps = dependencies.reduce((acc, dep) => {
        const eco = dep.ecosystem || 'npm';
        if (!acc[eco]) acc[eco] = [];
        acc[eco].push(dep);
        return acc;
    }, {});

    const getRiskColor = (percentage) => {
        if (percentage > 70) return 'text-rose-600 bg-rose-50';
        if (percentage > 30) return 'text-amber-600 bg-amber-50';
        return 'text-emerald-600 bg-emerald-50';
    };

    const ecosystemIcons = {
        npm: '📦',
        pypi: '🐍',
        maven: '☕',
        go: '🔵',
        crates: '🦀',
        packagist: '🐘',
        rubygems: '💎',
        nuget: '🔷'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <h1 className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">
                        Code Break Predictor
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">👤 {user?.username}</span>
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-rose-600 transition">
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Analyze Repository</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Repository URL</label>
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/owner/repo"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white/80"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Supports multiple languages: Node.js, Python, Java, Go, Rust, PHP, Ruby, .NET</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prediction Date (optional)</label>
                            <input
                                type="date"
                                value={predictionDate}
                                onChange={(e) => setPredictionDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white/80"
                            />
                            <p className="text-xs text-gray-400 mt-1">Default: 6 months from today</p>
                        </div>
                        {/* GitHub Token Section */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="useToken"
                                checked={useToken}
                                onChange={(e) => setUseToken(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <label htmlFor="useToken" className="text-sm text-gray-700">
                                Use GitHub Token (for higher rate limits / private repos)
                            </label>
                        </div>
                        {useToken && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GitHub Personal Access Token
                                </label>
                                <input
                                    type="password"
                                    value={githubToken}
                                    onChange={(e) => setGithubToken(e.target.value)}
                                    placeholder="github_pat_..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-white/80"
                                />
                                <p className="text-xs text-gray-400 mt-1">Create token at GitHub → Settings → Developer settings → Personal access tokens</p>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                                <p className="text-rose-600 text-sm">❌ {error}</p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                    Starting Analysis...
                                </span>
                            ) : (
                                'Start Analysis'
                            )}
                        </button>
                    </form>
                </div>

                {/* Progress Card */}
                {analysis && analysis.status !== 'completed' && (
                    <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
                            <span className="text-sm text-gray-500">{analysis.queueProgress || 0}%</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-2 rounded-full transition-all duration-300" style={{ width: `${analysis.queueProgress || 0}%` }} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {analysis.status === 'processing' ? '🔄 Processing dependencies...' : '⏳ Queued...'}
                        </p>
                    </div>
                )}

                {/* Results Card - Grouped by Ecosystem */}
                {dependencies.length > 0 && (
                    <div className="mt-6 space-y-6">
                        {Object.entries(groupedDeps).map(([ecosystem, deps]) => (
                            <div key={ecosystem} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{ecosystemIcons[ecosystem] || '📦'}</span>
                                        <h3 className="font-semibold text-gray-800">{ecosystem.toUpperCase()} Packages</h3>
                                        <span className="text-xs text-gray-500 ml-2">({deps.length})</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                    {deps.map((dep) => (
                                        <div key={dep.packageName} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-amber-50/30 transition">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-mono font-medium text-gray-800">{dep.packageName}</span>
                                                    <span className="text-xs text-gray-400">({dep.currentVersion})</span>
                                                    {dep.deprecated && (
                                                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Deprecated</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">Ecosystem: {dep.ecosystem}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskColor(dep.riskPercentage)}`}>
                                                    {dep.riskPercentage}% risk
                                                </div>
                                                <div className="w-20">
                                                    <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${dep.riskPercentage > 70 ? 'bg-rose-500' : dep.riskPercentage > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${dep.riskPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;