import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn extends Document {
  _id: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  partner1Id: mongoose.Types.ObjectId;
  partner2Id: mongoose.Types.ObjectId;
  type: 'CSI-4' | 'CSI-16' | 'weekly' | 'monthly';
  partner1Responses: number[];
  partner2Responses: number[];
  partner1Score?: number;
  partner2Score?: number;
  averageScore?: number;
  isCompleted: boolean;
  completedBy: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const checkInSchema = new Schema<ICheckIn>({
  coupleId: {
    type: Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  partner1Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner2Id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['CSI-4', 'CSI-16', 'weekly', 'monthly'],
    required: true
  },
  partner1Responses: [{
    type: Number,
    min: 0,
    max: 6
  }],
  partner2Responses: [{
    type: Number,
    min: 0,
    max: 6
  }],
  partner1Score: {
    type: Number,
    min: 0,
    max: 30
  },
  partner2Score: {
    type: Number,
    min: 0,
    max: 30
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 30
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Indexes
checkInSchema.index({ coupleId: 1, createdAt: -1 });
checkInSchema.index({ type: 1, createdAt: -1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', checkInSchema);