import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { IUser } from '../models/User';

interface IUserResponse {
  id: string;
  email: string;
  name?: string;
  pairingCode: string;
  coupleId?: string;
  isOnboardingComplete: boolean;
  dateJoined: Date;
  lastActive: Date;
  profile: {
    firstName?: string;
    lastName?: string;
    age?: number;
    gender?: string;
    location?: { city?: string; country?: string };
    relationshipStatus?: string;
    relationshipDuration?: { years?: number; months?: number };
    livingTogether?: boolean;
    hasChildren?: boolean;
    childrenAges?: number[];
    primaryGoals?: string[];
    relationshipChallenges?: string[];
    communicationStyle?: string;
    onboardingStep?: number;
  };
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
    timezone: string;
    communicationStyle: string;
    privacyLevel: string;
  };
}

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
import { User } from '../models/User';
import { generateAccessToken } from '../middleware/auth';

const router = express.Router();

// Generate unique pairing code
const generatePairingCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates a 6-character hex string
};

const createUserResponse = (user: IUser): IUserResponse => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
    pairingCode: user.pairingCode,
    coupleId: user.coupleId?.toString(),
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
};

// Register new user
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Invalid credentials' });
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

    const userResponse = createUserResponse(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
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

    const userResponse = createUserResponse(user);

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
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user data
router.get('/me', async (req: Request, res: Response) => {
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

    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = createUserResponse(user);

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
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



const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).optional(),
  isOnboardingComplete: z.boolean().optional(),
  profile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    age: z.number().optional(),
    gender: z.string().optional(),
    location: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    relationshipStatus: z.string().optional(),
    relationshipDuration: z.object({
      years: z.number().optional(),
      months: z.number().optional(),
    }).optional(),
    livingTogether: z.boolean().optional(),
    hasChildren: z.boolean().optional(),
    childrenAges: z.array(z.number()).optional(),
    primaryGoals: z.array(z.string()).optional(),
    relationshipChallenges: z.array(z.string()).optional(),
    communicationStyle: z.string().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.string().optional(),
    notifications: z.boolean().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
    communicationStyle: z.string().optional(),
    privacyLevel: z.string().optional(),
  }).optional(),
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

    const updateData = updateProfileSchema.parse(req.body);
    const userId = decoded.userId;

    console.log(`Profile update request for user ${userId}:`, JSON.stringify(updateData, null, 2));

    // Create a mutable copy of updateData for processing
    const processedData: any = { ...updateData };

    // Check if this is an onboarding completion
    if (processedData.isOnboardingComplete && !processedData.onboardingCompletedAt) {
      processedData.onboardingCompletedAt = new Date();
    }

    // Check if email is already taken by another user
    if (processedData.email) {
      const currentUser = await User.findById(userId);
      if (currentUser && processedData.email !== currentUser.email) {
        const existingUser = await User.findOne({ 
          email: processedData.email, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }
    }

    // Handle nested profile data - flatten it for the User model
    if (processedData.profile) {
      // Merge profile data into the main update object
      Object.assign(processedData, processedData.profile);
      delete processedData.profile;
    }

    // Convert relationshipDuration object to string if needed
    if (processedData.relationshipDuration && typeof processedData.relationshipDuration === 'object') {
      const { years = 0, months = 0 } = processedData.relationshipDuration;
      processedData.relationshipDuration = `${years} years, ${months} months`;
    }

    // Convert location object to string if needed
    if (processedData.location && typeof processedData.location === 'object') {
      const { city, country } = processedData.location;
      processedData.location = [city, country].filter(Boolean).join(', ');
    }

    // Ensure arrays are properly handled
    if (processedData.primaryGoals && !Array.isArray(processedData.primaryGoals)) {
      processedData.primaryGoals = [];
    }
    if (processedData.relationshipChallenges && !Array.isArray(processedData.relationshipChallenges)) {
      processedData.relationshipChallenges = [];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: processedData, lastActive: new Date() },
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