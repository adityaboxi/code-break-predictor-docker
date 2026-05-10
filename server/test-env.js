require('dotenv').config();

console.log('Environment Variables Check:');
console.log('=============================');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
console.log(`REDIS_HOST: ${process.env.REDIS_HOST}`);
console.log(`REDIS_PORT: ${process.env.REDIS_PORT}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET.substring(0, 10)}... (length: ${process.env.JWT_SECRET.length})`);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);
console.log('\n✅ All environment variables loaded successfully!');