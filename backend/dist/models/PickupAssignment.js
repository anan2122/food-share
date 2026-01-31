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
const PickupAssignmentSchema = new mongoose_1.Schema({
    donation: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'FoodDonation',
        required: [true, 'Donation is required'],
        index: true,
    },
    donor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor is required'],
        index: true,
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required'],
        index: true,
    },
    volunteer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    status: {
        type: String,
        enum: ['assigned', 'accepted', 'in_transit', 'picked_up', 'delivering', 'delivered', 'completed', 'cancelled'],
        default: 'assigned',
        index: true,
    },
    scheduledPickupTime: {
        type: Date,
        required: [true, 'Scheduled pickup time is required'],
    },
    scheduledDeliveryTime: Date,
    actualPickupTime: Date,
    actualDeliveryTime: Date,
    route: {
        pickupLocation: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: [Number],
        },
        deliveryLocation: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: [Number],
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: [Number],
        },
        estimatedDistance: Number,
        estimatedDuration: Number,
        waypoints: [{
                type: {
                    type: String,
                    enum: ['Point'],
                },
                coordinates: [Number],
                reachedAt: Date,
            }],
    },
    pickupInstructions: String,
    deliveryInstructions: String,
    notes: String,
    pickupVerification: {
        verifiedAt: Date,
        photoUrl: String,
        signature: String,
        condition: {
            type: String,
            enum: ['good', 'acceptable', 'poor'],
        },
        notes: String,
    },
    deliveryVerification: {
        verifiedAt: Date,
        photoUrl: String,
        signature: String,
        receivedBy: String,
        condition: {
            type: String,
            enum: ['good', 'acceptable', 'poor'],
        },
        notes: String,
    },
    volunteerRating: {
        byDonor: { type: Number, min: 1, max: 5 },
        byRecipient: { type: Number, min: 1, max: 5 },
        comments: String,
    },
}, {
    timestamps: true,
});
// Indexes
PickupAssignmentSchema.index({ volunteer: 1, status: 1 });
PickupAssignmentSchema.index({ 'route.pickupLocation': '2dsphere' });
PickupAssignmentSchema.index({ 'route.deliveryLocation': '2dsphere' });
const PickupAssignment = mongoose_1.default.models.PickupAssignment || mongoose_1.default.model('PickupAssignment', PickupAssignmentSchema);
exports.default = PickupAssignment;
//# sourceMappingURL=PickupAssignment.js.map