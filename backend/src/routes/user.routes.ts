import { Router, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import User from '../models/User';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';
import { ApiError } from '../middleware/errorHandler';
import { protect, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get(
  '/',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { role, status, search, page = 1, limit = 20 } = req.query;

      const queryObj: Record<string, unknown> = {};

      if (role && role !== 'all') {
        queryObj.role = role;
      }

      if (status === 'verified') {
        queryObj.isVerified = true;
      } else if (status === 'pending') {
        queryObj.isVerified = false;
      } else if (status === 'inactive') {
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
        User.find(queryObj)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        User.countDocuments(queryObj),
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get(
  '/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id).select('-password').lean();

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put(
  '/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { isActive, isVerified, trustBadge, adminNotes } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (isActive !== undefined) user.isActive = isActive;
      if (isVerified !== undefined) {
        user.isVerified = isVerified;
        if (isVerified) {
          user.verificationDate = new Date();
          user.verifiedBy = req.user?._id;
        }
      }
      if (trustBadge) user.trustBadge = trustBadge;
      if (adminNotes) user.adminNotes = adminNotes;

      await user.save();

      // Create audit log
      await AuditLog.create({
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/users/:id
// @desc    Deactivate user (admin only)
// @access  Private/Admin
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Don't allow deleting self
      if (user._id.toString() === req.user?._id.toString()) {
        throw new ApiError(400, 'Cannot deactivate your own account');
      }

      user.isActive = false;
      await user.save();

      // Create audit log
      await AuditLog.create({
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/users/:id/verify
// @desc    Verify or reject user
// @access  Private/Admin
router.post(
  '/:id/verify',
  protect,
  authorize('admin'),
  [
    body('action').isIn(['approve', 'reject', 'revoke']).withMessage('Invalid action'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(e => e.msg).join(', '));
      }

      const { action, reason, notes } = req.body;

      const user = await User.findById(req.params.id);

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      let notificationMessage = '';
      let auditAction: 'USER_VERIFIED' | 'USER_REJECTED' | 'VERIFICATION_REVOKED' = 'USER_VERIFIED';

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
      await Notification.create({
        user: user._id,
        type: action === 'approve' ? 'verification_approved' : 'verification_rejected',
        title: action === 'approve' ? 'Account Verified' : 'Verification Update',
        message: notificationMessage,
        priority: 'high',
      });

      // Create audit log
      await AuditLog.create({
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/users/verifications/pending
// @desc    Get pending verifications
// @access  Private/Admin
router.get(
  '/verifications/pending',
  protect,
  authorize('admin'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const users = await User.find({ isVerified: false, isActive: true })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
