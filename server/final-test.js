require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
    console.log('Using EMAIL_FROM:', process.env.EMAIL_FROM);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: 'krishnaboxi1983@gmail.com',   // CHANGE THIS TO YOUR REAL EMAIL
        subject: 'Test from final-test.js',
        text: 'If you see this, SMTP works',
    });
    console.log('✅ Email sent:', info.messageId);
}

test().catch(console.error);
