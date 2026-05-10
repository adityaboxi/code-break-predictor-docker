import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import History from './pages/History';
import Settings from './pages/Settings';
import useAuthStore from './store/authStore';
import { getCurrentUser } from './services/auth';

function App() {
    const { setUser, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) setUser(user);
        setLoading(false);
    }, [setUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-pulse">📦</div>
                    <h1 className="text-xl font-medium text-gray-700">Code Break Predictor</h1>
                    <p className="text-sm text-gray-400 mt-1">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        isAuthenticated ? <Home /> : <Navigate to="/login" />
                    } />
                    <Route path="/history" element={
                        isAuthenticated ? <History /> : <Navigate to="/login" />
                    } />
                    <Route path="/settings" element={
                        isAuthenticated ? <Settings /> : <Navigate to="/login" />
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;