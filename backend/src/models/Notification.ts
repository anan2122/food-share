import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'donation_created'
  | 'donation_claimed'
  | 'donation_verified'
  | 'donation_expired'
  | 'pickup_assigned'
  | 'pickup_update'
  | 'pickup_completed'
  | 'assignment_cancelled'
  | 'verification_approved'
  | 'verification_rejected'
  | 'badge_earned'
  | 'system_alert'
  | 'reminder';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: Date;
  relatedDonation?: mongoose.Types.ObjectId;
  relatedPickup?: mongoose.Types.ObjectId;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'donation_created',
        'donation_claimed',
        'donation_verified',
        'donation_expired',
        'pickup_assigned',
        'pickup_update',
        'pickup_completed',
        'assignment_cancelled',
        'verification_approved',
        'verification_rejected',
        'badge_earned',
        'system_alert',
        'reminder',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    relatedDonation: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
    },
    relatedPickup: {
      type: Schema.Types.ObjectId,
      ref: 'PickupAssignment',
    },
    actionUrl: String,
    metadata: {
      type: Schema.Types.Mixed,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification: Model<INotification> = 
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
