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

export interface CheckInType {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  questions: string[];
  scoring: {
    min: number;
    max: number;
    interpretation: {
      high: { min: number; label: string; description: string };
      moderate: { min: number; max: number; label: string; description: string };
      low: { max: number; label: string; description: string };
    };
  };
}

export interface CheckInStats {
  totalCheckIns: number;
  completedCheckIns: number;
  completionRate: number;
  byType: Array<{
    _id: string;
    count: number;
    completed: number;
    averageScore: number;
    lastCompleted: string | null;
  }>;
}

// Get available check-in types
export const getCheckInTypes = async (): Promise<CheckInType[]> => {
  try {
    const response = await api.get('/checkins/types');
    return response.data.types;
  } catch (error: any) {
    console.error('Failed to fetch check-in types:', error);
    throw new Error(error.therapeuticMessage || error.response?.data?.error || 'Unable to load assessment types right now. Please try again in a moment. 💚');
  }
};

// Create new check-in
export const createCheckIn = async (type: 'CSI-4' | 'CSI-16' | 'weekly' | 'monthly'): Promise<CheckInWithQuestions> => {
  try {
    const response = await api.post('/checkins/create', { type });
    return response.data.checkIn;
  } catch (error: any) {
    console.error('Failed to create check-in:', error);
    
    // Provide therapeutic error messages based on error type
    if (error.response?.status === 400 && error.response?.data?.error?.includes('paired')) {
      throw new Error('You need to be connected with your partner first to begin an assessment together. Let\'s get you paired! 💕');
    } else if (error.response?.status === 404) {
      throw new Error('We couldn\'t find your relationship connection. Please check your pairing status or contact support for help. 🤗');
    } else {
      throw new Error(error.therapeuticMessage || error.response?.data?.error || 'We\'re having trouble starting your assessment right now. Please take a moment and try again. 🌱');
    }
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
    
    console.log('💚 Check-in responses submitted successfully');
    return response.data;
  } catch (error: any) {
    console.error('Failed to submit check-in responses:', error);
    
    // Provide therapeutic error messages
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.error || '';
      if (errorMsg.includes('responses')) {
        throw new Error('It looks like some questions weren\'t answered yet. Please make sure to respond to each question - your thoughts matter! 💙');
      } else if (errorMsg.includes('Expected')) {
        throw new Error('We noticed a mismatch in your responses. Please refresh and try again - sometimes a fresh start helps! 🌱');
      }
    } else if (error.response?.status === 403) {
      throw new Error('This assessment seems to belong to someone else. Please make sure you\'re working on your own check-in. 🤗');
    } else if (error.response?.status === 404) {
      throw new Error('We can\'t find this assessment anymore. It might have been removed. Let\'s start a new one together! ✨');
    }
    
    throw new Error(error.therapeuticMessage || 'We\'re having trouble saving your responses right now. Don\'t worry - your progress is important to us, and we\'ll keep trying. 💚');
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
    console.error('Failed to fetch check-in history:', error);
    throw new Error(error.therapeuticMessage || error.response?.data?.error || 'We\'re having trouble loading your relationship journey history. Your progress is safely stored and we\'ll try again. 📚');
  }
};

// Get check-in statistics
export const getCheckInStats = async (): Promise<CheckInStats> => {
  try {
    const response = await api.get('/checkins/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch check-in stats:', error);
    throw new Error(error.therapeuticMessage || error.response?.data?.error || 'We\'re having trouble loading your relationship insights right now. Your growth data is safe! 📊');
  }
};