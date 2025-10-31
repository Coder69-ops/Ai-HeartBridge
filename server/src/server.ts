import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import winston from 'winston';

// Extend Express Request interface to include io and onlineUsers
declare global {
  namespace Express {
    interface Request {
      io?: Server;
      onlineUsers?: Map<string, { socketId: string; lastSeen: Date }>;
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

// Online users tracking
const onlineUsers = new Map<string, { socketId: string; lastSeen: Date }>();

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // User authentication and online status
  socket.on('user_online', (userId: string) => {
    if (userId) {
      onlineUsers.set(userId, { 
        socketId: socket.id, 
        lastSeen: new Date() 
      });
      
      // Join user to their personal room
      socket.join(userId);
      
      // Notify partner about online status
      socket.broadcast.emit('partner_status_changed', { 
        userId, 
        isOnline: true 
      });
      
      console.log(`User ${userId} is now online`);
    }
  });

  // Handle heartbeat to keep user online
  socket.on('heartbeat', (userId: string) => {
    if (userId && onlineUsers.has(userId)) {
      onlineUsers.set(userId, { 
        socketId: socket.id, 
        lastSeen: new Date() 
      });
    }
  });

  // Check partner online status
  socket.on('check_partner_status', (partnerId: string, callback) => {
    const isOnline = onlineUsers.has(partnerId);
    const lastSeen = onlineUsers.get(partnerId)?.lastSeen;
    callback({ isOnline, lastSeen });
  });

  socket.on('disconnect', () => {
    // Find and remove user from online users
    let disconnectedUserId: string | null = null;
    for (const [userId, userData] of onlineUsers.entries()) {
      if (userData.socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    
    if (disconnectedUserId) {
      // Notify partner about offline status
      socket.broadcast.emit('partner_status_changed', { 
        userId: disconnectedUserId, 
        isOnline: false 
      });
      
      console.log(`User ${disconnectedUserId} is now offline`);
    }
    
    console.log('user disconnected:', socket.id);
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = new Date();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, userData] of onlineUsers.entries()) {
      if (now.getTime() - userData.lastSeen.getTime() > staleThreshold) {
        onlineUsers.delete(userId);
        socket.broadcast.emit('partner_status_changed', { 
          userId, 
          isOnline: false 
        });
      }
    }
  }, 60000); // Check every minute
});

// Middleware to add io and onlineUsers to requests
app.use((req: any, res, next) => {
  req.io = io;
  req.onlineUsers = onlineUsers;
  next();
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

// Rate limiting disabled

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
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