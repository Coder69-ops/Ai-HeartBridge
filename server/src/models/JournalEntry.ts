import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface IAnalysisResult {
  summary: string;
  strengths: string[];
  opportunities: string[];
  fourHorsemen: {
    criticism: boolean;
    contempt: boolean;
    defensiveness: boolean;
    stonewalling: boolean;
  };
  repairPlan: string[];
  riskFlags: string[];
  safetyMode: boolean;
}

export interface IJournalEntry extends Document {
  _id: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  partner1Id: mongoose.Types.ObjectId;
  partner2Id: mongoose.Types.ObjectId;
  partner1Chat: IMessage[];
  partner2Chat: IMessage[];
  analysis?: IAnalysisResult;
  isCompleted: boolean;
  completedBy: mongoose.Types.ObjectId[];
  topic?: string;
  emotions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const analysisResultSchema = new Schema<IAnalysisResult>({
  summary: {
    type: String,
    required: true,
    maxlength: 1000
  },
  strengths: [{
    type: String,
    maxlength: 500
  }],
  opportunities: [{
    type: String,
    maxlength: 500
  }],
  fourHorsemen: {
    criticism: { type: Boolean, default: false },
    contempt: { type: Boolean, default: false },
    defensiveness: { type: Boolean, default: false },
    stonewalling: { type: Boolean, default: false }
  },
  repairPlan: [{
    type: String,
    maxlength: 500
  }],
  riskFlags: [{
    type: String,
    maxlength: 200
  }],
  safetyMode: {
    type: Boolean,
    default: false
  }
});

const journalEntrySchema = new Schema<IJournalEntry>({
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
  partner1Chat: [messageSchema],
  partner2Chat: [messageSchema],
  analysis: analysisResultSchema,
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  topic: {
    type: String,
    maxlength: 200
  },
  emotions: [{
    type: String,
    maxlength: 50
  }]
}, {
  timestamps: true
});

// Indexes
journalEntrySchema.index({ coupleId: 1, createdAt: -1 });
journalEntrySchema.index({ partner1Id: 1, createdAt: -1 });
journalEntrySchema.index({ partner2Id: 1, createdAt: -1 });

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);