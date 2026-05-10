import { useState, useEffect } from 'react';
import { historyAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const History = () => {
    const { user, logout } = useAuthStore();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await historyAPI.getAll();
                setAnalyses(res.data.analyses);
            } catch (err) {
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getRiskBadge = (risk) => {
        if (risk > 70) return 'bg-rose-100 text-rose-700';
        if (risk > 30) return 'bg-amber-100 text-amber-700';
        return 'bg-emerald-100 text-emerald-700';
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            </div>
        );
    }
    
    return (
        <div>
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
                    <button onClick={logout} className="text-sm text-gray-500 hover:text-rose-600 transition">Logout</button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">📜 Analysis History</h1>
                    <p className="text-gray-500 text-sm mt-1">View all your past dependency analyses</p>
                </div>
                
                {analyses.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-rose-600">{analyses.filter(a => a.overallRiskPercentage > 70).length}</div>
                            <div className="text-xs text-rose-600">High Risk</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-amber-600">{analyses.filter(a => a.overallRiskPercentage > 30 && a.overallRiskPercentage <= 70).length}</div>
                            <div className="text-xs text-amber-600">Medium Risk</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-600">{analyses.filter(a => a.overallRiskPercentage <= 30 && a.overallRiskPercentage > 0).length}</div>
                            <div className="text-xs text-emerald-600">Low Risk</div>
                        </div>
                    </div>
                )}
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                    {analyses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-3 opacity-50">📭</div>
                            <p className="text-gray-500">No analyses yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {analyses.map((analysis) => (
                                <div key={analysis._id} className="p-5 hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => window.location.href = '/'}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-sm font-medium text-gray-900 truncate">{analysis.repoUrl}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadge(analysis.overallRiskPercentage)}`}>
                                                    {analysis.overallRiskPercentage > 70 ? 'High Risk' : analysis.overallRiskPercentage > 30 ? 'Medium Risk' : 'Low Risk'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                <span>📅 {formatDate(analysis.createdAt)}</span>
                                                <span>📦 {analysis.totalDependencies || 0} dependencies</span>
                                                <span>🔮 Due: {new Date(analysis.predictionDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${analysis.overallRiskPercentage > 70 ? 'text-rose-600' : analysis.overallRiskPercentage > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {analysis.overallRiskPercentage || '?'}%
                                            </div>
                                            <div className="text-xs text-gray-500">break probability</div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full rounded-full ${analysis.overallRiskPercentage > 70 ? 'bg-rose-500' : analysis.overallRiskPercentage > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${analysis.overallRiskPercentage || 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;