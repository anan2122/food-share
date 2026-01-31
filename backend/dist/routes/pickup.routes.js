"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const PickupAssignment_1 = __importDefault(require("../models/PickupAssignment"));
const FoodDonation_1 = __importDefault(require("../models/FoodDonation"));
const Notification_1 = __importDefault(require("../models/Notification"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// @route   GET /api/pickups
// @desc    Get pickups (filtered by role)
// @access  Private
router.get('/', auth_1.protect, async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const queryObj = {};
        // Role-based filtering
        if (req.user?.role === 'volunteer') {
            queryObj.volunteer = req.user._id;
        }
        else if (req.user?.role === 'donor') {
            queryObj.donor = req.user._id;
        }
        else if (req.user?.role === 'ngo') {
            queryObj.recipient = req.user._id;
        }
        if (status) {
            queryObj.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [pickups, total] = await Promise.all([
            PickupAssignment_1.default.find(queryObj)
                .populate('donation', 'foodType quantity unit description')
                .populate('donor', 'name organization phone address')
                .populate('recipient', 'name organization phone address')
                .populate('volunteer', 'name phone')
                .sort({ scheduledPickupTime: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            PickupAssignment_1.default.countDocuments(queryObj),
        ]);
        res.json({
            success: true,
            data: pickups,
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
// @route   GET /api/pickups/available
// @desc    Get unassigned pickups for volunteers
// @access  Private/Volunteer
router.get('/available', auth_1.protect, (0, auth_1.authorize)('volunteer', 'admin'), async (req, res, next) => {
    try {
        const pickups = await PickupAssignment_1.default.find({
            volunteer: { $exists: false },
            status: 'assigned',
        })
            .populate('donation', 'foodType quantity unit urgencyLevel expiryDate')
            .populate('donor', 'name organization address')
            .populate('recipient', 'name organization address')
            .sort({ scheduledPickupTime: 1 })
            .lean();
        res.json({
            success: true,
            data: pickups,
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/pickups/:id
// @desc    Get pickup by ID
// @access  Private
router.get('/:id', auth_1.protect, async (req, res, next) => {
    try {
        const pickup = await PickupAssignment_1.default.findById(req.params.id)
            .populate('donation')
            .populate('donor', 'name organization phone address')
            .populate('recipient', 'name organization phone address')
            .populate('volunteer', 'name phone')
            .lean();
        if (!pickup) {
            throw new errorHandler_1.ApiError(404, 'Pickup assignment not found');
        }
        // Check authorization
        const isAuthorized = req.user?.role === 'admin' ||
            pickup.volunteer?._id?.toString() === req.user?._id.toString() ||
            pickup.donor?._id?.toString() === req.user?._id.toString() ||
            pickup.recipient?._id?.toString() === req.user?._id.toString();
        if (!isAuthorized) {
            throw new errorHandler_1.ApiError(403, 'Not authorized to view this pickup');
        }
        res.json({
            success: true,
            data: pickup,
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   POST /api/pickups/:id/accept
// @desc    Volunteer accepts pickup
// @access  Private/Volunteer
router.post('/:id/accept', auth_1.protect, (0, auth_1.authorize)('volunteer'), async (req, res, next) => {
    try {
        const pickup = await PickupAssignment_1.default.findById(req.params.id);
        if (!pickup) {
            throw new errorHandler_1.ApiError(404, 'Pickup assignment not found');
        }
        if (pickup.volunteer) {
            throw new errorHandler_1.ApiError(400, 'Pickup already has a volunteer assigned');
        }
        pickup.volunteer = req.user?._id;
        pickup.status = 'accepted';
        await pickup.save();
        // Update donation status
        await FoodDonation_1.default.findByIdAndUpdate(pickup.donation, {
            status: 'assigned',
        });
        // Notify donor and recipient
        const notifications = [
            Notification_1.default.create({
                user: pickup.donor,
                type: 'pickup_assigned',
                title: 'Volunteer Assigned',
                message: `A volunteer has been assigned to pick up your donation`,
                relatedDonation: pickup.donation,
                relatedPickup: pickup._id,
            }),
            Notification_1.default.create({
                user: pickup.recipient,
                type: 'pickup_assigned',
                title: 'Pickup Scheduled',
                message: `A volunteer will pick up your requested food`,
                relatedDonation: pickup.donation,
                relatedPickup: pickup._id,
            }),
        ];
        await Promise.all(notifications);
        // Create audit log
        await AuditLog_1.default.create({
            action: 'PICKUP_ASSIGNED',
            performedBy: req.user?._id,
            targetPickup: pickup._id,
            targetDonation: pickup.donation,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            message: 'Pickup accepted successfully',
            data: pickup,
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   PATCH /api/pickups/:id/status
// @desc    Update pickup status
// @access  Private/Volunteer
router.patch('/:id/status', auth_1.protect, (0, auth_1.authorize)('volunteer', 'admin'), [
    (0, express_validator_1.body)('status').isIn(['in_transit', 'picked_up', 'delivering', 'delivered', 'completed'])
        .withMessage('Invalid status'),
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ApiError(400, errors.array().map(e => e.msg).join(', '));
        }
        const { status, gpsLocation, notes } = req.body;
        const pickup = await PickupAssignment_1.default.findById(req.params.id);
        if (!pickup) {
            throw new errorHandler_1.ApiError(404, 'Pickup assignment not found');
        }
        // Check authorization
        if (req.user?.role !== 'admin' &&
            pickup.volunteer?.toString() !== req.user?._id.toString()) {
            throw new errorHandler_1.ApiError(403, 'Not authorized to update this pickup');
        }
        // Valid status transitions
        const validTransitions = {
            accepted: ['in_transit'],
            in_transit: ['picked_up'],
            picked_up: ['delivering'],
            delivering: ['delivered'],
            delivered: ['completed'],
        };
        if (!validTransitions[pickup.status]?.includes(status)) {
            throw new errorHandler_1.ApiError(400, `Cannot transition from ${pickup.status} to ${status}`);
        }
        // Update pickup
        pickup.status = status;
        if (gpsLocation) {
            pickup.route.currentLocation = {
                type: 'Point',
                coordinates: [gpsLocation.lng, gpsLocation.lat],
            };
        }
        if (notes) {
            pickup.notes = notes;
        }
        if (status === 'picked_up') {
            pickup.actualPickupTime = new Date();
        }
        if (status === 'delivered') {
            pickup.actualDeliveryTime = new Date();
        }
        await pickup.save();
        // Update donation status
        const donationStatus = {
            in_transit: 'in_transit',
            picked_up: 'in_transit',
            delivering: 'in_transit',
            delivered: 'delivered',
            completed: 'completed',
        };
        if (donationStatus[status]) {
            await FoodDonation_1.default.findByIdAndUpdate(pickup.donation, {
                status: donationStatus[status],
                ...(status === 'completed' && { completedAt: new Date() }),
            });
        }
        // Update volunteer stats if completed
        if (status === 'completed') {
            await User_1.default.findByIdAndUpdate(pickup.volunteer, {
                $inc: { completedDonations: 1 },
            });
        }
        // Send real-time update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`pickup-${pickup._id}`).emit('pickup-status-update', {
                pickupId: pickup._id,
                status,
                location: gpsLocation,
            });
            // Also notify users
            io.to(`user-${pickup.donor}`).emit('notification', {
                type: 'pickup_update',
                message: `Pickup status: ${status}`,
            });
            io.to(`user-${pickup.recipient}`).emit('notification', {
                type: 'pickup_update',
                message: `Delivery status: ${status}`,
            });
        }
        // Create notifications
        const notificationMessages = {
            in_transit: 'Volunteer is on the way',
            picked_up: 'Food has been picked up',
            delivering: 'Food is being delivered',
            delivered: 'Food has been delivered',
            completed: 'Pickup completed successfully',
        };
        if (notificationMessages[status]) {
            await Promise.all([
                Notification_1.default.create({
                    user: pickup.donor,
                    type: 'pickup_update',
                    title: 'Pickup Update',
                    message: notificationMessages[status],
                    relatedDonation: pickup.donation,
                    relatedPickup: pickup._id,
                }),
                Notification_1.default.create({
                    user: pickup.recipient,
                    type: 'pickup_update',
                    title: 'Delivery Update',
                    message: notificationMessages[status],
                    relatedDonation: pickup.donation,
                    relatedPickup: pickup._id,
                }),
            ]);
        }
        // Create audit log
        await AuditLog_1.default.create({
            action: 'PICKUP_UPDATED',
            performedBy: req.user?._id,
            targetPickup: pickup._id,
            targetDonation: pickup.donation,
            details: { status, gpsLocation },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            data: pickup,
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   POST /api/pickups/:id/location
// @desc    Update volunteer location (real-time tracking)
// @access  Private/Volunteer
router.post('/:id/location', auth_1.protect, (0, auth_1.authorize)('volunteer'), async (req, res, next) => {
    try {
        const { lat, lng } = req.body;
        const pickup = await PickupAssignment_1.default.findById(req.params.id);
        if (!pickup) {
            throw new errorHandler_1.ApiError(404, 'Pickup assignment not found');
        }
        if (pickup.volunteer?.toString() !== req.user?._id.toString()) {
            throw new errorHandler_1.ApiError(403, 'Not authorized');
        }
        pickup.route.currentLocation = {
            type: 'Point',
            coordinates: [lng, lat],
        };
        await pickup.save();
        // Send real-time update via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`pickup-${pickup._id}`).emit('volunteer-location', { lat, lng });
        }
        res.json({
            success: true,
            message: 'Location updated',
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   DELETE /api/pickups/:id
// @desc    Cancel pickup
// @access  Private/Admin
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const pickup = await PickupAssignment_1.default.findById(req.params.id);
        if (!pickup) {
            throw new errorHandler_1.ApiError(404, 'Pickup assignment not found');
        }
        if (['delivered', 'completed'].includes(pickup.status)) {
            throw new errorHandler_1.ApiError(400, 'Cannot cancel completed pickup');
        }
        pickup.status = 'cancelled';
        await pickup.save();
        // Revert donation status
        await FoodDonation_1.default.findByIdAndUpdate(pickup.donation, {
            status: 'available',
            claimedBy: null,
            claimedAt: null,
        });
        // Notify relevant parties
        const notifications = [];
        if (pickup.volunteer) {
            notifications.push(Notification_1.default.create({
                user: pickup.volunteer,
                type: 'assignment_cancelled',
                title: 'Pickup Cancelled',
                message: 'Your pickup assignment has been cancelled',
                relatedDonation: pickup.donation,
            }));
        }
        notifications.push(Notification_1.default.create({
            user: pickup.donor,
            type: 'system_alert',
            title: 'Pickup Cancelled',
            message: 'The pickup for your donation has been cancelled',
            relatedDonation: pickup.donation,
        }));
        await Promise.all(notifications);
        // Create audit log
        await AuditLog_1.default.create({
            action: 'PICKUP_CANCELLED',
            performedBy: req.user?._id,
            targetPickup: pickup._id,
            targetDonation: pickup.donation,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
        });
        res.json({
            success: true,
            message: 'Pickup cancelled successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
// @route   GET /api/pickups/volunteers/available
// @desc    Get available volunteers for assignment
// @access  Private/Admin
router.get('/volunteers/available', auth_1.protect, (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        const dayOfWeek = targetDate.getDay();
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days[dayOfWeek];
        const volunteers = await User_1.default.find({
            role: 'volunteer',
            isActive: true,
            isVerified: true,
        })
            .select('name phone volunteerInfo address trustBadge completedDonations')
            .lean();
        // Filter and score volunteers
        const availableVolunteers = volunteers
            .filter((v) => {
            const availability = v.volunteerInfo?.availability;
            if (!availability)
                return true; // If no availability set, consider available
            const dayAvailability = availability[targetDay];
            return dayAvailability?.available !== false;
        })
            .map((v) => {
            let score = 0;
            const reasons = [];
            // Trust badge
            const badgeScores = {
                platinum: 25,
                gold: 20,
                silver: 15,
                bronze: 10,
                none: 0,
            };
            score += badgeScores[v.trustBadge] || 0;
            // Experience
            if (v.completedDonations > 20) {
                score += 20;
                reasons.push('Highly experienced');
            }
            else if (v.completedDonations > 10) {
                score += 15;
                reasons.push('Experienced');
            }
            // Has vehicle
            if (v.volunteerInfo?.hasVehicle) {
                score += 15;
                reasons.push('Has vehicle');
            }
            return {
                id: v._id,
                name: v.name,
                phone: v.phone,
                hasVehicle: v.volunteerInfo?.hasVehicle,
                preferredAreas: v.volunteerInfo?.preferredAreas,
                trustBadge: v.trustBadge,
                completedPickups: v.completedDonations,
                matchScore: score,
                matchReasons: reasons,
            };
        });
        availableVolunteers.sort((a, b) => b.matchScore - a.matchScore);
        res.json({
            success: true,
            data: availableVolunteers,
            targetDay,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=pickup.routes.js.map