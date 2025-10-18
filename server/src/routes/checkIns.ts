import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { CheckIn } from '../models/CheckIn';
import { Couple } from '../models/Couple';

const router = express.Router();

// CSI-4 Questions
const CSI_4_QUESTIONS = [
  "Please indicate the degree of happiness, all things considered, of your relationship.",
  "How satisfied are you with your relationship?", 
  "How good is your relationship compared to most?",
  "How strong is your love for your partner?"
];

// CSI-16 Questions (abbreviated for space)
const CSI_16_QUESTIONS = [
  ...CSI_4_QUESTIONS,
  "How satisfied are you with the amount of love and affection in your relationship?",
  "How well does your partner meet your needs?",
  "To what extent has your relationship met your original expectations?",
  "How much do you love your partner?",
  "How many problems are there in your relationship?",
  "How satisfied are you with the way you and your partner handle problems?",
  "How satisfied are you with your partner's level of commitment?",
  "How satisfied are you with your communication as a couple?",
  "How satisfied are you with the amount of fun you have together?",
  "How satisfied are you with your physical intimacy?",
  "How satisfied are you with the amount of time you spend together?",
  "How confident are you in the future of your relationship?"
];

// Create new check-in
router.post('/create', [
  body('type').isIn(['CSI-4', 'CSI-16', 'weekly', 'monthly']).withMessage('Invalid check-in type')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type } = req.body;
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to create check-ins' });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    const partnerId = couple.partner1Id.equals(user._id) 
      ? couple.partner2Id 
      : couple.partner1Id;

    const checkIn = new CheckIn({
      coupleId: user.coupleId,
      partner1Id: couple.partner1Id,
      partner2Id: couple.partner2Id,
      type,
      partner1Responses: [],
      partner2Responses: []
    });

    await checkIn.save();

    const questions = type === 'CSI-4' ? CSI_4_QUESTIONS : CSI_16_QUESTIONS;

    res.status(201).json({
      message: 'Check-in created successfully',
      checkIn: {
        id: checkIn._id,
        type: checkIn.type,
        questions,
        isCompleted: checkIn.isCompleted,
        createdAt: checkIn.createdAt
      }
    });

  } catch (error) {
    console.error('Create check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit check-in responses
router.put('/:checkInId/submit', [
  body('responses').isArray().withMessage('Responses must be an array'),
  body('responses.*').isInt({ min: 0, max: 6 }).withMessage('Each response must be between 0 and 6'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be under 1000 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { checkInId } = req.params;
    const { responses, notes } = req.body;
    const user = req.user!;

    const checkIn = await CheckIn.findById(checkInId);
    
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    // Check access
    if (!checkIn.partner1Id.equals(user._id) && !checkIn.partner2Id.equals(user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate response count
    const expectedCount = checkIn.type === 'CSI-4' ? 4 : 16;
    if (responses.length !== expectedCount) {
      return res.status(400).json({ 
        error: `Expected ${expectedCount} responses, got ${responses.length}` 
      });
    }

    // Determine which partner is submitting
    const isPartner1 = checkIn.partner1Id.equals(user._id);
    const responseField = isPartner1 ? 'partner1Responses' : 'partner2Responses';
    const scoreField = isPartner1 ? 'partner1Score' : 'partner2Score';
    
    // Calculate score (sum of responses)
    const score = responses.reduce((sum: number, response: number) => sum + response, 0);

    const updateData: any = {
      [responseField]: responses,
      [scoreField]: score,
      $addToSet: { completedBy: user._id }
    };

    if (notes) {
      updateData.notes = notes;
    }

    await CheckIn.findByIdAndUpdate(checkInId, updateData);

    // Check if both partners completed and calculate average
    const updatedCheckIn = await CheckIn.findById(checkInId);
    if (updatedCheckIn && updatedCheckIn.completedBy.length === 2) {
      const averageScore = (updatedCheckIn.partner1Score! + updatedCheckIn.partner2Score!) / 2;
      
      await CheckIn.findByIdAndUpdate(checkInId, {
        isCompleted: true,
        averageScore
      });
    }

    res.json({
      message: 'Responses submitted successfully',
      score,
      isCompleted: updatedCheckIn?.completedBy.length === 2
    });

  } catch (error) {
    console.error('Submit check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get check-in details
router.get('/:checkInId', async (req: AuthRequest, res) => {
  try {
    const { checkInId } = req.params;
    const user = req.user!;

    const checkIn = await CheckIn.findById(checkInId);
    
    if (!checkIn) {
      return res.status(404).json({ error: 'Check-in not found' });
    }

    // Check access
    if (!checkIn.partner1Id.equals(user._id) && !checkIn.partner2Id.equals(user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const questions = checkIn.type === 'CSI-4' ? CSI_4_QUESTIONS : CSI_16_QUESTIONS;

    res.json({
      checkIn,
      questions
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get couple's check-in history
router.get('/couple/history', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to view check-in history' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const skip = (page - 1) * limit;

    const filter: any = { coupleId: user.coupleId };
    if (type) {
      filter.type = type;
    }

    const checkIns = await CheckIn.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-partner1Responses -partner2Responses'); // Exclude detailed responses

    const total = await CheckIn.countDocuments(filter);

    res.json({
      checkIns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;