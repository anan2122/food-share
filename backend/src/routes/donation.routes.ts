import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import FoodDonation from '../models/FoodDonation';
import PickupAssignment from '../models/PickupAssignment';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';
import User from '../models/User';
import { ApiError } from '../middleware/errorHandler';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/donations
// @desc    Get donations (with filters)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      foodType,
      urgency,
      myDonations,
      myClaims,
      page = 1,
      limit = 20,
    } = req.query;

    const queryObj: Record<string, unknown> = {};

    // Role-based filtering
    if (myDonations === 'true' && req.user?.role === 'donor') {
      queryObj.donor = req.user._id;
    } else if (myClaims === 'true' && req.user?.role === 'ngo') {
      queryObj.claimedBy = req.user._id;
    } else if (req.user?.role === 'ngo') {
      // NGOs see available donations
      queryObj.status = { $in: ['available', 'verified'] };
      queryObj.expiryDate = { $gt: new Date() };
    }

    if (status) {
      queryObj.status = status;
    }

    if (foodType) {
      queryObj.foodType = foodType;
    }

    if (urgency) {
      queryObj.urgencyLevel = urgency;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [donations, total] = await Promise.all([
      FoodDonation.find(queryObj)
        .populate('donor', 'name organization phone trustBadge')
        .populate('claimedBy', 'name organization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      FoodDonation.countDocuments(queryObj),
    ]);

    res.json({
      success: true,
      data: donations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/donations
// @desc    Create new donation
// @access  Private/Donor
router.post(
  '/',
  protect,
  authorize('donor', 'admin'),
  [
    body('foodType').notEmpty().withMessage('Food type is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('quantity').isNumeric().withMessage('Quantity must be a number'),
    body('unit').notEmpty().withMessage('Unit is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    body('storageCondition').notEmpty().withMessage('Storage condition is required'),
    body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
    body('availableFrom').isISO8601().withMessage('Available from date is required'),
    body('availableUntil').isISO8601().withMessage('Available until date is required'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(e => e.msg).join(', '));
      }

      const donation = await FoodDonation.create({
        ...req.body,
        donor: req.user?._id,
        status: 'pending',
      });

      // Create audit log
      await AuditLog.create({
        action: 'DONATION_CREATED',
        performedBy: req.user?._id,
        targetDonation: donation._id,
        details: { foodType: donation.foodType, quantity: donation.quantity },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(201).json({
        success: true,
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donation = await FoodDonation.findById(req.params.id)
      .populate('donor', 'name organization phone address trustBadge')
      .populate('claimedBy', 'name organization phone')
      .populate('verifiedBy', 'name')
      .lean();

    if (!donation) {
      throw new ApiError(404, 'Donation not found');
    }

    res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private/Owner
router.put('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      throw new ApiError(404, 'Donation not found');
    }

    // Only owner or admin can update
    if (
      donation.donor.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      throw new ApiError(403, 'Not authorized to update this donation');
    }

    // Can't update if already claimed
    if (['claimed', 'in_transit', 'delivered', 'completed'].includes(donation.status)) {
      throw new ApiError(400, 'Cannot update donation that has been claimed');
    }

    const updatedDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('donor', 'name organization');

    // Create audit log
    await AuditLog.create({
      action: 'DONATION_UPDATED',
      performedBy: req.user?._id,
      targetDonation: donation._id,
      details: { changes: req.body },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      data: updatedDonation,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/donations/:id
// @desc    Cancel donation
// @access  Private/Owner
router.delete('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const donation = await FoodDonation.findById(req.params.id);

    if (!donation) {
      throw new ApiError(404, 'Donation not found');
    }

    // Only owner or admin can delete
    if (
      donation.donor.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      throw new ApiError(403, 'Not authorized to delete this donation');
    }

    if (['in_transit', 'delivered', 'completed'].includes(donation.status)) {
      throw new ApiError(400, 'Cannot cancel donation in progress');
    }

    donation.status = 'cancelled';
    await donation.save();

    // Create audit log
    await AuditLog.create({
      action: 'DONATION_CANCELLED',
      performedBy: req.user?._id,
      targetDonation: donation._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Donation cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/donations/:id/claim
// @desc    Claim a donation (NGO)
// @access  Private/NGO
router.post(
  '/:id/claim',
  protect,
  authorize('ngo'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const donation = await FoodDonation.findById(req.params.id);

      if (!donation) {
        throw new ApiError(404, 'Donation not found');
      }

      if (!['available', 'verified'].includes(donation.status)) {
        throw new ApiError(400, 'Donation is not available for claiming');
      }

      if (new Date(donation.expiryDate) < new Date()) {
        throw new ApiError(400, 'Donation has expired');
      }

      // Update donation
      donation.status = 'claimed';
      donation.claimedBy = req.user?._id;
      donation.claimedAt = new Date();
      await donation.save();

      // Create pickup assignment
      const pickup = await PickupAssignment.create({
        donation: donation._id,
        donor: donation.donor,
        recipient: req.user?._id,
        status: 'assigned',
        scheduledPickupTime: donation.availableFrom,
        route: {
          pickupLocation: donation.pickupLocation,
        },
        pickupInstructions: donation.pickupInstructions,
      });

      // Notify donor
      await Notification.create({
        user: donation.donor,
        type: 'donation_claimed',
        title: 'Donation Claimed',
        message: `Your ${donation.foodType} donation has been claimed by ${req.user?.organization || req.user?.name}`,
        relatedDonation: donation._id,
        relatedPickup: pickup._id,
        priority: 'high',
      });

      // Create audit log
      await AuditLog.create({
        action: 'DONATION_CLAIMED',
        performedBy: req.user?._id,
        targetDonation: donation._id,
        details: { ngoId: req.user?._id },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        success: true,
        message: 'Donation claimed successfully',
        data: {
          donation,
          pickup,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/donations/:id/verify
// @desc    Verify donation (Admin)
// @access  Private/Admin
router.post(
  '/:id/verify',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { approved, notes } = req.body;

      const donation = await FoodDonation.findById(req.params.id);

      if (!donation) {
        throw new ApiError(404, 'Donation not found');
      }

      if (approved) {
        donation.status = 'available';
        donation.verifiedBy = req.user?._id;
        donation.verifiedAt = new Date();
        donation.verificationNotes = notes;
      } else {
        donation.status = 'cancelled';
        donation.verificationNotes = notes;
      }

      await donation.save();

      // Notify donor
      await Notification.create({
        user: donation.donor,
        type: approved ? 'donation_verified' : 'system_alert',
        title: approved ? 'Donation Verified' : 'Donation Not Approved',
        message: approved
          ? 'Your donation has been verified and is now visible to NGOs'
          : `Your donation was not approved. Reason: ${notes || 'Not specified'}`,
        relatedDonation: donation._id,
        priority: approved ? 'medium' : 'high',
      });

      // Create audit log
      await AuditLog.create({
        action: 'DONATION_VERIFIED',
        performedBy: req.user?._id,
        targetDonation: donation._id,
        details: { approved, notes },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({
        success: true,
        message: approved ? 'Donation verified' : 'Donation rejected',
        data: donation,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/donations/match/:id
// @desc    Get matching NGOs for a donation
// @access  Private/Admin
router.get(
  '/match/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const donation = await FoodDonation.findById(req.params.id);

      if (!donation) {
        throw new ApiError(404, 'Donation not found');
      }

      // Find matching NGOs
      const ngos = await User.find({
        role: 'ngo',
        isActive: true,
        isVerified: true,
      }).lean();

      // Score each NGO
      const scoredNGOs = ngos.map((ngo) => {
        let score = 0;
        const reasons: string[] = [];

        // Trust badge scoring
        const badgeScores: Record<string, number> = {
          platinum: 25,
          gold: 20,
          silver: 15,
          bronze: 10,
          none: 0,
        };
        score += badgeScores[ngo.trustBadge] || 0;
        if (ngo.trustBadge !== 'none') {
          reasons.push(`${ngo.trustBadge} trust badge`);
        }

        // Response rate
        if (ngo.responseRate && ngo.responseRate > 0.8) {
          score += 20;
          reasons.push('High response rate');
        }

        // Experience
        if (ngo.completedDonations > 10) {
          score += 15;
          reasons.push('Experienced recipient');
        }

        return {
          id: ngo._id,
          name: ngo.name,
          organization: ngo.organization,
          trustBadge: ngo.trustBadge,
          completedDonations: ngo.completedDonations,
          matchScore: score,
          matchReasons: reasons,
        };
      });

      scoredNGOs.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: {
          donation: {
            id: donation._id,
            foodType: donation.foodType,
            quantity: donation.quantity,
            urgencyLevel: donation.urgencyLevel,
          },
          matches: scoredNGOs.slice(0, 10),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
