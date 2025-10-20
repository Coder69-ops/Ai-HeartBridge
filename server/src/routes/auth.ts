import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateAccessToken } from '../middleware/auth';

const router = express.Router();

// Generate unique pairing code
const generatePairingCode = (): string => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Register new user
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique pairing code
    let pairingCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      pairingCode = generatePairingCode();
      const existingCode = await User.findOne({ pairingCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      pairingCode: pairingCode!
    });

    await user.save();

    // Generate token
    const token = generateAccessToken(user._id.toString());

    // Create complete user object for frontend
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
      pairingCode: user.pairingCode,
      coupleId: user.coupleId,
      isOnboardingComplete: user.isOnboardingComplete || false,
      dateJoined: user.createdAt,
      lastActive: user.lastActive,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        location: user.location ? {
          city: user.location.split(',')[0]?.trim(),
          country: user.location.split(',')[1]?.trim()
        } : undefined,
        relationshipStatus: user.relationshipStatus,
        relationshipDuration: user.relationshipDuration ? {
          years: parseInt(user.relationshipDuration.split(' ')[0]) || 0,
          months: parseInt(user.relationshipDuration.split(' ')[2]) || 0
        } : undefined,
        livingTogether: user.livingTogether,
        hasChildren: user.hasChildren,
        childrenAges: user.childrenAges,
        primaryGoals: user.primaryGoals,
        relationshipChallenges: user.relationshipChallenges,
        communicationStyle: user.communicationStyle,
        onboardingStep: user.isOnboardingComplete ? undefined : 0
      },
      preferences: {
        theme: 'system',
        notifications: user.notificationSettings?.dailyCheckins !== false,
        language: 'en',
        timezone: 'auto',
        communicationStyle: user.communicationStyle || 'gentle',
        privacyLevel: user.privacyLevel || 'private'
      }
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req: Request, res: Response) => {
  try {
    console.log('🔐 Backend Login Request:');
    console.log('   Origin:', req.headers.origin);
    console.log('   User-Agent:', req.headers['user-agent']);
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Body:', { email: req.body.email, password: '[HIDDEN]' });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateAccessToken(user._id.toString());

    // Create complete user object for frontend
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
      pairingCode: user.pairingCode,
      coupleId: user.coupleId,
      isOnboardingComplete: user.isOnboardingComplete || false,
      dateJoined: user.createdAt,
      lastActive: user.lastActive,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        location: user.location ? {
          city: user.location.split(',')[0]?.trim(),
          country: user.location.split(',')[1]?.trim()
        } : undefined,
        relationshipStatus: user.relationshipStatus,
        relationshipDuration: user.relationshipDuration ? {
          years: parseInt(user.relationshipDuration.split(' ')[0]) || 0,
          months: parseInt(user.relationshipDuration.split(' ')[2]) || 0
        } : undefined,
        livingTogether: user.livingTogether,
        hasChildren: user.hasChildren,
        childrenAges: user.childrenAges,
        primaryGoals: user.primaryGoals,
        relationshipChallenges: user.relationshipChallenges,
        communicationStyle: user.communicationStyle,
        onboardingStep: user.isOnboardingComplete ? undefined : 0
      },
      preferences: {
        theme: 'system',
        notifications: user.notificationSettings?.dailyCheckins !== false,
        language: 'en',
        timezone: 'auto',
        communicationStyle: user.communicationStyle || 'gentle',
        privacyLevel: user.privacyLevel || 'private'
      }
    };

    console.log('✅ Backend Login Success:');
    console.log('   User found:', user.email);
    console.log('   Token generated:', token ? 'Yes' : 'No');
    console.log('   Sending response...');
    
    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token (extend session)
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    // Verify and generate new token
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Invalid token or user not found' });
    }

    const newToken = generateAccessToken(user._id.toString());

    res.json({
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        pairingCode: user.pairingCode,
        coupleId: user.coupleId
      }
    });

  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Register route alias for compatibility  
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique pairing code
    let pairingCode: string;
    let isUnique = false;
    
    while (!isUnique) {
      pairingCode = generatePairingCode();
      const existingCode = await User.findOne({ pairingCode });
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      pairingCode: pairingCode!
    });

    await user.save();

    // Generate token
    const token = generateAccessToken(user._id.toString());

    // Create complete user object for frontend
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
      pairingCode: user.pairingCode,
      coupleId: user.coupleId,
      isOnboardingComplete: user.isOnboardingComplete || false,
      dateJoined: user.createdAt,
      lastActive: user.lastActive,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        location: user.location ? {
          city: user.location.split(',')[0]?.trim(),
          country: user.location.split(',')[1]?.trim()
        } : undefined,
        relationshipStatus: user.relationshipStatus,
        relationshipDuration: user.relationshipDuration ? {
          years: parseInt(user.relationshipDuration.split(' ')[0]) || 0,
          months: parseInt(user.relationshipDuration.split(' ')[2]) || 0
        } : undefined,
        livingTogether: user.livingTogether,
        hasChildren: user.hasChildren,
        childrenAges: user.childrenAges,
        primaryGoals: user.primaryGoals,
        relationshipChallenges: user.relationshipChallenges,
        communicationStyle: user.communicationStyle,
        onboardingStep: user.isOnboardingComplete ? undefined : 0
      },
      preferences: {
        theme: 'system',
        notifications: user.notificationSettings?.dailyCheckins !== false,
        language: 'en',
        timezone: 'auto',
        communicationStyle: user.communicationStyle || 'gentle',
        privacyLevel: user.privacyLevel || 'private'
      }
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (PATCH) - for onboarding completion
router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const updateData = req.body;
    const userId = decoded.userId;

    console.log(`Profile update request for user ${userId}:`, JSON.stringify(updateData, null, 2));

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData._id;
    delete updateData.id;

    // Check if this is an onboarding completion
    if (updateData.isOnboardingComplete && !updateData.onboardingCompletedAt) {
      updateData.onboardingCompletedAt = new Date();
    }

    // Check if email is already taken by another user
    if (updateData.email) {
      const currentUser = await User.findById(userId);
      if (currentUser && updateData.email !== currentUser.email) {
        const existingUser = await User.findOne({ 
          email: updateData.email, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }
    }

    // Handle nested profile data - flatten it for the User model
    if (updateData.profile) {
      // Merge profile data into the main update object
      Object.assign(updateData, updateData.profile);
      delete updateData.profile;
    }

    // Convert relationshipDuration object to string if needed
    if (updateData.relationshipDuration && typeof updateData.relationshipDuration === 'object') {
      const { years = 0, months = 0 } = updateData.relationshipDuration;
      updateData.relationshipDuration = `${years} years, ${months} months`;
    }

    // Convert location object to string if needed
    if (updateData.location && typeof updateData.location === 'object') {
      const { city, country } = updateData.location;
      updateData.location = [city, country].filter(Boolean).join(', ');
    }

    // Ensure arrays are properly handled
    if (updateData.primaryGoals && !Array.isArray(updateData.primaryGoals)) {
      updateData.primaryGoals = [];
    }
    if (updateData.relationshipChallenges && !Array.isArray(updateData.relationshipChallenges)) {
      updateData.relationshipChallenges = [];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Profile updated successfully for user ${userId}`);

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser.toObject()
    });

  } catch (error) {
    console.error('Auth profile update error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;