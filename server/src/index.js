require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/database.js');
const { apiLimiter } = require('./middleware/rateLimit.js');
const User = require('./models/User.js');

// Import routes
const authRoutes = require('./routes/auth.js');
const analysisRoutes = require('./routes/analysis.js');
const historyRoutes = require('./routes/history.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware - Safari compatible configuration
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// API Routes
console.log('📡 Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: 'checking...'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Serve static files (React build)
app.use(express.static(path.join(__dirname, '../public')));

// Create admin user if not exists
const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                email: process.env.ADMIN_EMAIL || 'admin@example.com',
                username: 'admin',
                passwordHash: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin',
                monthlyAnalysisLimit: 1000
            });
            console.log('✅ Admin user created');
        }
    } catch (error) {
        console.log('Admin user already exists or creation failed');
    }
};

// Catch-all route for React app
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`   POST   /api/auth/register - Register`);
    console.log(`   POST   /api/auth/login    - Login`);
    console.log(`   POST   /api/analysis/start - Start analysis`);
    console.log(`   GET    /api/analysis/status/:id - Check status`);
    console.log(`   GET    /api/analysis/results/:id - Get results`);
    console.log(`   GET    /api/history        - View history`);
    console.log(`   GET    /api/health         - Health check`);
    console.log(`\n🎨 Frontend being served at http://localhost:${PORT}`);
    
    await createAdminUser();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});