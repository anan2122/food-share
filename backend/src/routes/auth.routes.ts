import { Router, Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { ApiError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// Generate JWT Token
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const options: SignOptions = { expiresIn: '7d' };
  return jwt.sign({ id, role }, secret, options);
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').isIn(['donor', 'ngo', 'volunteer']).withMessage('Valid role is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(e => e.msg).join(', '));
      }

      const { email, password, name, role, phone, organization, address } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
      }

      // Create user
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        name,
        role,
        phone,
        organization,
        address,
      });

      // Create audit log
      await AuditLog.create({
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(e => e.msg).join(', '));
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      if (!user.isActive) {
        throw new ApiError(401, 'Your account has been deactivated');
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create audit log
      await AuditLog.create({
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
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
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
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/password
// @desc    Update password
// @access  Private
router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array().map(e => e.msg).join(', '));
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user?._id).select('+password');

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        throw new ApiError(400, 'Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, organization, address, preferences, volunteerInfo } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (organization) user.organization = organization;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
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
  } catch (error) {
    next(error);
  }
});

export default router;
