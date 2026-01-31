"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Generate JWT Token
const generateToken = (id, role) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const options = { expiresIn: '7d' };
    return jsonwebtoken_1.default.sign({ id, role }, secret, options);
};
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('role').isIn(['donor', 'ngo', 'volunteer']).withMessage('Valid role is required'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone number is required'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ApiError(400, errors.array().map(e => e.msg).join(', '));
        }
        const { email, password, name, role, phone, organization, address } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new errorHandler_1.ApiError(400, 'User with this email already exists');
        }
        // Create user
        const user = await User_1.default.create({
            email: email.toLowerCase(),
            password,
            name,
            role,
            phone,
            organization,
            address,
        });
        // Create audit log
        await AuditLog_1.default.create({
            action: 'USER_REGISTERED',
            performedBy: user._id,
            targetUser: user._id,
            details: { role, email },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        const token = generateToken(user._id.toString(), user.role);
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ApiError(400, errors.array().map(e => e.msg).join(', '));
        }
        const { email, password } = req.body;
        // Find user with password
        const user = await User_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            throw new errorHandler_1.ApiError(401, 'Invalid email or password');
        }
        if (!user.isActive) {
            throw new errorHandler_1.ApiError(401, 'Your account has been deactivated');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errorHandler_1.ApiError(401, 'Invalid email or password');
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Create audit log
        await AuditLog_1.default.create({
            action: 'USER_LOGIN',
            performedBy: user._id,
            details: { email },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        const token = generateToken(user._id.toString(), user.role);
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified,
                    organization: user.organization,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth_1.protect, async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                organization: user.organization,
                address: user.address,
                isVerified: user.isVerified,
                trustBadge: user.trustBadge,
                completedDonations: user.completedDonations,
                preferences: user.preferences,
                volunteerInfo: user.volunteerInfo,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put('/password', auth_1.protect, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ApiError(400, errors.array().map(e => e.msg).join(', '));
        }
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user?._id).select('+password');
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new errorHandler_1.ApiError(400, 'Current password is incorrect');
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth_1.protect, async (req, res, next) => {
    try {
        const { name, phone, organization, address, preferences, volunteerInfo } = req.body;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        // Update allowed fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (organization)
            user.organization = organization;
        if (address)
            user.address = { ...user.address, ...address };
        if (preferences)
            user.preferences = { ...user.preferences, ...preferences };
        if (volunteerInfo && user.role === 'volunteer') {
            user.volunteerInfo = { ...user.volunteerInfo, ...volunteerInfo };
        }
        await user.save();
        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone,
                organization: user.organization,
                address: user.address,
                preferences: user.preferences,
                volunteerInfo: user.volunteerInfo,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map