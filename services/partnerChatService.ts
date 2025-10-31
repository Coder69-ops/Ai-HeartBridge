import api from './apiClient';

export interface PartnerMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'emoji' | 'voice';
  editedAt?: Date;
  deletedAt?: Date;
  replyToMessageId?: string;
}

export interface PartnerChatData {
  id: string;
  messages: PartnerMessage[];
  totalMessages: number;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen?: Date | null;
}

export interface PartnerChatResponse {
  chat: PartnerChatData;
  partner: PartnerInfo;
}

export interface SendMessageResponse {
  message: string;
  messageData: PartnerMessage;
  chat: {
    id: string;
    totalMessages: number;
    lastMessageAt: Date;
  };
}

/**
 * Get partner chat conversation
 */
export const getPartnerChat = async (): Promise<PartnerChatResponse> => {
  try {
    const response = await api.get('/partner-chat/conversation');
    return response.data;
  } catch (error: any) {
    console.error('Get partner chat error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve partner chat');
  }
};

/**
 * Send message to partner
 */
export const sendPartnerMessage = async (
  message: string, 
  messageType: 'text' | 'emoji' | 'voice' = 'text'
): Promise<SendMessageResponse> => {
  try {
    const response = await api.post('/partner-chat/send', {
      message,
      messageType
    });
    return response.data;
  } catch (error: any) {
    console.error('Send partner message error:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (): Promise<void> => {
  try {
    await api.put('/partner-chat/mark-read');
  } catch (error: any) {
    console.error('Mark messages as read error:', error);
    throw new Error(error.response?.data?.error || 'Failed to mark messages as read');
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get('/partner-chat/unread-count');
    return response.data.unreadCount;
  } catch (error: any) {
    console.error('Get unread count error:', error);
    return 0; // Return 0 on error to prevent UI issues
  }
};

/**
 * Delete message
 */
export const deletePartnerMessage = async (messageId: string): Promise<void> => {
  try {
    await api.delete(`/partner-chat/message/${messageId}`);
  } catch (error: any) {
    console.error('Delete partner message error:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete message');
  }
};

/**
 * Edit message
 */
export const editPartnerMessage = async (messageId: string, text: string): Promise<PartnerMessage> => {
  try {
    const response = await api.put(`/partner-chat/message/${messageId}`, { text });
    return response.data.messageData;
  } catch (error: any) {
    console.error('Edit partner message error:', error);
    throw new Error(error.response?.data?.error || 'Failed to edit message');
  }
};

/**
 * Format message timestamp for display
 */
export const formatMessageTime = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // For older messages, show date
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if message was sent by current user
 */
export const isMyMessage = (message: PartnerMessage, currentUserId: string): boolean => {
  return message.senderId === currentUserId;
};

/**
 * Check if message is deleted
 */
export const isMessageDeleted = (message: PartnerMessage): boolean => {
  return !!message.deletedAt;
};

/**
 * Check if message is edited
 */
export const isMessageEdited = (message: PartnerMessage): boolean => {
  return !!message.editedAt;
};

/**
 * Check partner online presence
 */
export const checkPartnerPresence = async (partnerId: string): Promise<{ isOnline: boolean; lastSeen?: Date | null }> => {
  try {
    const response = await api.get(`/partner-chat/presence/${partnerId}`);
    return response.data;
  } catch (error: any) {
    console.error('Check partner presence error:', error);
    return { isOnline: false, lastSeen: null }; // Return offline on error
  }
};

/**
 * Get message status text
 */
export const getMessageStatus = (message: PartnerMessage, isMyMsg: boolean): string => {
  if (isMessageDeleted(message)) return 'Deleted';
  if (isMessageEdited(message)) return 'Edited';
  if (isMyMsg && message.isRead) return 'Read';
  if (isMyMsg && !message.isRead) return 'Sent';
  return '';
};