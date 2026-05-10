const ResultsCard = ({ analysis, dependencies, summary }) => {
    const getRiskColor = (percentage) => {
        if (percentage > 70) return 'bg-rose-100 text-rose-700';
        if (percentage > 30) return 'bg-amber-100 text-amber-700';
        return 'bg-emerald-100 text-emerald-700';
    };
    
    if (!dependencies || dependencies.length === 0) {
        return <div className="text-gray-500 text-center py-4">No dependency details available.</div>;
    }
    
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">📦 Per-Package Break Probability</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {dependencies.map((dep) => (
                    <div key={dep.packageName} className="border border-gray-100 rounded-lg p-3 flex justify-between items-center hover:bg-amber-50/30 transition">
                        <div>
                            <span className="font-mono font-medium text-gray-800">{dep.packageName}</span>
                            <span className="text-xs text-gray-400 ml-2">({dep.currentVersion})</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(dep.riskPercentage)}`}>
                            {dep.riskPercentage}% risk
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-xs text-gray-400 text-center">
                Based on prediction date {analysis?.predictionDate ? new Date(analysis.predictionDate).toLocaleDateString() : 'future date'}
            </div>
        </div>
    );
};

export default ResultsCard;