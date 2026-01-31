import mongoose, { Document, Model } from 'mongoose';
export type FoodType = 'cooked_meals' | 'raw_vegetables' | 'fruits' | 'dairy' | 'bakery' | 'packaged' | 'beverages' | 'other';
export type FoodStatus = 'pending' | 'verified' | 'available' | 'claimed' | 'assigned' | 'in_transit' | 'delivered' | 'completed' | 'expired' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export interface IFoodDonation extends Document {
    _id: mongoose.Types.ObjectId;
    donor: mongoose.Types.ObjectId;
    foodType: FoodType;
    description: string;
    quantity: number;
    unit: string;
    expiryDate: Date;
    preparationDate?: Date;
    storageCondition: 'room_temperature' | 'refrigerated' | 'frozen';
    allergens?: string[];
    dietaryInfo?: string[];
    pickupAddress: string;
    pickupLocation?: {
        type: 'Point';
        coordinates: [number, number];
    };
    pickupInstructions?: string;
    availableFrom: Date;
    availableUntil: Date;
    urgencyLevel: UrgencyLevel;
    status: FoodStatus;
    images?: string[];
    safetyChecklist: {
        properStorage: boolean;
        temperatureControlled: boolean;
        hygieneStandards: boolean;
        noContamination: boolean;
        properPackaging: boolean;
    };
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    verificationNotes?: string;
    claimedBy?: mongoose.Types.ObjectId;
    claimedAt?: Date;
    completedAt?: Date;
    recipientFeedback?: {
        rating: number;
        comment: string;
        receivedInGoodCondition: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const FoodDonation: Model<IFoodDonation>;
export default FoodDonation;
//# sourceMappingURL=FoodDonation.d.ts.map