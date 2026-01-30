import mongoose, { Schema, Document, Model } from 'mongoose';

export type FoodType = 
  | 'cooked_meals'
  | 'raw_vegetables'
  | 'fruits'
  | 'dairy'
  | 'bakery'
  | 'packaged'
  | 'beverages'
  | 'other';

export type FoodStatus =
  | 'pending'
  | 'verified'
  | 'available'
  | 'claimed'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'expired'
  | 'cancelled';

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
  
  // Safety and verification
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
  
  // Claiming
  claimedBy?: mongoose.Types.ObjectId;
  claimedAt?: Date;
  
  // Completion
  completedAt?: Date;
  recipientFeedback?: {
    rating: number;
    comment: string;
    receivedInGoodCondition: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const FoodDonationSchema = new Schema<IFoodDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
      index: true,
    },
    foodType: {
      type: String,
      enum: ['cooked_meals', 'raw_vegetables', 'fruits', 'dairy', 'bakery', 'packaged', 'beverages', 'other'],
      required: [true, 'Food type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'liters', 'pieces', 'servings', 'boxes', 'packets'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    preparationDate: Date,
    storageCondition: {
      type: String,
      enum: ['room_temperature', 'refrigerated', 'frozen'],
      required: [true, 'Storage condition is required'],
    },
    allergens: [String],
    dietaryInfo: [String],
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    pickupInstructions: String,
    availableFrom: {
      type: Date,
      required: [true, 'Available from time is required'],
    },
    availableUntil: {
      type: Date,
      required: [true, 'Available until time is required'],
    },
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'available', 'claimed', 'assigned', 'in_transit', 'delivered', 'completed', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    images: [String],
    safetyChecklist: {
      properStorage: { type: Boolean, default: false },
      temperatureControlled: { type: Boolean, default: false },
      hygieneStandards: { type: Boolean, default: false },
      noContamination: { type: Boolean, default: false },
      properPackaging: { type: Boolean, default: false },
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationNotes: String,
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    claimedAt: Date,
    completedAt: Date,
    recipientFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      receivedInGoodCondition: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
FoodDonationSchema.index({ status: 1, expiryDate: 1 });
FoodDonationSchema.index({ donor: 1, status: 1 });
FoodDonationSchema.index({ claimedBy: 1, status: 1 });
FoodDonationSchema.index({ 'pickupLocation': '2dsphere' });

// Calculate urgency before save
FoodDonationSchema.pre('save', function (next) {
  const hoursUntilExpiry = (this.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60);
  
  if (hoursUntilExpiry <= 2) {
    this.urgencyLevel = 'critical';
  } else if (hoursUntilExpiry <= 6) {
    this.urgencyLevel = 'high';
  } else if (hoursUntilExpiry <= 12) {
    this.urgencyLevel = 'medium';
  } else {
    this.urgencyLevel = 'low';
  }
  
  next();
});

const FoodDonation: Model<IFoodDonation> = 
  mongoose.models.FoodDonation || mongoose.model<IFoodDonation>('FoodDonation', FoodDonationSchema);

export default FoodDonation;
