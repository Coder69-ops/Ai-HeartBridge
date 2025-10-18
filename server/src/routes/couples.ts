import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Couple } from '../models/Couple';

const router = express.Router();

// Pair with another user
router.post('/pair', [
  body('pairingCode').isLength({ min: 6, max: 6 }).withMessage('Pairing code must be 6 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pairingCode } = req.body;
    const currentUser = req.user!;

    // Check if user is already paired
    if (currentUser.coupleId) {
      return res.status(400).json({ error: 'You are already paired with someone' });
    }

    // Find partner by pairing code
    const partner = await User.findOne({ 
      pairingCode: pairingCode.toUpperCase(),
      isActive: true 
    });

    if (!partner) {
      return res.status(404).json({ error: 'Invalid pairing code' });
    }

    if (partner._id.equals(currentUser._id)) {
      return res.status(400).json({ error: 'You cannot pair with yourself' });
    }

    if (partner.coupleId) {
      return res.status(400).json({ error: 'This user is already paired' });
    }

    // Create couple
    const couple = new Couple({
      partner1Id: currentUser._id,
      partner2Id: partner._id
    });

    await couple.save();

    // Update both users
    await User.updateMany(
      { _id: { $in: [currentUser._id, partner._id] } },
      { coupleId: couple._id }
    );

    // Return updated users
    const updatedCurrentUser = await User.findById(currentUser._id).select('-password');
    const updatedPartner = await User.findById(partner._id).select('-password');

    res.json({
      message: 'Successfully paired',
      couple: couple,
      currentUser: updatedCurrentUser,
      partner: updatedPartner
    });

  } catch (error) {
    console.error('Pairing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get couple information
router.get('/info', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(404).json({ error: 'No couple found' });
    }

    const couple = await Couple.findById(user.coupleId)
      .populate('partner1Id', '-password')
      .populate('partner2Id', '-password');

    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    res.json({ couple });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update couple goals
router.put('/goals', [
  body('goals').isArray().withMessage('Goals must be an array'),
  body('goals.*').isLength({ max: 500 }).withMessage('Each goal must be under 500 characters')
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { goals } = req.body;
    const user = req.user!;

    if (!user.coupleId) {
      return res.status(404).json({ error: 'No couple found' });
    }

    const couple = await Couple.findByIdAndUpdate(
      user.coupleId,
      { sharedGoals: goals },
      { new: true, runValidators: true }
    );

    res.json({ 
      message: 'Goals updated successfully',
      couple 
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unpair (end relationship)
router.delete('/unpair', async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.status(404).json({ error: 'No couple found' });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.status(404).json({ error: 'Couple not found' });
    }

    // Update couple status instead of deleting
    await Couple.findByIdAndUpdate(
      user.coupleId,
      { status: 'inactive' }
    );

    // Remove couple reference from both users
    await User.updateMany(
      { _id: { $in: [couple.partner1Id, couple.partner2Id] } },
      { $unset: { coupleId: 1 } }
    );

    res.json({ message: 'Successfully unpaired' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;