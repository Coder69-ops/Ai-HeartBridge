import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { CheckIn } from '../models/CheckIn';
import { JournalSession } from '../models/JournalSession';
import { ExerciseProgress } from '../models/Exercise';

const router = express.Router();

// Get relationship trends and analytics
router.get('/trends', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to view analytics' });
    }

    const timeframe = req.query.timeframe as string || '6months';
    let startDate: Date;
    
    switch (timeframe) {
      case '1month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // 6months
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Get CSI scores over time (include partially completed for single-partner testing)
    const csiScores = await CheckIn.find({
      coupleId: user.coupleId,
      $or: [
        { isCompleted: true }, // Fully completed by both partners
        { completedBy: { $size: 1 } } // Completed by at least one partner
      ],
      createdAt: { $gte: startDate }
    })
    .select('type averageScore partner1Score partner2Score createdAt completedBy')
    .sort({ createdAt: 1 });

    // Calculate scores for partially completed check-ins
    const processedScores = csiScores.map(checkIn => {
      let score = checkIn.averageScore;
      
      // If not fully completed, use available partner score
      if (!checkIn.averageScore && checkIn.completedBy.length === 1) {
        score = checkIn.partner1Score || checkIn.partner2Score || 0;
      }
      
      return {
        type: checkIn.type,
        averageScore: score,
        partner1Score: checkIn.partner1Score || 0,
        partner2Score: checkIn.partner2Score || 0,
        createdAt: checkIn.createdAt
      };
    }).filter(score => score.averageScore > 0); // Only include scores that have actual data

    // Get journaling frequency
    const journalEntries = await JournalSession.find({
      coupleId: user.coupleId,
      isCompleted: true,
      createdAt: { $gte: startDate }
    })
    .select('createdAt insights themes')
    .sort({ createdAt: 1 });

    // Get exercise completion stats
    const exerciseProgress = await ExerciseProgress.find({
      coupleId: user.coupleId,
      dateCompleted: { $gte: startDate }
    })
    .populate('exerciseId', 'category framework')
    .select('dateCompleted rating exerciseId');

    // Calculate Four Horsemen trends
    const fourHorsemenStats = {
      criticism: 0,
      contempt: 0,
      defensiveness: 0,
      stonewalling: 0,
      total: journalEntries.length
    };

    journalEntries.forEach(entry => {
      // Parse insights to extract fourHorsemen data if available
      if (entry.insights) {
        try {
          const insightsData = JSON.parse(entry.insights);
          const horsemen = insightsData.fourHorsemen;
          if (horsemen) {
            if (horsemen.criticism) fourHorsemenStats.criticism++;
            if (horsemen.contempt) fourHorsemenStats.contempt++;
            if (horsemen.defensiveness) fourHorsemenStats.defensiveness++;
            if (horsemen.stonewalling) fourHorsemenStats.stonewalling++;
          }
        } catch (e) {
          // Skip if insights is not valid JSON
        }
      }
    });

    // Calculate exercise category preferences
    const exerciseStats = exerciseProgress.reduce((acc: any, prog: any) => {
      const category = prog.exerciseId?.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { count: 0, averageRating: 0, totalRating: 0 };
      }
      acc[category].count++;
      if (prog.rating) {
        acc[category].totalRating += prog.rating;
        acc[category].averageRating = acc[category].totalRating / acc[category].count;
      }
      return acc;
    }, {});

    res.json({
      timeframe,
      csiScores: processedScores,
      journalEntries: journalEntries.map(entry => ({
        date: entry.createdAt,
        themes: entry.themes || [],
        insights: entry.insights || null
      })),
      fourHorsemenStats,
      exerciseStats,
      summary: {
        totalJournals: journalEntries.length,
        totalCheckIns: processedScores.length,
        totalExercises: exerciseProgress.length,
        latestCSI: processedScores.length > 0 ? processedScores[processedScores.length - 1] : null
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get relationship health score
router.get('/health-score', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to view health score' });
    }

    // Get latest CSI score (include partially completed for single-partner testing)
    const latestCheckIn = await CheckIn.findOne({
      coupleId: user.coupleId,
      $or: [
        { isCompleted: true }, // Fully completed by both partners
        { completedBy: { $size: 1 } } // Completed by at least one partner
      ]
    }).sort({ createdAt: -1 });

    // Get recent journal activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJournals = await JournalSession.countDocuments({
      coupleId: user.coupleId,
      isCompleted: true,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const recentExercises = await ExerciseProgress.countDocuments({
      coupleId: user.coupleId,
      dateCompleted: { $gte: thirtyDaysAgo }
    });

    // Calculate health score (0-100)
    let healthScore = 0;
    let scoreComponents = {
      satisfaction: 0,      // 0-40 points (CSI score)
      engagement: 0,        // 0-30 points (activity level)
      communication: 0      // 0-30 points (journaling quality)
    };

    // Satisfaction component (40% of score)
    if (latestCheckIn) {
      const maxCSI = latestCheckIn.type === 'CSI-4' ? 24 : 96;
      let scoreToUse = latestCheckIn.averageScore;
      
      // If no average score (single partner), use individual score
      if (!scoreToUse && latestCheckIn.completedBy.length === 1) {
        scoreToUse = latestCheckIn.partner1Score || latestCheckIn.partner2Score;
      }
      
      if (scoreToUse) {
        scoreComponents.satisfaction = Math.round((scoreToUse / maxCSI) * 40);
      }
    }

    // Engagement component (30% of score)
    const engagementScore = Math.min(30, (recentJournals * 5) + (recentExercises * 3));
    scoreComponents.engagement = engagementScore;

    // Communication component (30% of score) - based on Four Horsemen absence
    const recentAnalyses = await JournalSession.find({
      coupleId: user.coupleId,
      isClosed: true,
      insights: { $exists: true },
      createdAt: { $gte: thirtyDaysAgo }
    }).select('insights themes');

    if (recentAnalyses.length > 0) {
      let positiveInteractions = 0;
      recentAnalyses.forEach(entry => {
        let horsemen = null;
        try {
          const insightsData = JSON.parse(entry.insights || '{}');
          horsemen = insightsData.fourHorsemen;
        } catch (e) {
          // Skip if insights is not valid JSON
        }
        const horsemenData = horsemen;
        if (horsemen && !horsemen.criticism && !horsemen.contempt && 
            !horsemen.defensiveness && !horsemen.stonewalling) {
          positiveInteractions++;
        }
      });
      
      scoreComponents.communication = Math.round((positiveInteractions / recentAnalyses.length) * 30);
    }

    healthScore = scoreComponents.satisfaction + scoreComponents.engagement + scoreComponents.communication;

    // Determine health level
    let healthLevel: string;
    if (healthScore >= 80) healthLevel = 'Excellent';
    else if (healthScore >= 60) healthLevel = 'Good';
    else if (healthScore >= 40) healthLevel = 'Fair';
    else healthLevel = 'Needs Attention';

    res.json({
      healthScore,
      healthLevel,
      scoreComponents,
      recommendations: generateRecommendations(scoreComponents, recentJournals, recentExercises),
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function generateRecommendations(scoreComponents: any, journalCount: number, exerciseCount: number): string[] {
  const recommendations: string[] = [];

  if (scoreComponents.satisfaction < 20) {
    recommendations.push("Consider taking more relationship satisfaction surveys to track your progress");
  }
  
  if (scoreComponents.engagement < 15) {
    recommendations.push("Try to engage more with journaling sessions and relationship exercises");
  }
  
  if (journalCount < 2) {
    recommendations.push("Regular journaling can help improve communication patterns");
  }
  
  if (exerciseCount < 3) {
    recommendations.push("Practicing relationship exercises together can strengthen your bond");
  }
  
  if (scoreComponents.communication < 15) {
    recommendations.push("Focus on avoiding the Four Horsemen in your communication");
  }

  if (recommendations.length === 0) {
    recommendations.push("Keep up the great work! Your relationship is on a positive track");
  }

  return recommendations;
}

export default router;