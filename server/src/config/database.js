const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use environment variable, fallback to localhost
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-break-predictor';
        
        console.log(`📡 Connecting to MongoDB at: ${mongoURI.replace(/\/\/.*@/, '//<credentials>@')}`);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;