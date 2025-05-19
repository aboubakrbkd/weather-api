const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token)
        res.status(401).json({message: 'Acces denied. No token provided'});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Invalid Token'});
    }
};

module.exports = verifyToken;