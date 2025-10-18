import api from './apiClient';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages?: ChatMessage[];
  isActive: boolean;
  isClosed: boolean;
  lastMessageAt: Date;
  wordCount: number;
  messageCount: number;
  mood?: string;
  topics: string[];
  summary?: string;
  sessionDurationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
  timeSinceLastMessage?: number;
}

export interface ChatSessionListResponse {
  sessions: ChatSession[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats: {
    totalSessions: number;
    activeSessions: number;
    closedSessions: number;
  };
}

export interface ChatSessionResponse {
  session: ChatSession;
}

export interface MessageResponse {
  message: string;
  userMessage: ChatMessage;
  botMessage: ChatMessage;
  session: {
    id: string;
    title: string;
    isActive: boolean;
    isClosed: boolean;
    messageCount: number;
    wordCount: number;
    lastMessageAt: Date;
  };
}

/**
 * Create a new chat session
 */
export const createChatSession = async (): Promise<{ session: ChatSession }> => {
  try {
    const response = await api.post('/chat-sessions/create');
    return response.data;
  } catch (error: any) {
    console.error('Create chat session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to create chat session');
  }
};

/**
 * Get list of chat sessions (thread view)
 */
export const getChatSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'closed' | 'all';
}): Promise<ChatSessionListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/chat-sessions/list?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Get chat sessions error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve chat sessions');
  }
};

/**
 * Get specific chat session with messages
 */
export const getChatSession = async (sessionId: string): Promise<ChatSessionResponse> => {
  try {
    const response = await api.get(`/chat-sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get chat session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve chat session');
  }
};

/**
 * Send message to chat session
 */
export const sendMessage = async (sessionId: string, message: string): Promise<MessageResponse> => {
  try {
    const response = await api.post(`/chat-sessions/${sessionId}/message`, { message });
    return response.data;
  } catch (error: any) {
    console.error('Send message error:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

/**
 * Close chat session
 */
export const closeChatSession = async (sessionId: string): Promise<{ session: ChatSession }> => {
  try {
    const response = await api.put(`/chat-sessions/${sessionId}/close`);
    return response.data;
  } catch (error: any) {
    console.error('Close chat session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to close chat session');
  }
};

/**
 * Reopen closed chat session
 */
export const reopenChatSession = async (sessionId: string): Promise<{ session: ChatSession }> => {
  try {
    const response = await api.put(`/chat-sessions/${sessionId}/reopen`);
    return response.data;
  } catch (error: any) {
    console.error('Reopen chat session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to reopen chat session');
  }
};

/**
 * Update chat session title
 */
export const updateChatSessionTitle = async (sessionId: string, title: string): Promise<{ session: ChatSession }> => {
  try {
    const response = await api.put(`/chat-sessions/${sessionId}/title`, { title });
    return response.data;
  } catch (error: any) {
    console.error('Update title error:', error);
    throw new Error(error.response?.data?.error || 'Failed to update title');
  }
};

/**
 * Delete chat session
 */
export const deleteChatSession = async (sessionId: string): Promise<void> => {
  try {
    await api.delete(`/chat-sessions/${sessionId}`);
  } catch (error: any) {
    console.error('Delete chat session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete chat session');
  }
};

/**
 * Format time since last message for display
 */
export const formatTimeSince = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

/**
 * Get mood emoji for session
 */
export const getMoodEmoji = (mood?: string): string => {
  if (!mood) return '💭';
  
  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    excited: '🤗',
    frustrated: '😤',
    peaceful: '😌',
    confused: '😕',
    hopeful: '🌟',
    stressed: '😰'
  };
  
  return moodEmojis[mood.toLowerCase()] || '💭';
};