import api from './apiClient';

export interface CheckIn {
  id: string;
  type: 'CSI-4' | 'CSI-16' | 'weekly' | 'monthly';
  partner1Responses: number[];
  partner2Responses: number[];
  partner1Score?: number;
  partner2Score?: number;
  averageScore?: number;
  isCompleted: boolean;
  completedBy: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInWithQuestions extends CheckIn {
  questions: string[];
}

// Create new check-in
export const createCheckIn = async (type: 'CSI-4' | 'CSI-16' | 'weekly' | 'monthly'): Promise<CheckInWithQuestions> => {
  try {
    const response = await api.post('/checkins/create', { type });
    return response.data.checkIn;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to create check-in');
  }
};

// Submit check-in responses
export const submitCheckInResponses = async (
  checkInId: string,
  responses: number[],
  notes?: string
): Promise<{ score: number; isCompleted: boolean }> => {
  try {
    const response = await api.put(`/checkins/${checkInId}/submit`, {
      responses,
      notes
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to submit check-in responses');
  }
};

// Get check-in details
export const getCheckIn = async (checkInId: string): Promise<CheckInWithQuestions> => {
  try {
    const response = await api.get(`/checkins/${checkInId}`);
    return { ...response.data.checkIn, questions: response.data.questions };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch check-in');
  }
};

// Get couple's check-in history
export const getCoupleCheckInHistory = async (
  page = 1,
  limit = 10,
  type?: string
): Promise<{
  checkIns: CheckIn[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  try {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);

    const response = await api.get(`/checkins/couple/history?${params}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch check-in history');
  }
};