import mongoose, { Document, Model } from 'mongoose';
export type NotificationType = 'donation_created' | 'donation_claimed' | 'donation_verified' | 'donation_expired' | 'pickup_assigned' | 'pickup_update' | 'pickup_completed' | 'assignment_cancelled' | 'verification_approved' | 'verification_rejected' | 'badge_earned' | 'system_alert' | 'reminder';
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
declare const Notification: Model<INotification>;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map