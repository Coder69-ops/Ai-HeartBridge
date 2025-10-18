import mongoose, { Document, Schema } from 'mongoose';

export interface ICouple extends Document {
  _id: mongoose.Types.ObjectId;
  partner1Id: mongoose.Types.ObjectId;
  partner2Id: mongoose.Types.ObjectId;
  relationshipStart?: Date;
  status: 'active' | 'paused' | 'inactive';
  sharedGoals: string[];
  createdAt: Date;
  updatedAt: Date;
}

const coupleSchema = new Schema<ICouple>({
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
  relationshipStart: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'inactive'],
    default: 'active'
  },
  sharedGoals: [{
    type: String,
    maxlength: 500
  }]
}, {
  timestamps: true
});

// Ensure unique pairing
coupleSchema.index({ partner1Id: 1, partner2Id: 1 }, { unique: true });

export const Couple = mongoose.model<ICouple>('Couple', coupleSchema);