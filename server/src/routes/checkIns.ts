import express, { Response } from 'express';
import { z } from 'zod';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { CheckIn } from '../models/CheckIn';
import { Couple } from '../models/Couple';

const router = express.Router();

// CSI-4 Questions (Couple Satisfaction Index - Short Form)
const CSI_4_QUESTIONS = [
  "Please indicate the degree of happiness, all things considered, of your relationship.",
  "In general, how often do you think that things between you and your partner are going well?",
  "Our relationship is strong.",
  "My relationship with my partner makes me happy."
];

// CSI-16 Questions (Couple Satisfaction Index - Extended Form)
const CSI_16_QUESTIONS = [
  "Please indicate the degree of happiness, all things considered, of your relationship.",
  "In general, how often do you think that things between you and your partner are going well?",
  "Our relationship is strong.",
  "My relationship with my partner makes me happy.",
  "I have a warm and comfortable relationship with my partner.",
  "I really feel like part of a team with my partner.", 
  "How rewarding is your relationship with your partner?",
  "How well does your partner meet your needs?",
  "To what extent has your relationship met your original expectations?",
  "In general, how satisfied are you with your relationship?",
  "For most people, how easy would it be to leave their relationship?",
  "How many problems are there in your relationship?",
  "How well do you and your partner discuss your relationship?",
  "Are you satisfied with the way you and your partner handle problems?",
  "How satisfied are you with the love and affection between you?",
  "How satisfied are you with your partner's behavior during arguments?"
];

const createCheckInSchema = z.object({
  coupleId: z.string(),
  journalId: z.string().optional(),
  mood: z.number().min(1).max(5),
  context: z.string(),
  communicationQuality: z.number().min(1).max(5),
  sharedMoments: z.array(z.string()),
  privateThoughts: z.string().optional(),
});

// Create a new check-in
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const checkInData = createCheckInSchema.parse(req.body);
    const user = req.user!;

    const couple = await Couple.findById(checkInData.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    const checkIn = new CheckIn({
      ...checkInData,
      userId: user._id,
    });

    await checkIn.save();

    res.status(201).json({ 
      message: 'Check-in created successfully',
      checkIn 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
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