import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { Exercise, ExerciseProgress } from '../models/Exercise';

const router = express.Router();

// Get all exercises
router.get('/', async (req: AuthRequest, res) => {
  try {
    const category = req.query.category as string;
    const framework = req.query.framework as string;
    const difficulty = req.query.difficulty as string;

    const filter: any = { isActive: true };
    
    if (category) filter.category = category;
    if (framework) filter.framework = framework;
    if (difficulty) filter.difficulty = difficulty;

    const exercises = await Exercise.find(filter).sort({ category: 1, title: 1 });

    // Transform _id to id for frontend compatibility
    const transformedExercises = exercises.map(exercise => ({
      ...exercise.toObject(),
      id: exercise._id.toString()
    }));

    res.json({ exercises: transformedExercises });

  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
});

// Get exercise by ID
router.get('/:exerciseId', async (req: AuthRequest, res) => {
  try {
    const { exerciseId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const exercise = await Exercise.findById(exerciseId);
    
    if (!exercise || !exercise.isActive) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Get progress for this couple if they're paired
    let progress = null;
    if (user.coupleId) {
      progress = await ExerciseProgress.find({
        coupleId: user.coupleId,
        exerciseId
      }).sort({ dateCompleted: -1 });
    }

    // Transform _id to id for frontend compatibility
    const transformedExercise = {
      ...exercise.toObject(),
      id: exercise._id.toString()
    };

    res.json({ 
      exercise: transformedExercise,
      progress
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark exercise as completed
router.post('/:exerciseId/complete', async (req: AuthRequest, res) => {
  try {
    const { exerciseId } = req.params;
    const { rating, feedback, timeSpent } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to complete exercises' });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise || !exercise.isActive) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Check if there's already a progress entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingProgress = await ExerciseProgress.findOne({
      coupleId: user.coupleId,
      exerciseId,
      dateCompleted: { $gte: today, $lt: tomorrow },
      completedBy: user._id
    });

    if (existingProgress) {
      return res.status(400).json({ error: 'Exercise already completed today' });
    }

    const progress = new ExerciseProgress({
      coupleId: user.coupleId,
      exerciseId,
      completedBy: [user._id],
      rating: rating || undefined,
      feedback: feedback || undefined,
      timeSpent: timeSpent || undefined
    });

    await progress.save();

    res.status(201).json({
      message: 'Exercise completed successfully',
      progress
    });

  } catch (error) {
    console.error('Complete exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exercise categories
router.get('/meta/categories', async (req: AuthRequest, res) => {
  try {
    const categories = await Exercise.distinct('category', { isActive: true });
    const frameworks = await Exercise.distinct('framework', { isActive: true });
    
    res.json({ 
      categories,
      frameworks,
      difficulties: ['beginner', 'intermediate', 'advanced']
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get couple's exercise history
router.get('/couple/progress', async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to view exercise progress' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const progress = await ExerciseProgress.find({ 
      coupleId: user.coupleId 
    })
    .populate('exerciseId', 'title category framework')
    .sort({ dateCompleted: -1 })
    .skip(skip)
    .limit(limit);

    const total = await ExerciseProgress.countDocuments({ 
      coupleId: user.coupleId 
    });

    // Transform _id to id for frontend compatibility
    const transformedProgress = progress.map(item => ({
      ...item.toObject(),
      id: item._id.toString()
    }));

    res.json({
      progress: transformedProgress,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Exercise progress error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
});

export default router;