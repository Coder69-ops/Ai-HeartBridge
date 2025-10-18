import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  isActive: boolean;
  isClosed: boolean;
  lastMessageAt: Date;
  summary?: string;
  mood?: string;
  topics: string[];
  wordCount: number;
  sessionDurationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
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

const chatSessionSchema = new Schema<IChatSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    default: 'New Chat Session'
  },
  messages: [chatMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    maxlength: 500
  },
  mood: {
    type: String,
    maxlength: 50
  },
  topics: [{
    type: String,
    maxlength: 100
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  sessionDurationMinutes: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });
chatSessionSchema.index({ userId: 1, isClosed: 1, lastMessageAt: -1 });

// Generate automatic title based on first user message
chatSessionSchema.pre('save', function(next) {
  if (this.isNew && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(m => m.sender === 'user');
    if (firstUserMessage && this.title === 'New Chat Session') {
      // Create title from first 5-7 words of first message
      const words = firstUserMessage.text.trim().split(/\s+/).slice(0, 6);
      this.title = words.join(' ') + (firstUserMessage.text.trim().split(/\s+/).length > 6 ? '...' : '');
    }
  }
  
  // Update word count
  const userMessages = this.messages.filter(m => m.sender === 'user');
  this.wordCount = userMessages.reduce((total, msg) => {
    const words = msg.text.trim().split(/\s+/).filter(word => word.length > 0);
    return total + words.length;
  }, 0);
  
  // Update last message timestamp
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
  }
  
  next();
});

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);