import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction =
  | 'USER_REGISTERED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_VERIFIED'
  | 'USER_REJECTED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'VERIFICATION_REVOKED'
  | 'DONATION_CREATED'
  | 'DONATION_UPDATED'
  | 'DONATION_VERIFIED'
  | 'DONATION_CLAIMED'
  | 'DONATION_CANCELLED'
  | 'DONATION_COMPLETED'
  | 'PICKUP_ASSIGNED'
  | 'PICKUP_UPDATED'
  | 'PICKUP_COMPLETED'
  | 'PICKUP_CANCELLED'
  | 'ADMIN_ACTION'
  | 'SYSTEM_EVENT';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: AuditAction;
  performedBy: mongoose.Types.ObjectId;
  targetUser?: mongoose.Types.ObjectId;
  targetDonation?: mongoose.Types.ObjectId;
  targetPickup?: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: [
        'USER_REGISTERED',
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_VERIFIED',
        'USER_REJECTED',
        'USER_UPDATED',
        'USER_DEACTIVATED',
        'VERIFICATION_REVOKED',
        'DONATION_CREATED',
        'DONATION_UPDATED',
        'DONATION_VERIFIED',
        'DONATION_CLAIMED',
        'DONATION_CANCELLED',
        'DONATION_COMPLETED',
        'PICKUP_ASSIGNED',
        'PICKUP_UPDATED',
        'PICKUP_COMPLETED',
        'PICKUP_CANCELLED',
        'ADMIN_ACTION',
        'SYSTEM_EVENT',
      ],
      required: [true, 'Action is required'],
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performer is required'],
      index: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    targetDonation: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
    },
    targetPickup: {
      type: Schema.Types.ObjectId,
      ref: 'PickupAssignment',
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });

const AuditLog: Model<IAuditLog> = 
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
