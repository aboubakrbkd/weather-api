const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const verifyEmail = require('../utils/VerificationEmail');
const resetMail = require('../utils/resetMail');

exports.signup = async (req, res) => {
    const {email, username, password} = req.body;
    if (!email || !username || !password)
        return res.status(400).json({message: "Email, username and password are required"});
    try {
        const checkUser = await User.findOne({email});
        if (checkUser)
            return res.status(400).json({message: "Email already taken"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({email, username, password: hashedPassword});
        await newUser.save();
        const token = jwt.sign({email: newUser.email}, process.env.EMAIL_TOKEN, {expiresIn: '1h'});
        const verificationLink = `http://localhost:3001/verify-link?token=${token}`;
        await verifyEmail(newUser.email, verificationLink);
        console.log(`Token is ${verificationLink}`);
        res.status(201).json({message: "User created successfully"}, verificationLink);
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    };
}

exports.login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password)
        return res.status(400).json({message: "Email and password are required"});
    try {
        const checkUser = await User.findOne({email});
        if (!checkUser)
            return res.status(400).json({message: "Invalid Email"});
        const checkPassword = await bcrypt.compare(password, checkUser.password);
        if (!checkPassword)
            return res.status(400).json({message: "Password are incorrect"});
        // if (!checkUser.verified)
        //     return res.status(403).json({ message: 'Email not verified' });
        const accesToken = jwt.sign(
            {
                id: checkUser._id,
                username: checkUser.username,
                role: checkUser.role,
            }, 
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        );
        const refreshToken = jwt.sign(
            {
                id: checkUser.id,
                username: checkUser.username,
                role: checkUser.role,
            }, 
            process.env.JWT_REFRESH, 
            {expiresIn: '7d'}
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 60 * 60 * 1000
        });
        res.status(200).json({message: "Login successful", accesToken});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal server error"});
    };
}

exports.refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({message: 'No refresh token'});
    try {
        const verify = jwt.verify(token, process.env.JWT_REFRESH);
        const newToken =  jwt.sign({username: verify.username}, process.env.JWT_SECRET, {expiresIn: '15m'});
        res.json({accesToken: newToken});
    } catch (err) {
        console.log(err);
        res.status(403).json({message: 'Invalid refresh token'});
    }
}

exports.logout = (req, res) => {
    res.clearCookie('refreshToken', { 
        httpOnly: true,
        sameSite: 'Strict',
        secure: true });
    res.json({ message: 'Logged out' });
}

exports.verifyEmail = async (req, res) => {
    const {token} = req.query;
    if (!token)
        return res.status(400).json({message: 'No token provided'});
    try {
        const decoded = jwt.verify(token, process.env.EMAIL_TOKEN);
        const user = await User.findOne({ email: decoded.email });
        if (!user)
            return res.status(400).json({ message: 'User not found' });
        if (user.verified)
            return res.status(400).json({ message: 'Already verified' });
        user.verified = true;
        await user.save();
        res.json({ message: 'Email verified successfully' });
    } catch (err) {
        console.log(err);
        res.status(400).json({message: 'Invalid or expired token'});
    }
}

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;
    if (!email)
        return res.status(400).json({ message: "Email is required" });
    try {
        const user = await User.findOne({email});
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const resetToken = jwt.sign({ email: user.email }, process.env.RESET_SECRET, { expiresIn: '15m' });
        const resetLink = `http://localhost:3001/reset-password?token=${resetToken}`;
        console.log(resetLink);
        await resetMail(user.email, resetLink);
         res.status(200).json({message: "go to reseetPassword"});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }

}

exports.resetPassword = async (req, res) => {
    const {newPassword} = req.body;
    const token = req.query.token;
    if (!token || !newPassword)
        return res.status(400).json({message: 'Token and new password are required'});
    try {
        const decoded = jwt.verify(token, process.env.RESET_SECRET);
        const user = await User.findOne({email: decoded.email});
        if (!user)
            return res.status(404).json({ message: 'User not found' });
                const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
}