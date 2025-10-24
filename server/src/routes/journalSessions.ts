import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { JournalSession, IJournalMessage, JournalSessionStatus } from '../models/JournalSession';
import { Couple } from '../models/Couple';
import { User } from '../models/User';
import { getChatbotResponse } from '../services/aiService';
import { journalNotificationService } from '../services/notificationService';
import { analyzeJournalEntry } from '../services/aiService';
import { IAnalysisResult } from '../models/JournalEntry';

const router = express.Router();

// Helper function to handle both string and array formats
const formatList = (items: string | string[]): string => {
  if (typeof items === 'string') {
    return items;
  }
  return items.map((item: string) => `- ${item}`).join('\n');
};

// Helper function to format analysis result as readable text
function formatAnalysisAsText(analysis: IAnalysisResult): string {

  return `# Relationship Insights

## Summary
${analysis.summary}

## Strengths
${formatList(analysis.strengths)}

## Growth Opportunities
${formatList(analysis.opportunities)}

## Four Horsemen Assessment
- **Criticism**: ${analysis.fourHorsemen.criticism ? '⚠️ Present' : '✅ Not detected'}
- **Contempt**: ${analysis.fourHorsemen.contempt ? '⚠️ Present' : '✅ Not detected'}
- **Defensiveness**: ${analysis.fourHorsemen.defensiveness ? '⚠️ Present' : '✅ Not detected'}
- **Stonewalling**: ${analysis.fourHorsemen.stonewalling ? '⚠️ Present' : '✅ Not detected'}

## Repair Plan
${formatList(analysis.repairPlan)}

${analysis.riskFlags && analysis.riskFlags.length > 0 ? `## Safety Considerations
${formatList(analysis.riskFlags)}` : ''}

${analysis.safetyMode ? `## Safety Mode Activated
This session has been flagged for safety review. Please prioritize emotional safety and consider professional support.` : ''}`;
}

// Helper function to generate insights for a completed session
async function generateInsights(sessionId: string) {
  try {
    console.log('generateInsights called for session:', sessionId);
    const session = await JournalSession.findById(sessionId);
    if (!session) {
      console.error('Session not found for insights generation:', sessionId);
      return;
    }
    console.log('Session found, status:', session.status);

    // Get the couple and both partners
    const couple = await Couple.findById(session.coupleId);
    if (!couple) {
      console.error('Couple not found for session:', sessionId);
      return;
    }

    const partner1 = await User.findById(couple.partner1Id);
    const partner2 = await User.findById(couple.partner2Id);

    if (!partner1 || !partner2) {
      console.error('Partners not found for session:', sessionId);
      return;
    }

    // Create a journal entry object for analysis
    const journalEntry = {
      _id: session._id,
      coupleId: session.coupleId,
      partner1Id: couple.partner1Id,
      partner2Id: couple.partner2Id,
      partner1Chat: session.partner1Chat,
      partner2Chat: session.partner2Chat,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      isActive: session.isActive,
      isClosed: session.isClosed,
      status: session.status,
      messageCount: session.messageCount,
      wordCount: session.wordCount,
      lastMessageAt: session.lastMessageAt,
      completedAt: session.completedAt,
      insights: session.insights,
      partner1CompletedAt: session.partner1CompletedAt,
      partner2CompletedAt: session.partner2CompletedAt,
      analysisRequestedAt: session.analysisRequestedAt,
      insightsGeneratedAt: session.insightsGeneratedAt,
      notificationSent: session.notificationSent,
      themes: session.themes || [],
      summary: session.summary,
      sessionDurationMinutes: session.sessionDurationMinutes,
      mood: session.mood
    } as any; // Type assertion to match IJournalEntry

    // Generate AI analysis
    console.log('Starting AI analysis for session:', sessionId);
    const analysis = await analyzeJournalEntry(journalEntry, partner1, partner2);
    console.log('AI analysis completed for session:', sessionId);

    // Update session with insights (format analysis as readable text)
    console.log('Formatting analysis as text for session:', sessionId);
    const formattedInsights = formatAnalysisAsText(analysis);
    console.log('Formatted insights length:', formattedInsights.length);
    session.insights = formattedInsights;
    session.status = JournalSessionStatus.INSIGHTS_READY;
    session.insightsGeneratedAt = new Date();
    console.log('About to save session with insights for session:', sessionId);
    await session.save();
    console.log('Session successfully saved with insights for session:', sessionId);

    // Send notification to both partners
    await journalNotificationService.notifyInsightsReady(sessionId);

    console.log('Insights generated successfully for session:', sessionId);
  } catch (error) {
    console.error('Error generating insights:', error);
  }
}

// Create new journal session
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to create journal sessions' });
    }

    const journalSession = new JournalSession({
      coupleId: couple._id,
      title: 'New Journal Session',
      partner1Chat: [],
      partner2Chat: [],
      isActive: true,
      isClosed: false,
      status: JournalSessionStatus.CREATED,
      notificationSent: {
        partner1Complete: false,
        partner2Complete: false,
        insightsReady: false
      }
    });

    await journalSession.save();

    res.status(201).json({
      message: 'Journal session created',
      session: {
        id: journalSession._id,
        title: journalSession.title,
        isActive: journalSession.isActive,
        isClosed: journalSession.isClosed,
        messageCount: journalSession.messageCount,
        wordCount: journalSession.wordCount,
        lastMessageAt: journalSession.lastMessageAt,
        createdAt: journalSession.createdAt
      }
    });

  } catch (error) {
    console.error('Create journal session error:', error);
    res.status(500).json({ error: 'Failed to create journal session' });
  }
});

// Get active journal session for couple
router.get('/active', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to view journal sessions' });
    }

    const activeSession = await JournalSession.findOne({ 
      coupleId: couple._id,
      isActive: true,
      isClosed: false
    }).sort({ createdAt: -1 });

    if (!activeSession) {
      return res.status(404).json({ error: 'No active journal session found' });
    }

    // Determine which partner the current user is
    const isCurrentUserPartner1 = couple.partner1Id.equals(user._id);

    res.json({
      session: {
        id: activeSession._id,
        title: activeSession.title,
        partner1Chat: activeSession.partner1Chat,
        partner2Chat: activeSession.partner2Chat,
        isActive: activeSession.isActive,
        isClosed: activeSession.isClosed,
        status: activeSession.status,
        messageCount: activeSession.messageCount,
        wordCount: activeSession.wordCount,
        lastMessageAt: activeSession.lastMessageAt,
        createdAt: activeSession.createdAt,
        completedAt: activeSession.completedAt,
        insights: activeSession.insights,
        partner1CompletedAt: activeSession.partner1CompletedAt,
        partner2CompletedAt: activeSession.partner2CompletedAt,
        insightsGeneratedAt: activeSession.insightsGeneratedAt,
        isCurrentUserPartner1: isCurrentUserPartner1
      }
    });

  } catch (error) {
    console.error('Get active journal session error:', error);
    res.status(500).json({ error: 'Failed to get active journal session' });
  }
});

// Get all journal sessions for couple (thread list)
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

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to view journal sessions' });
    }

    // Build filter
    let filter: any = { coupleId: couple._id };
    if (status === 'active') {
      filter.isActive = true;
      filter.isClosed = false;
    } else if (status === 'closed') {
      filter.isClosed = true;
    }

    const sessions = await JournalSession.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title isActive isClosed lastMessageAt wordCount messageCount mood themes summary insights createdAt updatedAt completedAt');

    const total = await JournalSession.countDocuments(filter);

    // Format sessions for UI
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      title: session.title,
      isActive: session.isActive,
      isClosed: session.isClosed,
      lastMessageAt: session.lastMessageAt,
      wordCount: session.wordCount,
      messageCount: session.messageCount,
      mood: session.mood,
      themes: session.themes,
      summary: session.summary,
      insights: session.insights,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt,
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
        totalSessions: await JournalSession.countDocuments({ coupleId: couple._id }),
        activeSessions: await JournalSession.countDocuments({ coupleId: couple._id, isActive: true, isClosed: false }),
        closedSessions: await JournalSession.countDocuments({ coupleId: couple._id, isClosed: true })
      }
    });

  } catch (error) {
    console.error('Get journal sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve journal sessions' });
  }
});

// Get specific journal session with messages
router.get('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to view journal sessions' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    // Determine which partner the current user is
    const isCurrentUserPartner1 = couple.partner1Id.equals(user._id);

    res.json({
      session: {
        id: session._id,
        title: session.title,
        partner1Chat: session.partner1Chat,
        partner2Chat: session.partner2Chat,
        isActive: session.isActive,
        isClosed: session.isClosed,
        status: session.status,
        lastMessageAt: session.lastMessageAt,
        wordCount: session.wordCount,
        messageCount: session.messageCount,
        mood: session.mood,
        themes: session.themes,
        summary: session.summary,
        insights: session.insights,
        partner1CompletedAt: session.partner1CompletedAt,
        partner2CompletedAt: session.partner2CompletedAt,
        insightsGeneratedAt: session.insightsGeneratedAt,
        isCurrentUserPartner1: isCurrentUserPartner1,
        sessionDurationMinutes: session.sessionDurationMinutes,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt
      }
    });

  } catch (error) {
    console.error('Get journal session error:', error);
    res.status(500).json({ error: 'Failed to retrieve journal session' });
  }
});

// Save journal session (update messages)
router.put('/:sessionId/save', [
  body('partner1Chat').isArray().withMessage('partner1Chat must be an array'),
  body('partner2Chat').isArray().withMessage('partner2Chat must be an array')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { partner1Chat, partner2Chat } = req.body;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to save journal sessions' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    // Update messages
    session.partner1Chat = partner1Chat;
    session.partner2Chat = partner2Chat;
    session.isActive = true;

    await session.save();

    res.json({
      message: 'Journal session saved successfully',
      session: {
        id: session._id,
        title: session.title,
        isActive: session.isActive,
        isClosed: session.isClosed,
        messageCount: session.messageCount,
        wordCount: session.wordCount,
        lastMessageAt: session.lastMessageAt
      }
    });

  } catch (error) {
    console.error('Save journal session error:', error);
    res.status(500).json({ error: 'Failed to save journal session' });
  }
});

// Complete partner reflection (async workflow)
router.post('/:sessionId/complete-reflection', [
  body('chatHistory').isArray().withMessage('chatHistory must be an array')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId } = req.params;
    const { chatHistory } = req.body;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to complete reflections' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    // Determine which partner is completing
    const isPartner1 = couple.partner1Id.equals(user._id);
    const partnerId = isPartner1 ? couple.partner2Id : couple.partner1Id;
    
    console.log('Complete reflection - session status before update:', session.status);
    console.log('Complete reflection - isPartner1:', isPartner1);

    // Update the appropriate chat
    if (isPartner1) {
      session.partner1Chat = chatHistory;
      session.partner1CompletedAt = new Date();
      
      // Update status
      if (session.status === JournalSessionStatus.CREATED) {
        session.status = JournalSessionStatus.PARTNER1_COMPLETE;
        console.log('Updated status to PARTNER1_COMPLETE for session:', sessionId);
      }
    } else {
      session.partner2Chat = chatHistory;
      session.partner2CompletedAt = new Date();
      
      // Update status
      if (session.status === JournalSessionStatus.PARTNER1_COMPLETE) {
        session.status = JournalSessionStatus.PARTNER2_COMPLETE;
        console.log('Updated status to PARTNER2_COMPLETE for session:', sessionId);
      }
    }

    await session.save();
    console.log('Session saved with status:', session.status);
    
    // Verify the status was actually saved by refetching from database
    const savedSession = await JournalSession.findById(sessionId);
    console.log('Verified saved session status:', savedSession?.status);

    // Send notification to partner
    if (isPartner1 && !session.notificationSent.partner1Complete) {
      await journalNotificationService.notifyPartnerReflectionComplete(
        sessionId,
        user._id.toString(),
        partnerId.toString()
      );
    } else if (!isPartner1 && !session.notificationSent.partner2Complete) {
      await journalNotificationService.notifyPartnerReflectionComplete(
        sessionId,
        user._id.toString(),
        partnerId.toString()
      );
    }

    // If both partners have completed, trigger analysis
    if (session.status === JournalSessionStatus.PARTNER2_COMPLETE) {
      session.status = JournalSessionStatus.ANALYSIS_PENDING;
      session.analysisRequestedAt = new Date();
      await session.save();

      // Trigger AI analysis (this would be done asynchronously)
      console.log('Both partners completed, triggering insights generation for session:', sessionId);
      
      // Try immediate generation first, then fallback to setTimeout
      try {
        console.log('Attempting immediate insights generation for session:', sessionId);
        await generateInsights(sessionId);
        console.log('Immediate insights generation completed for session:', sessionId);
      } catch (error) {
        console.error('Immediate insights generation failed, trying setTimeout for session:', sessionId, error);
        setTimeout(async () => {
          try {
            console.log('Starting delayed insights generation for session:', sessionId);
            // Generate insights for the completed session
            await generateInsights(sessionId);
            console.log('Delayed insights generation completed for session:', sessionId);
          } catch (error) {
            console.error('Error generating insights for session:', sessionId, error);
          }
        }, 2000); // Increased delay to 2 seconds
      }
    }

    console.log('Returning response with status:', session.status);
    res.json({
      message: 'Reflection completed successfully',
      session: {
        id: session._id,
        status: session.status,
        partner1CompletedAt: session.partner1CompletedAt,
        partner2CompletedAt: session.partner2CompletedAt
      }
    });

  } catch (error) {
    console.error('Complete reflection error:', error);
    res.status(500).json({ error: 'Failed to complete reflection' });
  }
});

// Close journal session
router.put('/:sessionId/close', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to close journal sessions' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    session.isClosed = true;
    session.isActive = false;
    session.completedAt = new Date();
    
    // Calculate session duration
    if (session.partner1Chat.length > 0 || session.partner2Chat.length > 0) {
      const allMessages = [...session.partner1Chat, ...session.partner2Chat];
      if (allMessages.length > 0) {
        const firstMessage = allMessages[0];
        const lastMessage = allMessages[allMessages.length - 1];
        const durationMs = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
        session.sessionDurationMinutes = Math.ceil(durationMs / (1000 * 60));
      }
    }

    await session.save();

    res.json({
      message: 'Journal session closed successfully',
      session: {
        id: session._id,
        title: session.title,
        isActive: session.isActive,
        isClosed: session.isClosed,
        sessionDurationMinutes: session.sessionDurationMinutes,
        completedAt: session.completedAt
      }
    });

  } catch (error) {
    console.error('Close journal session error:', error);
    res.status(500).json({ error: 'Failed to close journal session' });
  }
});

// Manually trigger insights generation for stuck sessions
router.post('/:sessionId/generate-insights', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to generate insights' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    if (session.status !== JournalSessionStatus.ANALYSIS_PENDING) {
      return res.status(400).json({ error: 'Session is not in analysis pending status' });
    }

    console.log('Manually triggering insights generation for session:', sessionId);
    await generateInsights(sessionId);

    // Refresh session data
    const updatedSession = await JournalSession.findById(sessionId);
    
    res.json({
      message: 'Insights generation triggered successfully',
      session: {
        id: updatedSession?._id,
        status: updatedSession?.status,
        insights: updatedSession?.insights ? 'Generated' : 'Still processing'
      }
    });

  } catch (error) {
    console.error('Manual insights generation error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Get AI insights for journal session
router.get('/:sessionId/insights', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to get insights' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    // Get partner data for context
    const partner1 = await User.findById(couple.partner1Id);
    const partner2 = await User.findById(couple.partner2Id);

    // Generate insights using AI service
    let insights = '';
    try {
      // Create a mock journal entry for analysis
      const mockJournalEntry = {
        partner1Chat: session.partner1Chat,
        partner2Chat: session.partner2Chat,
        coupleId: session.coupleId
      };
      
      // Use the existing analysis function
      const analysis = await require('../services/aiService').analyzeJournalEntry(
        mockJournalEntry, 
        partner1, 
        partner2
      );
      
      insights = `## Relationship Insights

**Summary:** ${analysis.summary}

**Strengths:**
${formatList(analysis.strengths).split('\n').map(line => line.startsWith('- ') ? `• ${line.substring(2)}` : line).join('\n')}

**Growth Opportunities:**
${formatList(analysis.opportunities).split('\n').map(line => line.startsWith('- ') ? `• ${line.substring(2)}` : line).join('\n')}

**Communication Patterns:**
• Criticism: ${analysis.fourHorsemen.criticism ? 'Present' : 'Not detected'}
• Contempt: ${analysis.fourHorsemen.contempt ? 'Present' : 'Not detected'}
• Defensiveness: ${analysis.fourHorsemen.defensiveness ? 'Present' : 'Not detected'}
• Stonewalling: ${analysis.fourHorsemen.stonewalling ? 'Present' : 'Not detected'}

**Emotional Intelligence:**
• Empathy Level: ${analysis.emotionalIntelligence?.empathyLevel || 'Not assessed'}
• Emotional Regulation: ${analysis.emotionalIntelligence?.emotionalRegulation || 'Not assessed'}
• Communication Style: ${analysis.emotionalIntelligence?.communicationStyle || 'Not assessed'}
• Emotional Validation: ${analysis.emotionalIntelligence?.emotionalValidation || 'Not assessed'}

**Attachment Patterns:**
• Secure Behaviors: ${analysis.attachmentPatterns?.secure || 'Not observed'}
• Anxious Patterns: ${analysis.attachmentPatterns?.anxious || 'Not observed'}
• Avoidant Patterns: ${analysis.attachmentPatterns?.avoidant || 'Not observed'}

**Conflict Resolution:**
• Style: ${analysis.conflictResolution?.style || 'Not assessed'}
• Effectiveness: ${analysis.conflictResolution?.effectiveness || 'Not assessed'}
• Repair Attempts: ${analysis.conflictResolution?.repairAttempts || 'Not identified'}

**Relationship Satisfaction:**
• Overall Score: ${analysis.relationshipSatisfaction?.overallScore || 'Not assessed'}/10
• Key Factors: ${analysis.relationshipSatisfaction?.keyFactors || 'Not identified'}
• Improvement Areas: ${analysis.relationshipSatisfaction?.improvementAreas || 'Not identified'}

**Repair Plan:**
${formatList(analysis.repairPlan).split('\n').map(line => line.startsWith('- ') ? `• ${line.substring(2)}` : line).join('\n')}

${analysis.safetyMode ? `\n⚠️ **Safety Notice:** ${formatList(analysis.riskFlags)}` : ''}`;
      
    } catch (aiError) {
      console.error('AI insights error:', aiError);
      insights = 'Insights are temporarily unavailable. Please try again later.';
    }

    // Update session with insights
    session.insights = insights;
    session.status = JournalSessionStatus.INSIGHTS_READY;
    session.insightsGeneratedAt = new Date();
    await session.save();

    // Send notification to both partners
    await journalNotificationService.notifyInsightsReady(sessionId);

    res.json({
      insights,
      session: {
        id: session._id,
        title: session.title,
        themes: session.themes,
        mood: session.mood
      }
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Update journal session title
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

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to update journal sessions' });
    }

    const session = await JournalSession.findOne({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
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

// Delete journal session
router.delete('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user!;

    // Get user's couple
    const couple = await Couple.findOne({
      $or: [
        { partner1Id: user._id },
        { partner2Id: user._id }
      ]
    });

    if (!couple) {
      return res.status(400).json({ error: 'User must be in a couple to delete journal sessions' });
    }

    const session = await JournalSession.findOneAndDelete({
      _id: sessionId,
      coupleId: couple._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Journal session not found' });
    }

    res.json({
      message: 'Journal session deleted successfully'
    });

  } catch (error) {
    console.error('Delete journal session error:', error);
    res.status(500).json({ error: 'Failed to delete journal session' });
  }
});

export default router;
