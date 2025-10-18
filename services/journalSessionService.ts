import api from './apiClient';

export interface JournalMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface JournalSession {
  id: string;
  title: string;
  messages?: JournalMessage[];
  partner1Chat: JournalMessage[];
  partner2Chat: JournalMessage[];
  isActive: boolean;
  isClosed: boolean;
  lastMessageAt: Date;
  wordCount: number;
  messageCount: number;
  mood?: string;
  themes: string[];
  summary?: string;
  sessionDurationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  insights?: string;
}

export interface JournalSessionListResponse {
  sessions: JournalSession[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  stats: {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalWordCount: number;
  };
}

export interface JournalSessionResponse {
  session: JournalSession;
}

/**
 * Create a new journal session (thread)
 */
export const createJournalSession = async (): Promise<{ session: JournalSession }> => {
  try {
    const response = await api.post('/journal-sessions/create');
    return response.data;
  } catch (error: any) {
    console.error('Create journal session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to create journal session');
  }
};

/**
 * Get list of journal sessions (thread view)
 */
export const getJournalSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'all';
}): Promise<JournalSessionListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get(`/journal-sessions/list?${queryParams.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Get journal sessions error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve journal sessions');
  }
};

/**
 * Get specific journal session with messages
 */
export const getJournalSession = async (sessionId: string): Promise<JournalSessionResponse> => {
  try {
    const response = await api.get(`/journal-sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get journal session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve journal session');
  }
};

/**
 * Save journal session with both partners' messages
 */
export const saveJournalSession = async (
  sessionId: string,
  partner1Messages: JournalMessage[],
  partner2Messages: JournalMessage[],
  insights?: string
): Promise<JournalSessionResponse> => {
  try {
    const response = await api.post(`/journal-sessions/${sessionId}/save`, {
      partner1Chat: partner1Messages,
      partner2Chat: partner2Messages,
      insights,
      completedAt: new Date(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Save journal session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to save journal session');
  }
};

/**
 * Close journal session
 */
export const closeJournalSession = async (sessionId: string): Promise<JournalSessionResponse> => {
  try {
    const response = await api.post(`/journal-sessions/${sessionId}/close`);
    return response.data;
  } catch (error: any) {
    console.error('Close journal session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to close journal session');
  }
};

/**
 * Delete journal session
 */
export const deleteJournalSession = async (sessionId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/journal-sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    console.error('Delete journal session error:', error);
    throw new Error(error.response?.data?.error || 'Failed to delete journal session');
  }
};

/**
 * Get journal insights/summary
 */
export const getJournalInsights = async (sessionId: string): Promise<{ insights: string }> => {
  try {
    const response = await api.get(`/journal-sessions/${sessionId}/insights`);
    return response.data;
  } catch (error: any) {
    console.error('Get journal insights error:', error);
    throw new Error(error.response?.data?.error || 'Failed to retrieve journal insights');
  }
};
