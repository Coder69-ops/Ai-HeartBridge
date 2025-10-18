import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  pairingCode: string;
  coupleId?: mongoose.Types.ObjectId;
  
  // Personal Information
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  location?: string;
  dateOfBirth?: Date;
  
  // Relationship Information
  relationshipStatus?: string;
  relationshipDuration?: string;
  livingTogether?: boolean;
  hasChildren?: boolean;
  childrenAges?: number[];
  anniversaryDate?: Date;
  
  // Goals and Aspirations
  primaryGoals?: string[];
  relationshipChallenges?: string[];
  strengthsAsCouple?: string[];
  areasForGrowth?: string[];
  futureVision?: string;
  
  // Communication & Therapy
  communicationStyle?: string;
  conflictResolutionStyle?: string;
  loveLanguages?: string[];
  therapyHistory?: string;
  
  // Mental Health & Wellness
  mentalHealthHistory?: string;
  stressLevel?: number;
  wellnessGoals?: string[];
  
  // Support System
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  supportSystem?: string[];
  
  // Interests & Values
  interests?: string[];
  values?: string[];
  dealBreakers?: string[];
  
  // App Preferences
  preferredSessionLength?: number;
  preferredTimeOfDay?: string;
  reminderFrequency?: string;
  privacyLevel?: string;
  notificationSettings?: {
    dailyCheckins: boolean;
    exerciseReminders: boolean;
    partnerUpdates: boolean;
    weeklyReports: boolean;
  };
  
  // Onboarding & Status
  isOnboardingComplete?: boolean;
  onboardingCompletedAt?: Date;
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  pairingCode: {
    type: String,
    required: true,
    uppercase: true,
    length: 6
  },
  coupleId: {
    type: Schema.Types.ObjectId,
    ref: 'Couple',
    default: null
  },
  
  // Personal Information
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  age: { type: Number, min: 18, max: 120 },
  gender: { type: String, trim: true },
  location: { type: String, trim: true },
  dateOfBirth: { type: Date },
  
  // Relationship Information
  relationshipStatus: { type: String, trim: true },
  relationshipDuration: { type: String, trim: true },
  livingTogether: { type: Boolean, default: false },
  hasChildren: { type: Boolean, default: false },
  childrenAges: [{ type: Number }],
  anniversaryDate: { type: Date },
  
  // Goals and Aspirations
  primaryGoals: [{ type: String, trim: true }],
  relationshipChallenges: [{ type: String, trim: true }],
  strengthsAsCouple: [{ type: String, trim: true }],
  areasForGrowth: [{ type: String, trim: true }],
  futureVision: { type: String, trim: true },
  
  // Communication & Therapy
  communicationStyle: { type: String, trim: true },
  conflictResolutionStyle: { type: String, trim: true },
  loveLanguages: [{ type: String, trim: true }],
  therapyHistory: { type: String, trim: true },
  
  // Mental Health & Wellness
  mentalHealthHistory: { type: String, trim: true },
  stressLevel: { type: Number, min: 1, max: 10 },
  wellnessGoals: [{ type: String, trim: true }],
  
  // Support System
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  supportSystem: [{ type: String, trim: true }],
  
  // Interests & Values
  interests: [{ type: String, trim: true }],
  values: [{ type: String, trim: true }],
  dealBreakers: [{ type: String, trim: true }],
  
  // App Preferences
  preferredSessionLength: { type: Number, min: 5, max: 120, default: 30 },
  preferredTimeOfDay: { type: String, trim: true, default: 'evening' },
  reminderFrequency: { type: String, trim: true, default: 'daily' },
  privacyLevel: { type: String, trim: true, default: 'private' },
  notificationSettings: {
    dailyCheckins: { type: Boolean, default: true },
    exerciseReminders: { type: Boolean, default: true },
    partnerUpdates: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true }
  },
  
  // Onboarding & Status
  isOnboardingComplete: { type: Boolean, default: false },
  onboardingCompletedAt: { type: Date },
  
  // System fields
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance - unique indexes for email and pairingCode
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ pairingCode: 1 }, { unique: true });
userSchema.index({ coupleId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);