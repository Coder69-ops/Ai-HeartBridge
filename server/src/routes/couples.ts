import express, { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Couple } from '../models/Couple';

const router = express.Router();

const pairSchema = z.object({
  pairingCode: z.string().length(6, { message: 'Pairing code must be 6 characters' })
});

// Pair with another user
router.post('/pair', async (req: AuthRequest, res: Response) => {
  try {
    const { pairingCode } = pairSchema.parse(req.body);
    const currentUser = req.user!;

    console.log('Pairing attempt:', {
      currentUser: currentUser.email,
      currentUserId: currentUser._id,
      currentUserCoupleId: currentUser.coupleId,
      pairingCode: pairingCode
    });

    // Check if user is already in an active couple
    if (currentUser.coupleId) {
      const existingCouple = await Couple.findById(currentUser.coupleId);
      if (existingCouple && existingCouple.status === 'active') {
        return res.status(400).json({ error: 'You are already paired with someone' });
      }
      // If couple is inactive or doesn't exist, clear the reference and continue
      if (!existingCouple || existingCouple.status !== 'active') {
        await User.findByIdAndUpdate(currentUser._id, { $unset: { coupleId: 1 } });
        currentUser.coupleId = undefined;
      }
    }

    // Find partner by pairing code
    const partner = await User.findOne({ 
      pairingCode: pairingCode.toUpperCase(),
      isActive: true 
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found with that pairing code' });
    }

    console.log('Partner found:', {
      partner: partner.email,
      partnerId: partner._id,
      partnerCoupleId: partner.coupleId
    });

    if (partner._id.equals(currentUser._id)) {
      return res.status(400).json({ error: 'Cannot pair with yourself' });
    }

    // Check if partner is already in an active couple
    if (partner.coupleId) {
      const partnerCouple = await Couple.findById(partner.coupleId);
      if (partnerCouple && partnerCouple.status === 'active') {
        return res.status(400).json({ error: 'Partner is already paired with someone else' });
      }
      // If partner's couple is inactive or doesn't exist, clear the reference and continue
      if (!partnerCouple || partnerCouple.status !== 'active') {
        await User.findByIdAndUpdate(partner._id, { $unset: { coupleId: 1 } });
        partner.coupleId = undefined;
      }
    }

    // Check if these two users have an existing couple (active or inactive)
    let couple = await Couple.findOne({
      $or: [
        { partner1Id: currentUser._id, partner2Id: partner._id },
        { partner1Id: partner._id, partner2Id: currentUser._id }
      ]
    });

    if (couple) {
      // If couple exists but is inactive, reactivate it
      if (couple.status !== 'active') {
        couple.status = 'active';
        await couple.save();
        console.log('Reactivating existing couple:', couple._id);
      } else {
        // This shouldn't happen due to our earlier checks, but just in case
        console.log('Couple already active, returning existing relationship');
      }
    } else {
      // Create new couple with consistent partner ordering (smaller ObjectId first)
      const partnerId1 = currentUser._id.toString() < partner._id.toString() ? currentUser._id : partner._id;
      const partnerId2 = currentUser._id.toString() < partner._id.toString() ? partner._id : currentUser._id;
      
      try {
        couple = new Couple({
          partner1Id: partnerId1,
          partner2Id: partnerId2
        });
        await couple.save();
        console.log('Created new couple:', couple._id);
      } catch (duplicateError: any) {
        // If we still get a duplicate key error, find the existing couple
        if (duplicateError.code === 11000) {
          console.log('Duplicate key error caught, finding existing couple...');
          couple = await Couple.findOne({
            $or: [
              { partner1Id: currentUser._id, partner2Id: partner._id },
              { partner1Id: partner._id, partner2Id: currentUser._id }
            ]
          });
          
          if (!couple) {
            throw new Error('Could not find or create couple relationship');
          }
          
          // Ensure the couple is active
          if (couple.status !== 'active') {
            couple.status = 'active';
            await couple.save();
            console.log('Activated existing couple after duplicate key error:', couple._id);
          }
        } else {
          throw duplicateError;
        }
      }
    }

    // Update both users with the couple ID
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

  } catch (error: any) {
    console.error('Pairing error:', error);
    console.error('Request body:', req.body);
    console.error('Current user:', req.user?.email);
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.issues?.map((issue: any) => issue.message) || []
      });
    }
    
    // Handle MongoDB duplicate key errors (as a final fallback)
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'You are already paired with this person or a pairing is in progress. Please try again.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error during pairing' });
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

const updateGoalsSchema = z.object({
  goals: z.array(z.string().max(500, { message: 'Each goal must be under 500 characters' }))
});

// Update couple goals
router.put('/goals', async (req: AuthRequest, res: Response) => {
  try {
    const { goals } = updateGoalsSchema.parse(req.body);
    const user = req.user!;

    if (!user.coupleId) {
      return res.status(403).json({ error: 'You are not paired with anyone' });
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

    // Remove couple reference from both users
    await User.updateMany(
      { _id: { $in: [couple.partner1Id, couple.partner2Id] } },
      { $unset: { coupleId: 1 } }
    );

    // Set couple status to inactive
    couple.status = 'inactive';
    await couple.save();

    res.json({ message: 'Successfully unpaired' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;