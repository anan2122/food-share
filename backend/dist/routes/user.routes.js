"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const Notification_1 = __importDefault(require("../models/Notification"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        const queryObj = {};
        if (role && role !== 'all') {
            queryObj.role = role;
        }
        if (status === 'verified') {
            queryObj.isVerified = true;
        }
        else if (status === 'pending') {
            queryObj.isVerified = false;
        }
        else if (status === 'inactive') {
            queryObj.isActive = false;
        }
        if (search) {
            queryObj.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { organization: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User_1.default.find(queryObj)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            User_1.default.countDocuments(queryObj),
        ]);
        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password').lean();
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { isActive, isVerified, trustBadge, adminNotes } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        if (isActive !== undefined)
            user.isActive = isActive;
        if (isVerified !== undefined) {
            user.isVerified = isVerified;
            if (isVerified) {
                user.verificationDate = new Date();
                user.verifiedBy = req.user?._id;
            }
        }
        if (trustBadge)
            user.trustBadge = trustBadge;
        if (adminNotes)
            user.adminNotes = adminNotes;
        await user.save();
        // Create audit log
        await AuditLog_1.default.create({
            action: 'USER_UPDATED',
            performedBy: req.user?._id,
            targetUser: user._id,
            details: { changes: req.body },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                trustBadge: user.trustBadge,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   DELETE /api/users/:id
// @desc    Deactivate user (admin only)
// @access  Private/Admin
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        // Don't allow deleting self
        if (user._id.toString() === req.user?._id.toString()) {
            throw new errorHandler_1.ApiError(400, 'Cannot deactivate your own account');
        }
        user.isActive = false;
        await user.save();
        // Create audit log
        await AuditLog_1.default.create({
            action: 'USER_DEACTIVATED',
            performedBy: req.user?._id,
            targetUser: user._id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            message: 'User deactivated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   POST /api/users/:id/verify
// @desc    Verify or reject user
// @access  Private/Admin
router.post('/:id/verify', auth_1.protect, (0, auth_1.authorize)('admin'), [
    (0, express_validator_1.body)('action').isIn(['approve', 'reject', 'revoke']).withMessage('Invalid action'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ApiError(400, errors.array().map(e => e.msg).join(', '));
        }
        const { action, reason, notes } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            throw new errorHandler_1.ApiError(404, 'User not found');
        }
        let notificationMessage = '';
        let auditAction = 'USER_VERIFIED';
        switch (action) {
            case 'approve':
                user.isVerified = true;
                user.verificationDate = new Date();
                user.verifiedBy = req.user?._id;
                notificationMessage = 'Your account has been verified! You now have full access to the platform.';
                auditAction = 'USER_VERIFIED';
                break;
            case 'reject':
                user.isVerified = false;
                user.isActive = false;
                notificationMessage = `Your verification request has been rejected. Reason: ${reason || 'Not specified'}`;
                auditAction = 'USER_REJECTED';
                break;
            case 'revoke':
                user.isVerified = false;
                notificationMessage = `Your verification has been revoked. Reason: ${reason || 'Not specified'}`;
                auditAction = 'VERIFICATION_REVOKED';
                break;
        }
        if (notes) {
            user.adminNotes = notes;
        }
        await user.save();
        // Create notification
        await Notification_1.default.create({
            user: user._id,
            type: action === 'approve' ? 'verification_approved' : 'verification_rejected',
            title: action === 'approve' ? 'Account Verified' : 'Verification Update',
            message: notificationMessage,
            priority: 'high',
        });
        // Create audit log
        await AuditLog_1.default.create({
            action: auditAction,
            performedBy: req.user?._id,
            targetUser: user._id,
            details: { action, reason, notes },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            message: `User ${action === 'approve' ? 'verified' : action} successfully`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/users/verifications/pending
// @desc    Get pending verifications
// @access  Private/Admin
router.get('/verifications/pending', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const users = await User_1.default.find({ isVerified: false, isActive: true })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            success: true,
            data: users,
            count: users.length,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map