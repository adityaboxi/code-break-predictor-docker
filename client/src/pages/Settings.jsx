import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navigation = () => {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    
    const navItems = [
        { path: '/', label: '🔍 Analyze' },
        { path: '/history', label: '📜 History' },
        { path: '/settings', label: '⚙️ Settings' },
    ];
    
    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-white/50 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl">📦</span>
                            <span className="font-bold text-xl bg-gradient-to-r from-amber-700 to-rose-700 bg-clip-text text-transparent">
                                Code Break Predictor
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === item.path
                                        ? 'text-amber-600 bg-amber-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="border-l pl-4 ml-2 flex items-center space-x-3">
                            <span className="text-sm text-gray-600">👤 {user?.username}</span>
                            <button onClick={logout} className="text-sm text-gray-500 hover:text-rose-600">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;