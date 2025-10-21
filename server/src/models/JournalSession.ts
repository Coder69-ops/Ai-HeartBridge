import mongoose, { Document, Schema } from 'mongoose';

export interface IJournalMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export enum JournalSessionStatus {
  CREATED = 'created',
  PARTNER1_COMPLETE = 'partner1_complete',
  PARTNER2_COMPLETE = 'partner2_complete',
  ANALYSIS_PENDING = 'analysis_pending',
  INSIGHTS_READY = 'insights_ready',
  CLOSED = 'closed'
}

export interface IJournalSession extends Document {
  _id: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  title: string;
  partner1Chat: IJournalMessage[];
  partner2Chat: IJournalMessage[];
  isActive: boolean;
  isClosed: boolean;
  status: JournalSessionStatus;
  lastMessageAt: Date;
  wordCount: number;
  messageCount: number;
  mood?: string;
  themes: string[];
  summary?: string;
  insights?: string;
  sessionDurationMinutes?: number;
  completedAt?: Date;
  partner1CompletedAt?: Date;
  partner2CompletedAt?: Date;
  analysisRequestedAt?: Date;
  insightsGeneratedAt?: Date;
  notificationSent: {
    partner1Complete: boolean;
    partner2Complete: boolean;
    insightsReady: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const journalMessageSchema = new Schema<IJournalMessage>({
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

const journalSessionSchema = new Schema<IJournalSession>({
  coupleId: {
    type: Schema.Types.ObjectId,
    ref: 'Couple',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    default: 'New Journal Session'
  },
  partner1Chat: [journalMessageSchema],
  partner2Chat: [journalMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(JournalSessionStatus),
    default: JournalSessionStatus.CREATED
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  wordCount: {
    type: Number,
    default: 0
  },
  messageCount: {
    type: Number,
    default: 0
  },
  mood: {
    type: String,
    maxlength: 50
  },
  themes: [{
    type: String,
    maxlength: 100
  }],
  summary: {
    type: String,
    maxlength: 1000
  },
  insights: {
    type: String,
    maxlength: 5000
  },
  sessionDurationMinutes: {
    type: Number,
    min: 0
  },
  completedAt: {
    type: Date
  },
  partner1CompletedAt: {
    type: Date
  },
  partner2CompletedAt: {
    type: Date
  },
  analysisRequestedAt: {
    type: Date
  },
  insightsGeneratedAt: {
    type: Date
  },
  notificationSent: {
    partner1Complete: { type: Boolean, default: false },
    partner2Complete: { type: Boolean, default: false },
    insightsReady: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for performance
journalSessionSchema.index({ coupleId: 1, createdAt: -1 });
journalSessionSchema.index({ coupleId: 1, isActive: 1 });
journalSessionSchema.index({ coupleId: 1, isClosed: 1, lastMessageAt: -1 });
journalSessionSchema.index({ coupleId: 1, status: 1 });
journalSessionSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware
journalSessionSchema.pre('save', function(next) {
  // Generate automatic title based on first user message
  if (this.isNew && (this.partner1Chat.length > 0 || this.partner2Chat.length > 0)) {
    const firstUserMessage = [...this.partner1Chat, ...this.partner2Chat]
      .find(m => m.sender === 'user');
    
    if (firstUserMessage && this.title === 'New Journal Session') {
      // Create title from first 5-7 words of first message
      const words = firstUserMessage.text.trim().split(/\s+/).slice(0, 6);
      this.title = words.join(' ') + (firstUserMessage.text.trim().split(/\s+/).length > 6 ? '...' : '');
    }
  }
  
  // Update word count
  const allUserMessages = [...this.partner1Chat, ...this.partner2Chat]
    .filter(m => m.sender === 'user');
  
  this.wordCount = allUserMessages.reduce((total, msg) => {
    const words = msg.text.trim().split(/\s+/).filter(word => word.length > 0);
    return total + words.length;
  }, 0);
  
  // Update message count
  this.messageCount = this.partner1Chat.length + this.partner2Chat.length;
  
  // Update last message timestamp
  const allMessages = [...this.partner1Chat, ...this.partner2Chat];
  if (allMessages.length > 0) {
    const lastMessage = allMessages[allMessages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
  }
  
  next();
});

export const JournalSession = mongoose.model<IJournalSession>('JournalSession', journalSessionSchema);
