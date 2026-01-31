import mongoose, { Document, Model } from 'mongoose';
export type PickupStatus = 'assigned' | 'accepted' | 'in_transit' | 'picked_up' | 'delivering' | 'delivered' | 'completed' | 'cancelled';
export interface IPickupAssignment extends Document {
    _id: mongoose.Types.ObjectId;
    donation: mongoose.Types.ObjectId;
    donor: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    volunteer?: mongoose.Types.ObjectId;
    status: PickupStatus;
    scheduledPickupTime: Date;
    scheduledDeliveryTime?: Date;
    actualPickupTime?: Date;
    actualDeliveryTime?: Date;
    route: {
        pickupLocation: {
            type: 'Point';
            coordinates: [number, number];
        };
        deliveryLocation: {
            type: 'Point';
            coordinates: [number, number];
        };
        currentLocation?: {
            type: 'Point';
            coordinates: [number, number];
        };
        estimatedDistance?: number;
        estimatedDuration?: number;
        waypoints?: Array<{
            type: 'Point';
            coordinates: [number, number];
            reachedAt?: Date;
        }>;
    };
    pickupInstructions?: string;
    deliveryInstructions?: string;
    notes?: string;
    pickupVerification?: {
        verifiedAt: Date;
        photoUrl?: string;
        signature?: string;
        condition: 'good' | 'acceptable' | 'poor';
        notes?: string;
    };
    deliveryVerification?: {
        verifiedAt: Date;
        photoUrl?: string;
        signature?: string;
        receivedBy?: string;
        condition: 'good' | 'acceptable' | 'poor';
        notes?: string;
    };
    volunteerRating?: {
        byDonor?: number;
        byRecipient?: number;
        comments?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const PickupAssignment: Model<IPickupAssignment>;
export default PickupAssignment;
//# sourceMappingURL=PickupAssignment.d.ts.map