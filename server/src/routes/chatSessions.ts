import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { ChatSession, IChatMessage } from '../models/ChatSession';
import { User } from '../models/User';
import { getChatbotResponse } from '../services/aiService';

const router = express.Router();

// Create new chat session
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    const chatSession = new ChatSession({
      userId: user._id,
      title: 'New Chat Session',
      messages: [],
      isActive: true,
      isClosed: false
    });

    await chatSession.save();

    res.status(201).json({
      message: 'Chat session created',
      session: {
        id: chatSession._id,
        title: chatSession.title,
        isActive: chatSession.isActive,
        isClosed: chatSession.isClosed,
        messageCount: chatSession.messages.length,
        wordCount: chatSession.wordCount,
        lastMessageAt: chatSession.lastMessageAt,
        createdAt: chatSession.createdAt
      }
    });

  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get all chat sessions for user (thread list)
router.get('/list', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['active', 'closed', 'all']).withMessage('Status must be active, closed, or all')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || 'all';
    const skip = (page - 1) * limit;

    // Build filter
    let filter: any = { userId: user._id };
    if (status === 'active') {
      filter.isActive = true;
      filter.isClosed = false;
    } else if (status === 'closed') {
      filter.isClosed = true;
    }

    const sessions = await ChatSession.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title isActive isClosed lastMessageAt wordCount createdAt updatedAt mood topics summary');

    const total = await ChatSession.countDocuments(filter);

    // Format sessions for UI
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      title: session.title,
      isActive: session.isActive,
      isClosed: session.isClosed,
      lastMessageAt: session.lastMessageAt,
      wordCount: session.wordCount,
      messageCount: session.messages?.length || 0,
      mood: session.mood,
      topics: session.topics,
      summary: session.summary,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      // Time since last message
      timeSinceLastMessage: session.lastMessageAt ? 
        Math.floor((Date.now() - session.lastMessageAt.getTime()) / (1000 * 60 * 60 * 24)) : null
    }));

    res.json({
      sessions: formattedSessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      stats: {
        totalSessions: await ChatSession.countDocuments({ userId: user._id }),
        activeSessions: await ChatSession.countDocuments({ userId: user._id, isActive: true, isClosed: false }),
        closedSessions: await ChatSession.countDocuments({ userId: user._id, isClosed: true })
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat sessions' });
  }
});

// Get specific chat session with messages
router.get('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      session: {
        id: session._id,
        title: session.title,
        messages: session.messages,
        isActive: session.isActive,
        isClosed: session.isClosed,
        lastMessageAt: session.lastMessageAt,
        wordCount: session.wordCount,
        mood: session.mood,
        topics: session.topics,
        summary: session.summary,
        sessionDurationMinutes: session.sessionDurationMinutes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat session' });
  }
});

// Send message to chat session
router.post('/:sessionId/message', [
  body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { message } = req.body;
    const user = req.user!;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (session.isClosed) {
      return res.status(400).json({ error: 'Cannot send message to closed session' });
    }

    // Add user message
    const userMessage: IChatMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    };

    session.messages.push(userMessage);
    session.isActive = true;

    // Save user message immediately
    await session.save();

    // Get complete user data for AI context
    const userData = await User.findById(user._id);
    if (!userData) {
      return res.status(404).json({ error: 'User data not found' });
    }

    // Get AI response with user context (includes fallback handling)
    let aiResponse: string;
    try {
      aiResponse = await getChatbotResponse(session.messages, userData);
    } catch (error) {
      console.error('AI response error:', error);
      // Provide a graceful fallback response
      const userName = userData.firstName || 'friend';
      aiResponse = `I'm having a moment of connection trouble, ${userName} 💙 But I'm still here listening. Could you share a bit more about what's on your heart?`;
    }

    // Check if conversation should be completed
    let shouldClose = false;
    let cleanResponse = aiResponse;
    if (aiResponse.includes('[CONVERSATION_COMPLETE]')) {
      cleanResponse = aiResponse.replace('[CONVERSATION_COMPLETE]', '').trim();
      shouldClose = true;
    }

    // Add bot message
    const botMessage: IChatMessage = {
      sender: 'bot',
      text: cleanResponse,
      timestamp: new Date()
    };

    session.messages.push(botMessage);

    // Close session if completed
    if (shouldClose) {
      session.isClosed = true;
      session.isActive = false;
      
      // Generate session summary
      const userMessages = session.messages.filter(m => m.sender === 'user');
      if (userMessages.length > 0) {
        // Extract potential topics from user messages
        const allText = userMessages.map(m => m.text).join(' ');
        const words = allText.toLowerCase().split(/\s+/);
        const commonWords = ['relationship', 'partner', 'feel', 'love', 'communication', 'work', 'family', 'stress', 'happy', 'sad', 'angry', 'frustrated', 'worried'];
        const topics = commonWords.filter(word => words.includes(word));
        session.topics = [...new Set(topics)].slice(0, 5);
      }
    }

    await session.save();

    res.json({
      message: 'Message sent successfully',
      userMessage,
      botMessage,
      session: {
        id: session._id,
        title: session.title,
        isActive: session.isActive,
        isClosed: session.isClosed,
        messageCount: session.messages.length,
        wordCount: session.wordCount,
        lastMessageAt: session.lastMessageAt
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Close chat session
router.put('/:sessionId/close', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    session.isClosed = true;
    session.isActive = false;
    
    // Calculate session duration
    if (session.messages.length > 0) {
      const firstMessage = session.messages[0];
      const lastMessage = session.messages[session.messages.length - 1];
      const durationMs = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
      session.sessionDurationMinutes = Math.ceil(durationMs / (1000 * 60));
    }

    await session.save();

    res.json({
      message: 'Chat session closed successfully',
      session: {
        id: session._id,
        title: session.title,
        isActive: session.isActive,
        isClosed: session.isClosed,
        sessionDurationMinutes: session.sessionDurationMinutes
      }
    });

  } catch (error) {
    console.error('Close chat session error:', error);
    res.status(500).json({ error: 'Failed to close chat session' });
  }
});

// Reopen closed chat session
router.put('/:sessionId/reopen', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    if (!session.isClosed) {
      return res.status(400).json({ error: 'Session is already open' });
    }

    session.isClosed = false;
    session.isActive = true;
    await session.save();

    res.json({
      message: 'Chat session reopened successfully',
      session: {
        id: session._id,
        title: session.title,
        isActive: session.isActive,
        isClosed: session.isClosed
      }
    });

  } catch (error) {
    console.error('Reopen chat session error:', error);
    res.status(500).json({ error: 'Failed to reopen chat session' });
  }
});

// Update chat session title
router.put('/:sessionId/title', [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { title } = req.body;
    const user = req.user!;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    session.title = title;
    await session.save();

    res.json({
      message: 'Title updated successfully',
      session: {
        id: session._id,
        title: session.title
      }
    });

  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
});

// Delete chat session
router.delete('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      userId: user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router;