import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import winston from 'winston';

// Extend Express Request interface to include io
declare global {
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
}

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import coupleRoutes from './routes/couples';

import journalSessionRoutes from './routes/journalSessions';
import chatSessionRoutes from './routes/chatSessions';
import partnerChatRoutes from './routes/partnerChat';
import exerciseRoutes from './routes/exercises';
import checkInRoutes from './routes/checkIns';
import analyticsRoutes from './routes/analytics';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

dotenv.config();

import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-heartbridge-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

app.use(cors({
  origin: true,  // Allow all origins temporarily
  credentials: true
}));

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very permissive in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Only apply general rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // More permissive in development
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/couples', authenticateToken, coupleRoutes);

app.use('/api/journal-sessions', (req, res, next) => {
  req.io = io;
  next();
}, authenticateToken, journalSessionRoutes);
app.use('/api/chat-sessions', authenticateToken, chatSessionRoutes);
app.use('/api/partner-chat', authenticateToken, partnerChatRoutes);
app.use('/api/exercises', authenticateToken, exerciseRoutes); // Protected endpoint - auth required for exercises
app.use('/api/checkins', authenticateToken, checkInRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      logger.warn('MONGODB_URI not set - running without database');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    // Don't exit - let server run for health checks
    throw error;
  }
};

// Start server
const startServer = async () => {
  try {
    // Start server first, then connect to DB
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
    
    // Connect to database (non-blocking)
    connectDB().catch((error) => {
      logger.error('Database connection failed:', error);
      // Don't exit - server can run without DB for health checks
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, server };