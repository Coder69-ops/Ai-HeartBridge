import api from './apiClient';

export interface RelationshipTrends {
  timeframe: string;
  csiScores: {
    type: string;
    averageScore: number;
    partner1Score: number;
    partner2Score: number;
    createdAt: string;
  }[];
  journalEntries: {
    date: string;
    fourHorsemen: {
      criticism: boolean;
      contempt: boolean;
      defensiveness: boolean;
      stonewalling: boolean;
    } | null;
  }[];
  fourHorsemenStats: {
    criticism: number;
    contempt: number;
    defensiveness: number;
    stonewalling: number;
    total: number;
  };
  exerciseStats: {
    [category: string]: {
      count: number;
      averageRating: number;
      totalRating: number;
    };
  };
  summary: {
    totalJournals: number;
    totalCheckIns: number;
    totalExercises: number;
    latestCSI: any;
  };
}

export interface HealthScore {
  healthScore: number;
  healthLevel: string;
  scoreComponents: {
    satisfaction: number;
    engagement: number;
    communication: number;
  };
  recommendations: string[];
  lastUpdated: string;
}

// Get relationship trends
export const getRelationshipTrends = async (timeframe = '6months'): Promise<RelationshipTrends> => {
  try {
    const response = await api.get(`/analytics/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error: any) {
    // Don't retry for 400/404 errors (likely unpaired user)
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log('Relationship trends not available (likely unpaired user)');
      throw new Error('Trends not available');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch relationship trends');
  }
};

// Get relationship health score
export const getHealthScore = async (): Promise<HealthScore> => {
  try {
    const response = await api.get('/analytics/health-score');
    return response.data;
  } catch (error: any) {
    // Don't retry for 400/404 errors (likely unpaired user)
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log('Health score not available (likely unpaired user)');
      throw new Error('Health score not available');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch health score');
  }
};