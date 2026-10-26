
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklistModel');

async function authUser(req, res, next) {
    try {
        // 1. Get token from cookie or Authorization header
        const authHeader = req.headers.authorization;

        const token = req.cookies?.token ||
            (authHeader?.startsWith('Bearer ')
                ? authHeader.slice(7)
                : null);

        if (!token) {
            return res.status(401).json({
                message: 'Token not provided'
            });
        }

        // 2. Check whether token is blacklisted
        const isTokenBlacklisted =
            await tokenBlacklistModel.findOne({ token });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'Token has been revoked. Please log in again.'
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Login token contains { userId: ... }
        req.user = decoded;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError' ||
            err.name === 'JsonWebTokenError' ||
            err.name === 'NotBeforeError') {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        console.error('Authentication error:', err.message);

        return res.status(500).json({
            message: 'Authentication failed'
        });
    }
}

module.exports = { authUser };
