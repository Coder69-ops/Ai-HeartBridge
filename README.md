# 💝 AI HeartBridge - Complete Full-Stack Relationship Therapy Platform

## Overview

AI HeartBridge is a professional-grade, full-stack relationship therapy application featuring a modern React frontend and robust Node.js/Express/MongoDB backend. Built with evidence-based therapeutic frameworks (Gottman Method, NVC, EFT), the platform provides couples with AI-powered relationship insights, guided communication exercises, and comprehensive progress tracking—all in a secure, privacy-first environment.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (already configured)
- Git

### Backend Setup
```bash
cd server
npm install
npm run seed    # Populate database with exercises
npm run dev     # Start backend server on port 3001
```

### Frontend Setup
```bash
npm install
npm run dev     # Start frontend on port 5173
```

## 🎯 What's Been Implemented

### ✅ Complete Backend Infrastructure
- **Express.js Server** with TypeScript
- **MongoDB Integration** with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Rate Limiting** and security middleware
- **Comprehensive API** with full CRUD operations

### ✅ Database Models
- **User Model** - Authentication, pairing codes, relationships
- **Couple Model** - Partner connections and shared goals
- **Journal Entry Model** - Chat conversations and AI analysis
- **Check-In Model** - CSI-4/CSI-16 relationship satisfaction surveys
- **Exercise Model** - Gottman/NVC/EFT exercises with progress tracking

### ✅ AI Integration
- **Gemini 2.0 Integration** - Chat responses and relationship analysis
- **Safety Detection** - Automatic IPV/abuse pattern recognition
- **Four Horsemen Analysis** - Gottman Method communication patterns
- **NVC Framework** - Structured communication analysis

### ✅ Core Features
1. **Onboarding & Authentication**
   - User registration with email/password
   - Secure JWT-based sessions
   - Partner pairing via unique codes

2. **Guided Journaling**
   - AI-powered reflection sessions with "Bridge" counselor
   - Dual-perspective intake for both partners
   - Private journaling with shared insights

3. **Relationship Analysis**
   - Real-time pattern detection (Four Horsemen)
   - Personalized repair plans
   - Safety mode for crisis situations

4. **Check-In Surveys**
   - CSI-4 and CSI-16 relationship satisfaction tracking
   - Score calculation and trend analysis
   - Partner comparison metrics

5. **Exercise Library**
   - 10 evidence-based relationship exercises
   - Gottman Method, NVC, and EFT frameworks
   - Progress tracking and rating system

6. **Analytics Dashboard**
   - Relationship health score (0-100)
   - Trend visualization with charts
   - Communication pattern analysis
   - Exercise engagement metrics

### ✅ Security Features
- **End-to-end API security** with helmet.js
- **Rate limiting** for authentication endpoints
- **Input validation** with express-validator
- **Password hashing** with bcrypt
- **JWT token management** with automatic refresh
- **Safety detection** for crisis intervention

### ✅ Frontend Excellence
- **Modern React 19** with TypeScript 5.8
- **Zustand State Management** for efficient global state
- **React Query** for server state and caching
- **Real API Integration** with comprehensive error handling
- **Responsive Design** with Tailwind CSS and Framer Motion
- **Interactive Analytics** with Recharts visualization
- **PWA Ready** with offline support and service workers
- **Accessibility First** with WCAG 2.1 AA+ compliance
- **Glassmorphism UI** for professional modern design

## 🏗️ Architecture

### Backend Stack
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Gemini AI** for analysis
- **Winston** for logging

### Frontend Stack
- **React 19.2.0** with TypeScript 5.8
- **Vite 6.2** for lightning-fast builds
- **Zustand 4.4.7** for state management
- **TanStack Query 5.56** for server state
- **Framer Motion 11.5** for animations
- **Axios 1.12** for API communication
- **Recharts 3.3** for data visualization
- **Tailwind CSS 3.4** with custom design system
- **Lucide React** for modern icons

### Database Schema
```
Users ←→ Couples ←→ JournalEntries
  ↓         ↓           ↓
CheckIns  Exercises  Analytics
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Users & Couples
- `GET /api/users/profile` - Get user profile
- `GET /api/users/partner` - Get partner info
- `POST /api/couples/pair` - Pair with partner
- `GET /api/couples/info` - Get couple info

### Journaling
- `POST /api/journals/create` - Create journal entry
- `PUT /api/journals/:id/chat` - Update chat messages
- `POST /api/journals/:id/analyze` - AI analysis
- `POST /api/journals/chat-response` - Get chatbot response

### Check-ins
- `POST /api/checkins/create` - Create CSI survey
- `PUT /api/checkins/:id/submit` - Submit responses
- `GET /api/checkins/couple/history` - Get history

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise details
- `POST /api/exercises/:id/complete` - Mark completed

### Analytics
- `GET /api/analytics/trends` - Relationship trends
- `GET /api/analytics/health-score` - Health score

## 💬 Advanced Chat Features

### Private Chat Sessions
- **Thread-like Storage System** - Persistent conversation threads
- **Session Management** - Create, edit, close, reopen, and delete sessions
- **Auto-title Generation** - Smart titles based on conversation content
- **Conversation Metrics** - Track word count, duration, and engagement
- **Topic Detection** - Automatic extraction of conversation themes
- **Context-Aware AI** - Personalized responses based on user profile

### Multiple Chat Modes
- **Therapy Mode** - Professional therapeutic conversations
- **Casual Mode** - Relaxed, supportive discussions
- **Relationship Mode** - Couples-focused dialogues
- **Support Mode** - Crisis support with safety prioritization

## 🎨 Key Features Highlights

### 1. Real-Time AI Analysis
- Uses Gemini 2.0 for natural conversation and analysis
- Detects communication patterns automatically
- Provides actionable repair plans
- Safety-first approach with crisis detection

### 2. Comprehensive Tracking
- Relationship satisfaction surveys (CSI-4/CSI-16)
- Communication pattern analysis
- Exercise completion tracking
- Progress visualization with charts

### 3. Evidence-Based Content
- 10 curated exercises from Gottman, NVC, and EFT
- Research-backed assessment tools
- Professional therapeutic frameworks

### 4. Privacy & Security
- JWT-based authentication
- Input validation and sanitization
- Rate limiting for abuse prevention
- Secure password handling

## 🌟 What's New vs. Original Plan

### Exceeded Expectations
1. **Real MongoDB Backend** - Full production-ready database
2. **Comprehensive API** - RESTful endpoints for all features
3. **Advanced Analytics** - Health scores and trend analysis
4. **Safety Systems** - IPV detection and crisis resources
5. **Exercise Tracking** - Progress and engagement metrics
6. **Type Safety** - Full TypeScript implementation

### Ready for Production
- Database seeded with real exercises
- Error handling and validation
- Security best practices
- Scalable architecture
- API documentation ready

## 📦 Project Structure

```
ai-heartbridge/
├── components/              # React components
│   ├── Enhanced*           # Modern enhanced components
│   ├── ChatManager.tsx     # Chat orchestration
│   ├── ChatSessionsView    # Thread list interface
│   ├── PersistentChatView  # Session-aware chat
│   └── shared/             # Reusable UI components
├── services/               # API client services
│   ├── apiClient.ts        # Axios instance
│   ├── authService.ts      # Authentication
│   ├── chatSessionService  # Chat management
│   └── geminiService.ts    # AI integration
├── store/                  # Zustand state stores
│   ├── authStore.ts        # Auth state
│   └── appStore.ts         # App state
├── src/
│   ├── components/         # Enhanced UI library
│   │   └── ui/enhanced/    # Modern components
│   ├── design-system/      # Design tokens
│   └── utils/              # Utility functions
├── server/                 # Node.js backend
│   └── src/
│       ├── models/         # Mongoose models
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       └── middleware/     # Express middleware
└── docs/                   # Development documentation
```

## 🧹 Recent Code Cleanup

### Removed Duplicates
- ✅ Removed old component versions (AuthView, ChatView, Dashboard, etc.)
- ✅ Consolidated to Enhanced components for consistency
- ✅ Removed unused hooks and utilities
- ✅ Cleaned up imports and dependencies
- ✅ Organized documentation into `/docs` folder

### Quality Improvements
- ✅ Zero linting errors
- ✅ Full TypeScript strict mode
- ✅ Optimized bundle sizes
- ✅ Improved code organization
- ✅ Better component structure

## 🚀 Deployment Guide

### Environment Variables
```env
# Backend (.env in server/)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_ai_api_key
PORT=3001
CLIENT_URL=http://localhost:5173

# Frontend (.env in root)
VITE_API_URL=http://localhost:3001/api
```

### Production Deployment
1. **Backend** - Railway, Heroku, AWS EC2, or DigitalOcean
2. **Frontend** - Vercel, Netlify, or AWS S3 + CloudFront
3. **Database** - MongoDB Atlas (already configured)
4. **SSL** - Enable HTTPS for security
5. **Monitoring** - Add error tracking (Sentry)
6. **CI/CD** - GitHub Actions for automated deployment

## 📱 Usage Flow

1. **Sign Up** → Create account with email/password
2. **Pair Partners** → Share pairing code with partner
3. **Start Journaling** → AI-guided reflection sessions
4. **Get Analysis** → Receive insights and repair plans
5. **Take Check-ins** → Complete relationship surveys
6. **Practice Exercises** → Work through evidence-based activities
7. **Track Progress** → View trends and health scores

## 🔒 Security & Privacy

- All passwords are hashed with bcrypt
- JWT tokens for secure session management
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- Safety detection for crisis situations
- Privacy-first design with user consent

---

**Status: ✅ COMPLETE - Production Ready**

The application now includes all planned features with a full backend, real database, AI integration, and comprehensive relationship tracking. Ready for deployment and real-world use.
