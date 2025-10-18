import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { PartnerChat, IPartnerMessage } from '../models/PartnerChat';
import { Couple } from '../models/Couple';
import { User } from '../models/User';

const router = express.Router();

// Get or create partner chat for a couple
router.get('/conversation', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to access partner chat' });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    // Find existing chat or create new one
    let partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    
    if (!partnerChat) {
      partnerChat = new PartnerChat({
        coupleId: user.coupleId,
        partner1Id: couple.partner1Id,
        partner2Id: couple.partner2Id,
        messages: []
      });
      await partnerChat.save();
    }

    // Get partner info
    const partnerId = couple.partner1Id.equals(user._id) ? couple.partner2Id : couple.partner1Id;
    const partner = await User.findById(partnerId).select('firstName lastName email profile');

    // Mark messages as read for current user
    const isPartner1 = couple.partner1Id.equals(user._id);
    let hasUnreadMessages = false;

    partnerChat.messages.forEach(message => {
      if (message.receiverId.equals(user._id) && !message.isRead) {
        message.isRead = true;
        hasUnreadMessages = true;
      }
    });

    if (hasUnreadMessages) {
      await partnerChat.save();
    }

    res.json({
      chat: {
        id: partnerChat._id,
        messages: partnerChat.messages,
        totalMessages: partnerChat.totalMessages,
        lastMessageAt: partnerChat.lastMessageAt,
        unreadCount: isPartner1 ? partnerChat.unreadCount.partner1 : partnerChat.unreadCount.partner2
      },
      partner: {
        id: partner?._id,
        name: partner?.firstName || 'Partner',
        email: partner?.email,
        isOnline: false // TODO: Implement online status
      }
    });

  } catch (error) {
    console.error('Get partner chat error:', error);
    res.status(500).json({ error: 'Failed to retrieve partner chat' });
  }
});

// Send message to partner
router.post('/send', [
  body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('messageType').optional().isIn(['text', 'emoji', 'voice']).withMessage('Invalid message type')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, messageType = 'text' } = req.body;
    const user = req.user!;

    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to send messages' });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    // Get partner ID
    const partnerId = couple.partner1Id.equals(user._id) ? couple.partner2Id : couple.partner1Id;

    // Find or create partner chat
    let partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    
    if (!partnerChat) {
      partnerChat = new PartnerChat({
        coupleId: user.coupleId,
        partner1Id: couple.partner1Id,
        partner2Id: couple.partner2Id,
        messages: []
      });
    }

    // Create new message
    const newMessage: IPartnerMessage = {
      senderId: user._id,
      receiverId: partnerId,
      text: message,
      timestamp: new Date(),
      isRead: false,
      messageType
    };

    partnerChat.messages.push(newMessage);
    await partnerChat.save();

    // Get the saved message with its ID
    const savedMessage = partnerChat.messages[partnerChat.messages.length - 1];

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: savedMessage,
      chat: {
        id: partnerChat._id,
        totalMessages: partnerChat.totalMessages,
        lastMessageAt: partnerChat.lastMessageAt
      }
    });

  } catch (error) {
    console.error('Send partner message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/mark-read', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to mark messages as read' });
    }

    const partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    if (!partnerChat) {
      return res.status(404).json({ error: 'Partner chat not found' });
    }

    // Mark all unread messages for this user as read
    let hasUpdates = false;
    partnerChat.messages.forEach(message => {
      if (message.receiverId.equals(user._id) && !message.isRead) {
        message.isRead = true;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      await partnerChat.save();
    }

    res.json({
      message: 'Messages marked as read',
      unreadCount: 0
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.json({ unreadCount: 0 });
    }

    const partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    if (!partnerChat) {
      return res.json({ unreadCount: 0 });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.json({ unreadCount: 0 });
    }

    const isPartner1 = couple.partner1Id.equals(user._id);
    const unreadCount = isPartner1 ? partnerChat.unreadCount.partner1 : partnerChat.unreadCount.partner2;

    res.json({
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Delete message (soft delete)
router.delete('/message/:messageId', async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const user = req.user!;

    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to delete messages' });
    }

    const partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    if (!partnerChat) {
      return res.status(404).json({ error: 'Partner chat not found' });
    }

    const message = partnerChat.messages.find((msg: any) => msg._id.toString() === messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete their own messages
    if (!message.senderId.equals(user._id)) {
      return res.status(403).json({ error: 'Can only delete your own messages' });
    }

    // Soft delete
    message.deletedAt = new Date();
    await partnerChat.save();

    res.json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Edit message
router.put('/message/:messageId', [
  body('text').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { messageId } = req.params;
    const { text } = req.body;
    const user = req.user!;

    if (!user.coupleId) {
      return res.status(400).json({ error: 'Must be paired to edit messages' });
    }

    const partnerChat = await PartnerChat.findOne({ coupleId: user.coupleId });
    if (!partnerChat) {
      return res.status(404).json({ error: 'Partner chat not found' });
    }

    const message = partnerChat.messages.find((msg: any) => msg._id.toString() === messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can edit their own messages
    if (!message.senderId.equals(user._id)) {
      return res.status(403).json({ error: 'Can only edit your own messages' });
    }

    // Don't allow editing deleted messages
    if (message.deletedAt) {
      return res.status(400).json({ error: 'Cannot edit deleted messages' });
    }

    message.text = text;
    message.editedAt = new Date();
    await partnerChat.save();

    res.json({
      message: 'Message updated successfully',
      messageData: message
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

export default router;