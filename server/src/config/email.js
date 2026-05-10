console.log('🔍 NODE_ENV value:', process.env.NODE_ENV);

const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

let transporter = null;

const getTransporter = async () => {
    if (!transporter) {
        if (process.env.NODE_ENV === 'production') {
            transporter = createTransporter();
        } else {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log(`📧 Dev email preview: https://ethereal.email`);
        }
    }
    return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const transporter = await getTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Code Break Predictor" <noreply@codebreak.com>',
            to,
            subject,
            html,
            text
        });
        console.log(`📧 Email sent: ${info.messageId}`);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📧 Preview: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Email error:', error.message);
        return { success: false, error: error.message };
    }
};

// OTP Email Function
const sendOtpEmail = async (email, otp) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Your OTP Code</title></head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #f59e0b;">📦 Code Break Predictor</h2>
                <p>Your OTP for password reset is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;
    return sendEmail({ to: email, subject: 'Your OTP Code', html, text: `Your OTP is: ${otp}` });
};

const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${resetToken}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Reset Password</title></head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #f59e0b;">📦 Code Break Predictor</h2>
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p style="margin-top: 20px; font-size: 12px; color: #999;">Link expires in 1 hour.</p>
            </div>
        </body>
        </html>
    `;
    
    return sendEmail({ to: email, subject: 'Reset Your Password', html, text: `Reset: ${resetUrl}` });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendOtpEmail };