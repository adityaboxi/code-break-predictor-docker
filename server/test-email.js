require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: 'krishnaboxi1983@gmail.com', // Change this to your email
            subject: 'Test Email from Code Break Predictor',
            text: 'If you receive this, SMTP is working!',
        });
        console.log('✅ Email sent! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email failed:', error.message);
        if (error.response) console.error('Response:', error.response);
    }
}

testEmail();