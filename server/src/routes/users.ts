import express from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Couple } from '../models/Couple';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!._id)
      .select('-password')
      .populate('coupleId');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (PUT)
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const updateData = req.body;
    const userId = req.user!._id;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.coupleId;

    // Check if email is already taken by another user
    if (updateData.email && updateData.email !== req.user!.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (PATCH) - for partial updates
router.patch('/profile', async (req: AuthRequest, res) => {
  try {
    const updateData = req.body;
    const userId = req.user!._id;

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.coupleId;

    // Check if email is already taken by another user
    if (updateData.email && updateData.email !== req.user!.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Profile patch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get partner information
router.get('/partner', async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    
    if (!user.coupleId) {
      return res.json({ partner: null });
    }

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      return res.json({ partner: null });
    }

    const partnerId = couple.partner1Id.equals(user._id) 
      ? couple.partner2Id 
      : couple.partner1Id;

    const partner = await User.findById(partnerId).select('-password');
    
    res.json({ partner });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate account
router.delete('/account', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    // Mark user as inactive instead of deleting
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({ message: 'Account deactivated successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;