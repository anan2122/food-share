"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = __importDefault(require("../models/Notification"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth_1.protect, async (req, res, next) => {
    try {
        const { unread, page = 1, limit = 20 } = req.query;
        const queryObj = {
            user: req.user?._id,
        };
        if (unread === 'true') {
            queryObj.isRead = false;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [notifications, total, unreadCount] = await Promise.all([
            Notification_1.default.find(queryObj)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Notification_1.default.countDocuments(queryObj),
            Notification_1.default.countDocuments({ user: req.user?._id, isRead: false }),
        ]);
        res.json({
            success: true,
            data: notifications,
            unreadCount,
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
// @route   PATCH /api/notifications/read
// @desc    Mark notifications as read
// @access  Private
router.patch('/read', auth_1.protect, async (req, res, next) => {
    try {
        const { notificationIds, markAllRead } = req.body;
        if (markAllRead) {
            await Notification_1.default.updateMany({ user: req.user?._id, isRead: false }, { isRead: true, readAt: new Date() });
            return res.json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        if (notificationIds && notificationIds.length > 0) {
            await Notification_1.default.updateMany({ _id: { $in: notificationIds }, user: req.user?._id }, { isRead: true, readAt: new Date() });
            return res.json({
                success: true,
                message: 'Notifications marked as read',
            });
        }
        throw new errorHandler_1.ApiError(400, 'No notifications specified');
    }
    catch (error) {
        next(error);
    }
});
// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth_1.protect, async (req, res, next) => {
    try {
        const notification = await Notification_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user?._id,
        });
        if (!notification) {
            throw new errorHandler_1.ApiError(404, 'Notification not found');
        }
        res.json({
            success: true,
            message: 'Notification deleted',
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   DELETE /api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', auth_1.protect, async (req, res, next) => {
    try {
        await Notification_1.default.deleteMany({ user: req.user?._id });
        res.json({
            success: true,
            message: 'All notifications deleted',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map