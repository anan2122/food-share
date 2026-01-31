import mongoose, { Document, Model } from 'mongoose';
export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone: string;
    organization?: string;
    address: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    };
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    trustBadge: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    trustScore: number;
    responseRate?: number;
    completedDonations: number;
    isVerified: boolean;
    isActive: boolean;
    verificationDate?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
    adminNotes?: string;
    volunteerInfo?: {
        availability?: Record<string, {
            available: boolean;
            startTime: string;
            endTime: string;
        }>;
        preferredAreas?: string[];
        hasVehicle?: boolean;
        vehicleType?: string;
        maxDistance?: number;
    };
    preferences?: {
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        language?: string;
    };
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map