import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { JournalEntry, IMessage } from '../models/JournalEntry';
import { Couple } from '../models/Couple';
import { User } from '../models/User';
import { analyzeJournalEntry, getChatbotResponse } from '../services/aiService';

const router = express.Router();

// Create new journal entry
router.post('/create', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to create journal entries' });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    const partnerId = couple.partner1Id.equals(user._id) 
      ? couple.partner2Id 
      : couple.partner1Id;

    const journalEntry = new JournalEntry({
      coupleId: user.coupleId,
      partner1Id: couple.partner1Id,
      partner2Id: couple.partner2Id,
      partner1Chat: [],
      partner2Chat: []
    });

    await journalEntry.save();

    res.status(201).json({ 
      message: 'Journal entry created',
      journalEntry: {
        id: journalEntry._id,
        coupleId: journalEntry.coupleId,
        partner1Id: journalEntry.partner1Id,
        partner2Id: journalEntry.partner2Id,
        isCompleted: journalEntry.isCompleted,
        createdAt: journalEntry.createdAt
      }
    });

  } catch (error) {
    console.error('Create journal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get journal entry
router.get('/:journalId', async (req: AuthRequest, res) => {
  try {
    const { journalId } = req.params;
    const user = req.user!;

    const journalEntry = await JournalEntry.findById(journalId);
    
    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Check if user has access to this journal
    if (!journalEntry.partner1Id.equals(user._id) && !journalEntry.partner2Id.equals(user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ journalEntry });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update journal entry with chat messages
router.put('/:journalId/chat', [
  body('messages').isArray().withMessage('Messages must be an array'),
  body('messages.*.sender').isIn(['user', 'bot']).withMessage('Invalid sender'),
  body('messages.*.text').isLength({ min: 1, max: 2000 }).withMessage('Message text required and must be under 2000 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { journalId } = req.params;
    const { messages } = req.body;
    const user = req.user!;

    const journalEntry = await JournalEntry.findById(journalId);
    
    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Check if user has access
    if (!journalEntry.partner1Id.equals(user._id) && !journalEntry.partner2Id.equals(user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add timestamps to messages
    const timestampedMessages: IMessage[] = messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date()
    }));

    // Determine which partner's chat to update
    const isPartner1 = journalEntry.partner1Id.equals(user._id);
    const updateField = isPartner1 ? 'partner1Chat' : 'partner2Chat';
    
    await JournalEntry.findByIdAndUpdate(
      journalId,
      { 
        [updateField]: timestampedMessages,
        $addToSet: { completedBy: user._id }
      }
    );

    // Check if both partners have completed their chats
    const updatedEntry = await JournalEntry.findById(journalId);
    if (updatedEntry && updatedEntry.completedBy.length === 2) {
      updatedEntry.isCompleted = true;
      await updatedEntry.save();
    }

    res.json({ 
      message: 'Chat updated successfully',
      isCompleted: updatedEntry?.isCompleted || false
    });

  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analyze journal entry
router.post('/:journalId/analyze', async (req: AuthRequest, res) => {
  try {
    const { journalId } = req.params;
    const user = req.user!;

    const journalEntry = await JournalEntry.findById(journalId);
    
    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Check access
    if (!journalEntry.partner1Id.equals(user._id) && !journalEntry.partner2Id.equals(user._id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!journalEntry.isCompleted) {
      return res.status(400).json({ error: 'Both partners must complete their reflections before analysis' });
    }

    if (journalEntry.analysis) {
      return res.json({ analysis: journalEntry.analysis });
    }

    // Fetch partner data for context
    const partner1 = await User.findById(journalEntry.partner1Id);
    const partner2 = await User.findById(journalEntry.partner2Id);

    // Perform AI analysis with user context
    const analysis = await analyzeJournalEntry(journalEntry, partner1 || undefined, partner2 || undefined);
    
    // Save analysis to database
    journalEntry.analysis = analysis;
    await journalEntry.save();

    res.json({ analysis });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze journal entry' });
  }
});

// Get chatbot response for journaling
router.post('/chat-response', [
  body('messageHistory').isArray().withMessage('Message history must be an array')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageHistory } = req.body;
    const userId = req.user!._id;

    // Fetch complete user data for context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Pass user context to chatbot for personalized responses
    const response = await getChatbotResponse(messageHistory, user);

    res.json({ message: response });

  } catch (error: any) {
    console.error('Chatbot response error:', error);
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

// Get couple's journal history
router.get('/couple/history', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to view journal history' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const journals = await JournalEntry.find({ 
      coupleId: user.coupleId 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-partner1Chat -partner2Chat'); // Exclude chat details for listing

    const total = await JournalEntry.countDocuments({ 
      coupleId: user.coupleId 
    });

    res.json({
      journals,
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