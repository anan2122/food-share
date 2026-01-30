import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

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

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'volunteer', 'admin'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    organization: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    trustBadge: {
      type: String,
      enum: ['none', 'bronze', 'silver', 'gold', 'platinum'],
      default: 'none',
    },
    trustScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    responseRate: {
      type: Number,
      min: 0,
      max: 1,
    },
    completedDonations: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationDate: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: String,
    volunteerInfo: {
      availability: {
        type: Map,
        of: {
          available: Boolean,
          startTime: String,
          endTime: String,
        },
      },
      preferredAreas: [String],
      hasVehicle: Boolean,
      vehicleType: String,
      maxDistance: Number,
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
UserSchema.index({ 'location': '2dsphere' });
UserSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
