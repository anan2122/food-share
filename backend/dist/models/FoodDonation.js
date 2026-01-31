"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FoodDonationSchema = new mongoose_1.Schema({
    donor: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    verifiedAt: Date,
    verificationNotes: String,
    claimedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
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
    }
    else if (hoursUntilExpiry <= 6) {
        this.urgencyLevel = 'high';
    }
    else if (hoursUntilExpiry <= 12) {
        this.urgencyLevel = 'medium';
    }
    else {
        this.urgencyLevel = 'low';
    }
    next();
});
const FoodDonation = mongoose_1.default.models.FoodDonation || mongoose_1.default.model('FoodDonation', FoodDonationSchema);
exports.default = FoodDonation;
//# sourceMappingURL=FoodDonation.js.map