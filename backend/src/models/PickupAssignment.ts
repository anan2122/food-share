import mongoose, { Schema, Document, Model } from 'mongoose';

export type PickupStatus = 
  | 'assigned'
  | 'accepted'
  | 'in_transit'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface IPickupAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  donation: mongoose.Types.ObjectId;
  donor: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  volunteer?: mongoose.Types.ObjectId;
  status: PickupStatus;
  
  // Schedule
  scheduledPickupTime: Date;
  scheduledDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  
  // Route information
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
  
  // Instructions
  pickupInstructions?: string;
  deliveryInstructions?: string;
  notes?: string;
  
  // Verification
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
  
  // Rating
  volunteerRating?: {
    byDonor?: number;
    byRecipient?: number;
    comments?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const PickupAssignmentSchema = new Schema<IPickupAssignment>(
  {
    donation: {
      type: Schema.Types.ObjectId,
      ref: 'FoodDonation',
      required: [true, 'Donation is required'],
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    volunteer: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
PickupAssignmentSchema.index({ volunteer: 1, status: 1 });
PickupAssignmentSchema.index({ 'route.pickupLocation': '2dsphere' });
PickupAssignmentSchema.index({ 'route.deliveryLocation': '2dsphere' });

const PickupAssignment: Model<IPickupAssignment> = 
  mongoose.models.PickupAssignment || mongoose.model<IPickupAssignment>('PickupAssignment', PickupAssignmentSchema);

export default PickupAssignment;
