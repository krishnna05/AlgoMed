const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protect routes - Verify JWT Token
const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in Cookies 
    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } 
    // 2. Check for Bearer token in headers 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token found
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token (exclude password) & attach to req object
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, user not found'
            });
        }

        next(); // Token valid, proceed to controller
    } catch (error) {
        console.error(error);
        res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};

module.exports = { protect };