"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FoodDonation_1 = __importDefault(require("../models/FoodDonation"));
const User_1 = __importDefault(require("../models/User"));
const PickupAssignment_1 = __importDefault(require("../models/PickupAssignment"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// @route   GET /api/analytics
// @desc    Get platform analytics (admin only)
// @access  Private/Admin
router.get('/', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));
        // User statistics
        const [totalUsers, activeUsers, verifiedUsers, usersByRole, newUsersInPeriod,] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ isActive: true }),
            User_1.default.countDocuments({ isVerified: true }),
            User_1.default.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } },
            ]),
            User_1.default.countDocuments({ createdAt: { $gte: startDate } }),
        ]);
        // Donation statistics
        const [totalDonations, donationsByStatus, donationsByType, donationsInPeriod, totalQuantityDonated,] = await Promise.all([
            FoodDonation_1.default.countDocuments(),
            FoodDonation_1.default.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            FoodDonation_1.default.aggregate([
                { $group: { _id: '$foodType', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
                { $sort: { count: -1 } },
            ]),
            FoodDonation_1.default.countDocuments({ createdAt: { $gte: startDate } }),
            FoodDonation_1.default.aggregate([
                { $match: { status: { $in: ['completed', 'delivered'] } } },
                { $group: { _id: null, total: { $sum: '$quantity' } } },
            ]),
        ]);
        // Pickup statistics
        const [totalPickups, pickupsByStatus, averagePickupTime,] = await Promise.all([
            PickupAssignment_1.default.countDocuments(),
            PickupAssignment_1.default.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            PickupAssignment_1.default.aggregate([
                { $match: { actualPickupTime: { $exists: true }, actualDeliveryTime: { $exists: true } } },
                {
                    $project: {
                        duration: { $subtract: ['$actualDeliveryTime', '$actualPickupTime'] },
                    },
                },
                { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
            ]),
        ]);
        // Daily trends
        const dailyTrends = await FoodDonation_1.default.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    quantity: { $sum: '$quantity' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        // Top donors
        const topDonors = await FoodDonation_1.default.aggregate([
            { $match: { status: { $in: ['completed', 'delivered'] } } },
            {
                $group: {
                    _id: '$donor',
                    donationCount: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                },
            },
            { $sort: { donationCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'donor',
                },
            },
            { $unwind: '$donor' },
            {
                $project: {
                    name: '$donor.name',
                    organization: '$donor.organization',
                    donationCount: 1,
                    totalQuantity: 1,
                    trustBadge: '$donor.trustBadge',
                },
            },
        ]);
        // Top volunteers
        const topVolunteers = await PickupAssignment_1.default.aggregate([
            { $match: { status: 'completed' } },
            {
                $group: {
                    _id: '$volunteer',
                    pickupCount: { $sum: 1 },
                },
            },
            { $sort: { pickupCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'volunteer',
                },
            },
            { $unwind: '$volunteer' },
            {
                $project: {
                    name: '$volunteer.name',
                    pickupCount: 1,
                    trustBadge: '$volunteer.trustBadge',
                },
            },
        ]);
        // Environmental impact
        const completedQuantity = totalQuantityDonated[0]?.total || 0;
        const environmentalImpact = {
            mealsProvided: Math.round(completedQuantity * 2),
            co2Saved: Math.round(completedQuantity * 2.5),
            waterSaved: Math.round(completedQuantity * 1000),
            landfillDiverted: Math.round(completedQuantity),
        };
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    verified: verifiedUsers,
                    byRole: usersByRole.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
                    newInPeriod: newUsersInPeriod,
                },
                donations: {
                    total: totalDonations,
                    byStatus: donationsByStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
                    byType: donationsByType,
                    inPeriod: donationsInPeriod,
                    totalQuantity: completedQuantity,
                },
                pickups: {
                    total: totalPickups,
                    byStatus: pickupsByStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
                    averageTimeMinutes: averagePickupTime[0]?.avgDuration
                        ? Math.round(averagePickupTime[0].avgDuration / 60000)
                        : null,
                },
                trends: dailyTrends,
                topDonors,
                topVolunteers,
                environmentalImpact,
                period: parseInt(period),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/analytics/audit
// @desc    Get audit logs (admin only)
// @access  Private/Admin
router.get('/audit', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { action, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
        const queryObj = {};
        if (action) {
            queryObj.action = action;
        }
        if (userId) {
            queryObj.$or = [
                { performedBy: userId },
                { targetUser: userId },
            ];
        }
        if (startDate || endDate) {
            queryObj.createdAt = {};
            if (startDate) {
                queryObj.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                queryObj.createdAt.$lte = new Date(endDate);
            }
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog_1.default.find(queryObj)
                .populate('performedBy', 'name email role')
                .populate('targetUser', 'name email role')
                .populate('targetDonation', 'foodType quantity')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            AuditLog_1.default.countDocuments(queryObj),
        ]);
        // Get action statistics
        const actionStats = await AuditLog_1.default.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({
            success: true,
            data: logs,
            stats: actionStats,
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
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map