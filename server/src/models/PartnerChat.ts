import mongoose, { Document, Schema } from 'mongoose';

export interface IPartnerMessage {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'emoji' | 'voice'; // Future extensibility
  editedAt?: Date;
  deletedAt?: Date;
  replyToMessageId?: mongoose.Types.ObjectId;
}

export interface IPartnerChat extends Document {
  _id: mongoose.Types.ObjectId;
  coupleId: mongoose.Types.ObjectId;
  partner1Id: mongoose.Types.ObjectId;
  partner2Id: mongoose.Types.ObjectId;
  messages: IPartnerMessage[];
  lastMessageAt: Date;
  lastMessageBy: mongoose.Types.ObjectId;
  isActive: boolean;
  totalMessages: number;
  unreadCount: {
    partner1: number;
    partner2: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const partnerMessageSchema = new Schema<IPartnerMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'emoji', 'voice'],
    default: 'text'
  },
  editedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  },
  replyToMessageId: {
    type: Schema.Types.ObjectId
  }
});

const partnerChatSchema = new Schema<IPartnerChat>({
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
  messages: [partnerMessageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessageBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  unreadCount: {
    partner1: {
      type: Number,
      default: 0
    },
    partner2: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
partnerChatSchema.index({ coupleId: 1 });
partnerChatSchema.index({ partner1Id: 1, partner2Id: 1 });
partnerChatSchema.index({ lastMessageAt: -1 });

// Update message counts automatically
partnerChatSchema.pre('save', function(next) {
  this.totalMessages = this.messages.length;
  
  // Update last message info
  if (this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageAt = lastMessage.timestamp;
    this.lastMessageBy = lastMessage.senderId;
  }
  
  // Calculate unread counts
  const partner1Unread = this.messages.filter(m => 
    m.receiverId.equals(this.partner1Id) && !m.isRead && !m.deletedAt
  ).length;
  
  const partner2Unread = this.messages.filter(m => 
    m.receiverId.equals(this.partner2Id) && !m.isRead && !m.deletedAt
  ).length;
  
  this.unreadCount = {
    partner1: partner1Unread,
    partner2: partner2Unread
  };
  
  next();
});

export const PartnerChat = mongoose.model<IPartnerChat>('PartnerChat', partnerChatSchema);