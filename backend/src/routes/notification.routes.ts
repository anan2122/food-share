import { Router, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { ApiError } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { unread, page = 1, limit = 20 } = req.query;

    const queryObj: Record<string, unknown> = {
      user: req.user?._id,
    };

    if (unread === 'true') {
      queryObj.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(queryObj)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Notification.countDocuments(queryObj),
      Notification.countDocuments({ user: req.user?._id, isRead: false }),
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
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/notifications/read
// @desc    Mark notifications as read
// @access  Private
router.patch('/read', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { notificationIds, markAllRead } = req.body;

    if (markAllRead) {
      await Notification.updateMany(
        { user: req.user?._id, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, user: req.user?._id },
        { isRead: true, readAt: new Date() }
      );

      return res.json({
        success: true,
        message: 'Notifications marked as read',
      });
    }

    throw new ApiError(400, 'No notifications specified');
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Notification.deleteMany({ user: req.user?._id });

    res.json({
      success: true,
      message: 'All notifications deleted',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
