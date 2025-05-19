const nodemailer = require('nodemailer');

const sendResetEmail = async (email, resetLink) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Password Reset',
        html: `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
    });
};


module.exports = sendResetEmail;
