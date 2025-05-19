const nodemailer = require('nodemailer');

const VerificationEmail = async (email, link) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click the link to verify your email: <a href="${link}">Verify Email</a></p>`,
    });
}


module.exports = VerificationEmail;