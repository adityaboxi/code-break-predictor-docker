const AnalysisProgress = ({ status, progress }) => {
    const getStatusDetails = () => {
        switch (status) {
            case 'pending': return { message: 'Queued...', color: 'bg-amber-500', icon: '⏳' };
            case 'processing': return { message: 'Analyzing dependencies...', color: 'bg-amber-500', icon: '🔄' };
            case 'completed': return { message: 'Analysis complete!', color: 'bg-emerald-500', icon: '✅' };
            case 'failed': return { message: 'Analysis failed', color: 'bg-rose-500', icon: '❌' };
            default: return { message: 'Starting...', color: 'bg-gray-500', icon: '📦' };
        }
    };
    
    const details = getStatusDetails();
    
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{details.icon}</span>
                    <span className="font-medium text-gray-700">{details.message}</span>
                </div>
                <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`${details.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
};

export default AnalysisProgress;