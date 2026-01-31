"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("./errorHandler");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            throw new errorHandler_1.ApiError(401, 'Not authorized, no token provided');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            throw new errorHandler_1.ApiError(401, 'User not found');
        }
        if (!user.isActive) {
            throw new errorHandler_1.ApiError(401, 'User account is deactivated');
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.ApiError(401, 'Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.ApiError(401, 'Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.ApiError(401, 'Not authorized'));
        }
        if (!roles.includes(req.user.role)) {
            return next(new errorHandler_1.ApiError(403, `Role ${req.user.role} is not authorized to access this route`));
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch {
        // Token invalid or expired, continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map