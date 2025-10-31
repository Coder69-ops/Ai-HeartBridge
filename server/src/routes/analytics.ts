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

    // Get CSI scores over time
    const csiScores = await CheckIn.find({
      coupleId: user.coupleId,
      isCompleted: true,
      createdAt: { $gte: startDate }
    })
    .select('type averageScore partner1Score partner2Score createdAt')
    .sort({ createdAt: 1 });

    // Get journaling frequency
    const journalEntries = await JournalSession.find({
      coupleId: user.coupleId,
      isCompleted: true,
      createdAt: { $gte: startDate }
    })
    .select('createdAt analysis.fourHorsemen')
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
      if (entry.analysis?.fourHorsemen) {
        const horsemen = entry.analysis.fourHorsemen;
        if (horsemen.criticism) fourHorsemenStats.criticism++;
        if (horsemen.contempt) fourHorsemenStats.contempt++;
        if (horsemen.defensiveness) fourHorsemenStats.defensiveness++;
        if (horsemen.stonewalling) fourHorsemenStats.stonewalling++;
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
      csiScores,
      journalEntries: journalEntries.map(entry => ({
        date: entry.createdAt,
        fourHorsemen: entry.analysis?.fourHorsemen || null
      })),
      fourHorsemenStats,
      exerciseStats,
      summary: {
        totalJournals: journalEntries.length,
        totalCheckIns: csiScores.length,
        totalExercises: exerciseProgress.length,
        latestCSI: csiScores.length > 0 ? csiScores[csiScores.length - 1] : null
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

    // Get latest CSI score
    const latestCheckIn = await CheckIn.findOne({
      coupleId: user.coupleId,
      isCompleted: true
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
    if (latestCheckIn?.averageScore) {
      const maxCSI = latestCheckIn.type === 'CSI-4' ? 24 : 96;
      scoreComponents.satisfaction = Math.round((latestCheckIn.averageScore / maxCSI) * 40);
    }

    // Engagement component (30% of score)
    const engagementScore = Math.min(30, (recentJournals * 5) + (recentExercises * 3));
    scoreComponents.engagement = engagementScore;

    // Communication component (30% of score) - based on Four Horsemen absence
    const recentAnalyses = await JournalSession.find({
      coupleId: user.coupleId,
      isCompleted: true,
      analysis: { $exists: true },
      createdAt: { $gte: thirtyDaysAgo }
    }).select('analysis.fourHorsemen');

    if (recentAnalyses.length > 0) {
      let positiveInteractions = 0;
      recentAnalyses.forEach(entry => {
        const horsemen = entry.analysis?.fourHorsemen;
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