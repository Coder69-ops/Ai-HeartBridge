import { Exercise } from '../types';
import { getHealthScore, getRelationshipTrends, HealthScore, RelationshipTrends } from './analyticsService';
import { getCoupleCheckInHistory } from './checkInService';
import { getJournalSessionHistory } from './journalSessionService';
import { getExercises } from './exerciseService';

export interface BridgeRecommendation {
  exercise: Exercise;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'urgent' | 'improvement' | 'maintenance' | 'growth';
  matchScore: number; // 0-100
  insights: string[];
  benefits: string[];
}

export interface RecommendationAnalysis {
  recommendations: BridgeRecommendation[];
  userInsights: {
    healthStatus: string;
    primaryConcerns: string[];
    strengths: string[];
    trendAnalysis: string;
  };
  recommendationSummary: {
    totalRecommendations: number;
    highPriority: number;
    categoriesAdressed: string[];
    estimatedImpact: string;
  };
}

class BridgeRecommendationEngine {
  private exercises: Exercise[] = [];
  private healthScore: HealthScore | null = null;
  private trends: RelationshipTrends | null = null;
  private recentCheckIns: any[] = [];
  private recentJournals: any[] = [];

  async initialize(): Promise<void> {
    try {
      // Load all necessary data
      this.exercises = await getExercises();
      
      try {
        this.healthScore = await getHealthScore();
      } catch (error) {
        console.log('Health score not available');
      }

      try {
        this.trends = await getRelationshipTrends();
      } catch (error) {
        console.log('Trends not available');
      }

      try {
        const checkInData = await getCoupleCheckInHistory();
        this.recentCheckIns = checkInData.checkIns || [];
      } catch (error) {
        console.log('Check-ins not available');
        this.recentCheckIns = [];
      }

      try {
        this.recentJournals = await getJournalSessionHistory();
      } catch (error) {
        console.log('Journal sessions not available');
      }
    } catch (error) {
      console.error('Failed to initialize recommendation engine:', error);
    }
  }

  async getPersonalizedRecommendations(): Promise<RecommendationAnalysis> {
    await this.initialize();

    const recommendations: BridgeRecommendation[] = [];
    
    // Analyze health score patterns
    if (this.healthScore) {
      recommendations.push(...this.getHealthScoreRecommendations());
    }

    // Analyze trend patterns
    if (this.trends) {
      recommendations.push(...this.getTrendBasedRecommendations());
    }

    // Analyze recent activity patterns
    recommendations.push(...this.getActivityBasedRecommendations());

    // Analyze Four Horsemen patterns
    if (this.trends?.fourHorsemenStats) {
      recommendations.push(...this.getFourHorsemenRecommendations());
    }

    // Filter out null recommendations and remove duplicates
    const validRecommendations = recommendations.filter(rec => rec !== null) as BridgeRecommendation[];
    const uniqueRecommendations = this.deduplicateRecommendations(validRecommendations);
    const sortedRecommendations = uniqueRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.matchScore - a.matchScore;
      })
      .slice(0, 8); // Limit to top 8 recommendations

    return {
      recommendations: sortedRecommendations,
      userInsights: this.generateUserInsights(),
      recommendationSummary: this.generateSummary(sortedRecommendations),
    };
  }

  private getHealthScoreRecommendations(): BridgeRecommendation[] {
    if (!this.healthScore) return [];

    const recommendations: BridgeRecommendation[] = [];
    const { healthScore, scoreComponents } = this.healthScore;

    // Critical health score - immediate intervention needed
    if (healthScore < 40) {
      const gentleStartup = this.findExerciseByTitle('Gentle Start') || this.findExerciseByCategory('Conflict');
      if (gentleStartup) {
        const recommendation = this.createRecommendation(gentleStartup.id, 'high', 'urgent', 95, [
            'Your relationship health score is critically low',
            'Gentle communication is essential for immediate improvement',
          ], [
            'Reduces defensiveness and criticism',
            'Creates safer space for difficult conversations',
            'Immediate improvement in communication quality',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }

      const pauseTechnique = this.findExerciseByTitle('Pause') || this.findExerciseByCategory('Conflict');
      if (pauseTechnique) {
        const recommendation = this.createRecommendation(pauseTechnique.id, 'high', 'urgent', 90, [
            'Frequent conflicts may be escalating destructively',
            'Learning to pause prevents relationship damage',
          ], [
            'Prevents destructive argument patterns',
            'Allows emotions to regulate before discussion',
            'Protects relationship during high stress',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // Low satisfaction component
    if (scoreComponents.satisfaction < 50) {
      const appreciationExercise = this.findExerciseByTitle('Appreciation') || this.findExerciseByCategory('Connection');
      if (appreciationExercise) {
        const recommendation = this.createRecommendation(appreciationExercise.id, 'high', 'improvement', 85, [
            'Satisfaction scores indicate need for more positive interactions',
            'Daily appreciation can quickly improve relationship sentiment',
          ], [
            'Builds positive sentiment override',
            'Increases daily connection moments',
            'Counters negativity bias in relationships',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }

      const celebrationExercise = this.findExerciseByTitle('Celebration') || this.findExerciseByCategory('Fun');
      if (celebrationExercise) {
        const recommendation = this.createRecommendation(celebrationExercise.id, 'medium', 'improvement', 75, [
            'Creating more positive shared experiences needed',
            'Celebrating together builds relationship joy',
          ], [
            'Increases positive shared memories',
            'Builds culture of appreciation',
            'Enhances relationship satisfaction',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // Low engagement component
    if (scoreComponents.engagement < 50) {
      const loveMapExercise = this.findExerciseByTitle('Love Map') || this.findExerciseByCategory('Intimacy');
      if (loveMapExercise) {
        const recommendation = this.createRecommendation(loveMapExercise.id, 'high', 'improvement', 80, [
            'Low engagement suggests disconnection from partner\'s inner world',
            'Rebuilding love maps essential for intimacy',
          ], [
            'Deepens emotional intimacy',
            'Increases understanding of partner',
            'Builds foundation for stronger connection',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }

      const adventureExercise = this.findExerciseByTitle('Adventure') || this.findExerciseByCategory('Fun');
      if (adventureExercise) {
        const recommendation = this.createRecommendation(adventureExercise.id, 'medium', 'growth', 70, [
            'Need for more shared novel experiences',
            'Adventure planning increases engagement and excitement',
          ], [
            'Creates new shared memories',
            'Increases relationship excitement',
            'Strengthens partnership bond',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // Low communication component
    if (scoreComponents.communication < 50) {
      const dailySharingExercise = this.findExerciseByTitle('Daily Sharing') || this.findExerciseByCategory('Communication');
      if (dailySharingExercise) {
        const recommendation = this.createRecommendation(dailySharingExercise.id, 'high', 'improvement', 85, [
            'Communication scores indicate need for daily connection',
            'Structured daily sharing improves communication patterns',
          ], [
            'Establishes daily communication ritual',
            'Improves listening and sharing skills',
            'Prevents issues from building up',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }

      const emotionCheckExercise = this.findExerciseByTitle('Emotion Check') || this.findExerciseByCategory('Communication');
      if (emotionCheckExercise) {
        const recommendation = this.createRecommendation(emotionCheckExercise.id, 'medium', 'improvement', 75, [
            'Emotional awareness and sharing needs development',
            'Regular emotion check-ins build intimacy',
          ], [
            'Increases emotional intelligence',
            'Builds empathy and understanding',
            'Prevents emotional disconnection',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    return recommendations.filter(rec => rec !== null) as BridgeRecommendation[];
  }

  private getTrendBasedRecommendations(): BridgeRecommendation[] {
    if (!this.trends) return [];

    const recommendations: BridgeRecommendation[] = [];

    // Analyze CSI score trends
    if (this.trends.csiScores.length > 1) {
      const recent = this.trends.csiScores[0];
      const previous = this.trends.csiScores[1];
      
      if (recent.averageScore < previous.averageScore) {
        const weeklyMeetingExercise = this.findExerciseByTitle('Weekly Meeting') || this.findExerciseByCategory('Communication');
        if (weeklyMeetingExercise) {
          const recommendation = this.createRecommendation(weeklyMeetingExercise.id, 'high', 'urgent', 88, [
              'CSI scores showing declining trend',
              'Weekly relationship meetings can address issues early',
            ], [
              'Provides structured problem-solving',
              'Prevents issues from escalating',
              'Builds collaborative partnership',
            ]);
          if (recommendation) recommendations.push(recommendation);
        }
      }
    }

    // Analyze exercise engagement patterns
    const exerciseStats = this.trends.exerciseStats;
    if (Object.keys(exerciseStats).length === 0) {
      const loveLanguageExercise = this.findExerciseByTitle('Love Languages') || this.findExerciseByCategory('Connection');
      if (loveLanguageExercise) {
        const recommendation = this.createRecommendation(loveLanguageExercise.id, 'medium', 'growth', 80, [
            'No recent exercise engagement detected',
            'Starting with love languages provides foundation',
          ], [
            'Establishes exercise routine',
            'Improves how love is expressed and received',
            'Creates positive relationship momentum',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    } else {
      // Find categories with low ratings
      Object.entries(exerciseStats).forEach(([category, stats]) => {
        if (stats.averageRating < 3) {
          if (category === 'Conflict') {
            const repairExercise = this.findExerciseByTitle('Repair') || this.findExerciseByCategory('Conflict');
            if (repairExercise) {
              const recommendation = this.createRecommendation(repairExercise.id, 'high', 'improvement', 85, [
                  'Conflict resolution exercises showing low satisfaction',
                  'Learning repair attempts can improve conflict outcomes',
                ], [
                  'Reduces conflict escalation',
                  'Improves relationship repair skills',
                  'Builds conflict resilience',
                ]);
              if (recommendation) recommendations.push(recommendation);
            }
          }
        }
      });
    }

    return recommendations.filter(rec => rec !== null) as BridgeRecommendation[];
  }

  private getFourHorsemenRecommendations(): BridgeRecommendation[] {
    if (!this.trends?.fourHorsemenStats) return [];

    const recommendations: BridgeRecommendation[] = [];
    const { criticism, contempt, defensiveness, stonewalling } = this.trends.fourHorsemenStats;

    if (criticism > 2) {
      const gentleStartExercise = this.findExerciseByTitle('Gentle Start-up') || this.findExerciseByCategory('Communication');
      if (gentleStartExercise) {
        const recommendation = this.createRecommendation(gentleStartExercise.id, 'high', 'urgent', 95, [
            `Criticism detected in ${criticism} recent journal entries`,
            'Gentle start-up technique essential for reducing criticism',
          ], [
            'Eliminates criticism from communication',
            'Improves partner receptivity',
            'Creates safer emotional environment',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    if (contempt > 1) {
      const appreciationExercise = this.findExerciseByTitle('Appreciation') || this.findExerciseByCategory('Connection');
      if (appreciationExercise) {
        const recommendation = this.createRecommendation(appreciationExercise.id, 'high', 'urgent', 90, [
            `Contempt detected - most destructive relationship pattern`,
            'Building appreciation culture counters contempt',
          ], [
            'Actively counters contempt with positivity',
            'Rebuilds respect and admiration',
            'Creates positive sentiment override',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    if (defensiveness > 2) {
      const supportExercise = this.findExerciseByTitle('Support') || this.findExerciseByCategory('Support');
      if (supportExercise) {
        const recommendation = this.createRecommendation(supportExercise.id, 'high', 'improvement', 85, [
            'Defensiveness patterns suggest need for better support',
            'Stress-reducing connection helps reduce defensiveness',
          ], [
            'Reduces defensive reactions',
            'Increases emotional safety',
            'Improves conflict resolution',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    if (stonewalling > 1) {
      const pauseExercise = this.findExerciseByTitle('Pause') || this.findExerciseByCategory('Conflict');
      if (pauseExercise) {
        const recommendation = this.createRecommendation(pauseExercise.id, 'high', 'urgent', 90, [
            'Stonewalling detected - indicates emotional overwhelm',
            'Pause technique prevents stonewalling damage',
          ], [
            'Prevents emotional flooding',
            'Maintains connection during conflict',
            'Reduces stonewalling patterns',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    return recommendations.filter(rec => rec !== null) as BridgeRecommendation[];
  }

  private getActivityBasedRecommendations(): BridgeRecommendation[] {
    const recommendations: BridgeRecommendation[] = [];

    // Analyze check-in frequency
    if (this.recentCheckIns.length === 0) {
      const temperatureExercise = this.findExerciseByTitle('Temperature Reading') || this.findExerciseByCategory('Communication');
      if (temperatureExercise) {
        const recommendation = this.createRecommendation(temperatureExercise.id, 'medium', 'maintenance', 70, [
            'No recent check-ins detected',
            'Daily temperature readings maintain relationship health',
          ], [
            'Establishes regular check-in routine',
            'Prevents issues from building up',
            'Maintains emotional connection',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // Analyze journal frequency
    if (this.recentJournals.length === 0) {
      const weatherReportExercise = this.findExerciseByTitle('Weather Report') || this.findExerciseByCategory('Communication');
      if (weatherReportExercise) {
        const recommendation = this.createRecommendation(weatherReportExercise.id, 'medium', 'maintenance', 65, [
            'No recent journaling activity',
            'Weekly weather reports maintain emotional awareness',
          ], [
            'Increases emotional awareness',
            'Provides gentle entry to deeper sharing',
            'Builds emotional vocabulary',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    // If both are active, suggest growth activities
    if (this.recentCheckIns.length > 0 && this.recentJournals.length > 0) {
      const visionExercise = this.findExerciseByTitle('Vision') || this.findExerciseByCategory('Planning');
      if (visionExercise) {
        const recommendation = this.createRecommendation(visionExercise.id, 'medium', 'growth', 75, [
            'Good activity engagement - ready for future planning',
            'Vision sessions strengthen long-term partnership',
          ], [
            'Aligns future goals and dreams',
            'Strengthens partnership vision',
            'Increases relationship commitment',
          ]);
        if (recommendation) recommendations.push(recommendation);
      }
    }

    return recommendations.filter(rec => rec !== null) as BridgeRecommendation[];
  }

  private createRecommendation(
    exerciseId: string,
    priority: 'high' | 'medium' | 'low',
    category: 'urgent' | 'improvement' | 'maintenance' | 'growth',
    matchScore: number,
    insights: string[],
    benefits: string[]
  ): BridgeRecommendation | null {
    const exercise = this.exercises.find(e => e.id === exerciseId);
    if (!exercise) {
      console.warn(`Exercise ${exerciseId} not found, skipping recommendation`);
      return null;
    }

    return {
      exercise,
      reason: this.generateReason(priority, category, insights),
      priority,
      category,
      matchScore,
      insights,
      benefits,
    };
  }

  private findExerciseByTitle(title: string): Exercise | null {
    return this.exercises.find(e => 
      e.title.toLowerCase().includes(title.toLowerCase())
    ) || null;
  }

  private findExerciseByCategory(category: string): Exercise | null {
    return this.exercises.find(e => 
      e.category.toLowerCase() === category.toLowerCase()
    ) || null;
  }

  private generateReason(
    priority: string,
    category: string,
    insights: string[]
  ): string {
    const priorityText = {
      high: 'Highly recommended',
      medium: 'Recommended',
      low: 'Consider trying'
    }[priority];

    const categoryText = {
      urgent: 'immediate attention needed',
      improvement: 'significant improvement opportunity',
      maintenance: 'maintaining relationship health',
      growth: 'continued relationship growth'
    }[category];

    return `${priorityText} based on your data - ${categoryText}. ${insights[0]}`;
  }

  private deduplicateRecommendations(recommendations: BridgeRecommendation[]): BridgeRecommendation[] {
    const seen = new Set<string>();
    return recommendations.filter(rec => {
      if (seen.has(rec.exercise.id)) {
        return false;
      }
      seen.add(rec.exercise.id);
      return true;
    });
  }

  private generateUserInsights(): RecommendationAnalysis['userInsights'] {
    const insights = {
      healthStatus: 'Unable to assess',
      primaryConcerns: [] as string[],
      strengths: [] as string[],
      trendAnalysis: 'Insufficient data for trend analysis',
    };

    if (this.healthScore) {
      const score = this.healthScore.healthScore;
      if (score >= 80) {
        insights.healthStatus = 'Excellent - Your relationship is thriving';
        insights.strengths.push('Strong overall relationship health');
      } else if (score >= 60) {
        insights.healthStatus = 'Good - Some areas for growth identified';
        insights.strengths.push('Solid relationship foundation');
      } else if (score >= 40) {
        insights.healthStatus = 'Needs attention - Several improvement opportunities';
        insights.primaryConcerns.push('Multiple areas requiring focus');
      } else {
        insights.healthStatus = 'Critical - Immediate intervention recommended';
        insights.primaryConcerns.push('Relationship health at risk');
      }

      // Analyze components
      const { satisfaction, engagement, communication } = this.healthScore.scoreComponents;
      if (satisfaction < 50) insights.primaryConcerns.push('Low relationship satisfaction');
      if (engagement < 50) insights.primaryConcerns.push('Limited emotional engagement');
      if (communication < 50) insights.primaryConcerns.push('Communication challenges');

      if (satisfaction >= 70) insights.strengths.push('Good relationship satisfaction');
      if (engagement >= 70) insights.strengths.push('Strong emotional connection');
      if (communication >= 70) insights.strengths.push('Effective communication');
    }

    if (this.trends) {
      const horsemen = this.trends.fourHorsemenStats;
      if (horsemen.total === 0) {
        insights.strengths.push('Healthy communication patterns');
      } else {
        if (horsemen.criticism > 0) insights.primaryConcerns.push('Criticism in communication');
        if (horsemen.contempt > 0) insights.primaryConcerns.push('Contempt patterns detected');
        if (horsemen.defensiveness > 0) insights.primaryConcerns.push('Defensive responses');
        if (horsemen.stonewalling > 0) insights.primaryConcerns.push('Emotional withdrawal');
      }

      insights.trendAnalysis = `Based on ${this.trends.summary.totalJournals} journal entries and ${this.trends.summary.totalCheckIns} check-ins`;
    }

    return insights;
  }

  private generateSummary(recommendations: BridgeRecommendation[]): RecommendationAnalysis['recommendationSummary'] {
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const categories = [...new Set(recommendations.map(r => r.exercise.category))];
    
    let impact = 'Moderate';
    if (highPriority >= 3) impact = 'High';
    else if (highPriority === 0) impact = 'Low';

    return {
      totalRecommendations: recommendations.length,
      highPriority,
      categoriesAdressed: categories,
      estimatedImpact: impact,
    };
  }
}

// Export the service
export const bridgeRecommendationService = new BridgeRecommendationEngine();

// Main function to get recommendations
export const getPersonalizedBridgeRecommendations = async (): Promise<RecommendationAnalysis> => {
  return await bridgeRecommendationService.getPersonalizedRecommendations();
};