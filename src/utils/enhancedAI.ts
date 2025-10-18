import { getChatbotResponse } from '../../services/geminiService';
import { apiClient } from './optimizedApi';
import { performanceMonitor } from './performance';

// Create a gemini service wrapper
const geminiService = {
  generateResponse: (prompt: string) => getChatbotResponse([{ sender: 'user', text: prompt }])
};

// Enhanced AI features with predictive insights and smart recommendations
export interface RelationshipInsight {
  id: string;
  category: 'communication' | 'intimacy' | 'growth' | 'conflict' | 'wellness';
  title: string;
  description: string;
  confidence: number;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  trends: {
    period: string;
    change: number;
    direction: 'improving' | 'declining' | 'stable';
  };
  createdAt: Date;
}

export interface SmartRecommendation {
  id: string;
  type: 'exercise' | 'conversation' | 'activity' | 'reading';
  title: string;
  description: string;
  reasoning: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: number; // in minutes
  benefits: string[];
  personalizedFor: 'both' | 'user' | 'partner';
  relevanceScore: number;
}

export interface RelationshipHealthScore {
  overall: number;
  dimensions: {
    communication: number;
    intimacy: number;
    trust: number;
    growth: number;
    satisfaction: number;
  };
  trends: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
  insights: RelationshipInsight[];
  recommendations: SmartRecommendation[];
  lastUpdated: Date;
}

class EnhancedAIService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  // Analyze communication patterns from journal entries and chat history
  async analyzeCommutationPatterns(userId: string, timeframe: '7d' | '30d' | '90d' = '30d'): Promise<RelationshipInsight[]> {
    const measureName = 'ai-communication-analysis';
    performanceMonitor.startMeasure(measureName);

    try {
      // Get user data from API
      const [journals, chats, checkIns] = await Promise.all([
        apiClient.get(`/journals/${userId}?timeframe=${timeframe}`),
        apiClient.get(`/chats/${userId}?timeframe=${timeframe}`),
        apiClient.get(`/check-ins/${userId}?timeframe=${timeframe}`)
      ]);

      // Prepare data for AI analysis
      const analysisData = {
        journals: journals || [],
        chats: chats || [],
        checkIns: checkIns || [],
        timeframe
      };

      // Generate AI insights using Gemini
      const prompt = this.buildCommunicationAnalysisPrompt(analysisData);
      const aiResponse = await geminiService.generateResponse(prompt);
      
      // Parse and structure the response
      const insights = this.parseInsightsFromResponse(aiResponse);
      
      return insights;
    } catch (error) {
      console.error('Communication analysis failed:', error);
      return [];
    } finally {
      performanceMonitor.endMeasure(measureName);
    }
  }

  // Generate personalized exercise recommendations
  async generateSmartRecommendations(userId: string, relationshipData: any): Promise<SmartRecommendation[]> {
    const cacheKey = `recommendations-${userId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    try {
      const prompt = this.buildRecommendationPrompt(relationshipData);
      const aiResponse = await geminiService.generateResponse(prompt);
      
      // Parse recommendations
      const recommendations = this.parseRecommendationsFromResponse(aiResponse);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      });
      
      return recommendations;
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [];
    }
  }

  // Calculate comprehensive relationship health score
  async calculateRelationshipHealth(userId: string): Promise<RelationshipHealthScore> {
    const measureName = 'ai-health-calculation';
    performanceMonitor.startMeasure(measureName);

    try {
      // Gather comprehensive relationship data
      const [
        communicationData,
        exerciseData,
        checkInData,
        journalData
      ] = await Promise.all([
        apiClient.get(`/analytics/communication/${userId}`),
        apiClient.get(`/analytics/exercises/${userId}`),
        apiClient.get(`/analytics/check-ins/${userId}`),
        apiClient.get(`/analytics/journals/${userId}`)
      ]);

      // Calculate health score using AI
      const healthPrompt = this.buildHealthScorePrompt({
        communication: communicationData,
        exercises: exerciseData,
        checkIns: checkInData,
        journals: journalData
      });

      const aiResponse = await geminiService.generateResponse(healthPrompt);
      const healthScore = this.parseHealthScoreFromResponse(aiResponse);

      // Generate insights and recommendations
      const [insights, recommendations] = await Promise.all([
        this.analyzeCommutationPatterns(userId),
        this.generateSmartRecommendations(userId, {
          communication: communicationData,
          exercises: exerciseData,
          checkIns: checkInData,
          journals: journalData
        })
      ]);

      return {
        ...healthScore,
        insights,
        recommendations,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Health calculation failed:', error);
      throw error;
    } finally {
      performanceMonitor.endMeasure(measureName);
    }
  }

  // Predictive analytics for relationship trends
  async predictRelationshipTrends(userId: string): Promise<{
    predictions: Array<{
      metric: string;
      currentValue: number;
      predictedValue: number;
      timeframe: string;
      confidence: number;
    }>;
    recommendations: string[];
  }> {
    try {
      // Get historical data
      const historicalData = await apiClient.get(`/analytics/historical/${userId}`);
      
      const predictionPrompt = this.buildPredictionPrompt(historicalData);
      const aiResponse = await geminiService.generateResponse(predictionPrompt);
      
      return this.parsePredictionsFromResponse(aiResponse);
    } catch (error) {
      console.error('Trend prediction failed:', error);
      return { predictions: [], recommendations: [] };
    }
  }

  // Smart conversation starters based on relationship context
  async generateConversationStarters(userId: string, context?: string): Promise<string[]> {
    try {
      const recentData = await apiClient.get(`/analytics/recent/${userId}`);
      
      const prompt = `Based on this couple's recent relationship data: ${JSON.stringify(recentData)}
      ${context ? `And this specific context: ${context}` : ''}
      
      Generate 5 thoughtful, personalized conversation starters that would help this couple:
      1. Connect on a deeper level
      2. Address any subtle concerns
      3. Celebrate positive trends
      4. Explore growth opportunities
      5. Have fun together
      
      Make them specific to their situation, not generic. Format as a simple JSON array of strings.`;

      const aiResponse = await geminiService.generateResponse(prompt);
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('Conversation starters generation failed:', error);
      return [
        "What's one thing I did this week that made you feel loved?",
        "What's a goal we could work on together?",
        "What's your favorite memory we've made recently?",
        "Is there anything on your mind that we should talk about?",
        "What's something new you'd like to try together?"
      ];
    }
  }

  // Private helper methods for building prompts
  private buildCommunicationAnalysisPrompt(data: any): string {
    return `Analyze this couple's communication patterns from their relationship data:
    
    Journals: ${JSON.stringify(data.journals.slice(0, 10))}
    Recent Chats: ${JSON.stringify(data.chats.slice(0, 20))}
    Check-ins: ${JSON.stringify(data.checkIns.slice(0, 10))}
    Timeframe: ${data.timeframe}
    
    Provide insights in this JSON format:
    [
      {
        "category": "communication|intimacy|growth|conflict|wellness",
        "title": "Brief insight title",
        "description": "Detailed description",
        "confidence": 0.85,
        "actionItems": ["specific action 1", "specific action 2"],
        "priority": "high|medium|low",
        "trends": {
          "period": "last 30 days",
          "change": 15,
          "direction": "improving|declining|stable"
        }
      }
    ]
    
    Focus on specific, actionable insights based on the actual data patterns.`;
  }

  private buildRecommendationPrompt(data: any): string {
    return `Based on this relationship data, generate personalized recommendations:
    
    ${JSON.stringify(data)}
    
    Return JSON array of recommendations in this format:
    [
      {
        "type": "exercise|conversation|activity|reading",
        "title": "Clear title",
        "description": "What to do",
        "reasoning": "Why this helps them specifically",
        "difficulty": 1-5,
        "estimatedTime": minutes,
        "benefits": ["benefit 1", "benefit 2"],
        "personalizedFor": "both|user|partner",
        "relevanceScore": 0.90
      }
    ]
    
    Make recommendations specific to their patterns and needs.`;
  }

  private buildHealthScorePrompt(data: any): string {
    return `Calculate relationship health score from this data:
    
    ${JSON.stringify(data)}
    
    Return JSON in this format:
    {
      "overall": 78,
      "dimensions": {
        "communication": 82,
        "intimacy": 75,
        "trust": 88,
        "growth": 70,
        "satisfaction": 80
      },
      "trends": {
        "weekly": 5,
        "monthly": 12,
        "quarterly": -3
      }
    }
    
    Base scores on actual data patterns, engagement levels, and relationship indicators.`;
  }

  private buildPredictionPrompt(data: any): string {
    return `Predict relationship trends based on historical data:
    
    ${JSON.stringify(data)}
    
    Return JSON:
    {
      "predictions": [
        {
          "metric": "Communication Quality",
          "currentValue": 78,
          "predictedValue": 85,
          "timeframe": "next 30 days",
          "confidence": 0.75
        }
      ],
      "recommendations": ["specific recommendation based on predictions"]
    }`;
  }

  // Response parsing methods
  private parseInsightsFromResponse(response: string): RelationshipInsight[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        ...insight,
        createdAt: new Date()
      }));
    } catch (error) {
      console.error('Failed to parse insights:', error);
      return [];
    }
  }

  private parseRecommendationsFromResponse(response: string): SmartRecommendation[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.map((rec: any, index: number) => ({
        id: `rec-${Date.now()}-${index}`,
        ...rec
      }));
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
      return [];
    }
  }

  private parseHealthScoreFromResponse(response: string): Omit<RelationshipHealthScore, 'insights' | 'recommendations' | 'lastUpdated'> {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse health score:', error);
      // Return default values
      return {
        overall: 70,
        dimensions: {
          communication: 70,
          intimacy: 70,
          trust: 70,
          growth: 70,
          satisfaction: 70
        },
        trends: {
          weekly: 0,
          monthly: 0,
          quarterly: 0
        }
      };
    }
  }

  private parsePredictionsFromResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse predictions:', error);
      return { predictions: [], recommendations: [] };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
export const enhancedAIService = new EnhancedAIService();

// React hooks for using enhanced AI features
export const useEnhancedAI = () => {
  return {
    analyzeCommutationPatterns: enhancedAIService.analyzeCommutationPatterns.bind(enhancedAIService),
    generateSmartRecommendations: enhancedAIService.generateSmartRecommendations.bind(enhancedAIService),
    calculateRelationshipHealth: enhancedAIService.calculateRelationshipHealth.bind(enhancedAIService),
    predictRelationshipTrends: enhancedAIService.predictRelationshipTrends.bind(enhancedAIService),
    generateConversationStarters: enhancedAIService.generateConversationStarters.bind(enhancedAIService),
    clearCache: enhancedAIService.clearCache.bind(enhancedAIService)
  };
};