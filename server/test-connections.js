const mongoose = require('mongoose');
const Redis = require('ioredis');
require('dotenv').config();

const testConnections = async () => {
    console.log('\n🔍 Testing Connections...\n');
    
    // Test MongoDB
    console.log('📡 Testing MongoDB...');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ MongoDB failed:', error.message);
    }
    
    // Test Redis
    console.log('\n📡 Testing Redis...');
    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    });
    
    try {
        const pong = await redis.ping();
        console.log('✅ Redis connected! Response:', pong);
        await redis.quit();
    } catch (error) {
        console.error('❌ Redis failed:', error.message);
        console.log('\n💡 To fix Redis:');
        console.log('   brew install redis');
        console.log('   brew services start redis');
    }
    
    console.log('\n✅ Connection tests completed!\n');
};

testConnections();
