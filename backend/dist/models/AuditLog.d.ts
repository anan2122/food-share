import mongoose, { Document, Model } from 'mongoose';
export type AuditAction = 'USER_REGISTERED' | 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_VERIFIED' | 'USER_REJECTED' | 'USER_UPDATED' | 'USER_DEACTIVATED' | 'VERIFICATION_REVOKED' | 'DONATION_CREATED' | 'DONATION_UPDATED' | 'DONATION_VERIFIED' | 'DONATION_CLAIMED' | 'DONATION_CANCELLED' | 'DONATION_COMPLETED' | 'PICKUP_ASSIGNED' | 'PICKUP_UPDATED' | 'PICKUP_COMPLETED' | 'PICKUP_CANCELLED' | 'ADMIN_ACTION' | 'SYSTEM_EVENT';
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
declare const AuditLog: Model<IAuditLog>;
export default AuditLog;
//# sourceMappingURL=AuditLog.d.ts.map