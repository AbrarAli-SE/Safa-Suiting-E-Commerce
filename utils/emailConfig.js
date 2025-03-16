const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(to, subject, html) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
    } 
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent.');
    }
}

module.exports = sendEmail; 
