# 🏗️ AI HeartBridge - Technical Architecture

## 🎯 **System Overview**

AI HeartBridge is a full-stack web application that combines modern frontend technologies with AI-powered backend services to provide couples with accessible relationship therapy and communication tools.

## 🖥️ **Frontend Architecture**

### **Core Technologies**
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Lightning-fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations and transitions

### **State Management**
- **Zustand**: Lightweight state management
- **React Query**: Server state caching and synchronization
- **React Hook Form**: Form state management with validation

### **UI Components**
- **Radix UI**: Accessible, unstyled components
- **Lucide React**: Beautiful icon library
- **Headless UI**: Unstyled, accessible components
- **Custom Components**: Themed for therapeutic experience

### **PWA Features**
- **Service Workers**: Offline functionality
- **Web App Manifest**: Installable app experience
- **Push Notifications**: Real-time partner updates
- **Background Sync**: Offline data synchronization

## 🔧 **Backend Architecture**

### **Core Technologies**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe backend development
- **MongoDB**: NoSQL database for flexible data modeling

### **API Design**
- **RESTful Architecture**: Standard HTTP methods and status codes
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Graceful error responses

### **Security Features**
- **bcrypt**: Password hashing and salting
- **Helmet**: Security headers and protection
- **CORS**: Cross-origin resource sharing configuration
- **Input Sanitization**: XSS and injection prevention
- **Data Encryption**: Sensitive data protection

## 🤖 **AI Integration**

### **AI Service Architecture**
- **Google Gemini API**: Primary AI service provider
- **Context Management**: Comprehensive user profile integration
- **Fallback Systems**: Graceful degradation when AI fails
- **Response Caching**: Optimized API usage
- **Error Recovery**: Automatic retry mechanisms

### **Therapeutic AI Features**
- **Personalized Responses**: Context-aware therapeutic conversations
- **Relationship Analysis**: Comprehensive couple insights generation
- **Safety Detection**: Crisis intervention and support resources
- **Evidence-Based Frameworks**: Gottman Method, NVC, EFT integration

### **AI Prompt Engineering**
- **Structured Prompts**: Consistent AI response format
- **Context Injection**: User profile and relationship data
- **Safety Guidelines**: Crisis detection and intervention
- **Therapeutic Frameworks**: Psychology-based response generation

## 🗄️ **Database Design**

### **MongoDB Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  profile: {
    firstName: String,
    age: Number,
    gender: String,
    relationshipStatus: String,
    // ... comprehensive relationship data
  },
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Couples Collection**
```javascript
{
  _id: ObjectId,
  partner1: ObjectId (User),
  partner2: ObjectId (User),
  pairingCode: String,
  status: String,
  createdAt: Date,
  lastActiveAt: Date
}
```

#### **Journal Sessions Collection**
```javascript
{
  _id: ObjectId,
  coupleId: ObjectId,
  partner1Chat: [Message],
  partner2Chat: [Message],
  status: String,
  insights: String,
  createdAt: Date,
  completedAt: Date
}
```

### **Data Relationships**
- **One-to-Many**: User → Journal Sessions
- **Many-to-Many**: User ↔ Couple (through pairing)
- **Embedded Documents**: Messages within sessions
- **Indexing**: Optimized queries for performance

## 🚀 **Deployment Architecture**

### **Frontend Deployment (Vercel)**
- **Static Site Generation**: Optimized React builds
- **CDN Distribution**: Global content delivery
- **Automatic Deployments**: Git-based CI/CD
- **Environment Variables**: Secure configuration
- **Custom Domains**: Professional branding

### **Backend Deployment (Railway)**
- **Container Deployment**: Docker-based deployment
- **Auto-scaling**: Dynamic resource allocation
- **Health Monitoring**: Application performance tracking
- **Log Management**: Centralized logging system
- **Database Connection**: MongoDB Atlas integration

### **Database (MongoDB Atlas)**
- **Cloud Database**: Fully managed MongoDB service
- **Global Clusters**: Multi-region deployment
- **Backup & Recovery**: Automated data protection
- **Security**: Network access controls and encryption
- **Monitoring**: Performance and usage analytics

## 🔒 **Security Architecture**

### **Authentication & Authorization**
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Secure token rotation
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure session handling
- **Role-Based Access**: User permission system

### **Data Protection**
- **Encryption at Rest**: Database encryption
- **Encryption in Transit**: HTTPS/TLS encryption
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy

### **Privacy Features**
- **Data Isolation**: Partner data separation
- **Consent Management**: User data control
- **Data Retention**: Automated data cleanup
- **GDPR Compliance**: Privacy regulation adherence
- **Audit Logging**: Security event tracking

## 📊 **Performance Optimization**

### **Frontend Optimization**
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: WebP format and lazy loading
- **Caching Strategy**: Browser and CDN caching
- **PWA Caching**: Service worker optimization

### **Backend Optimization**
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Response Caching**: API response optimization
- **Compression**: Gzip compression for responses
- **Rate Limiting**: API usage optimization

### **AI Service Optimization**
- **Response Caching**: AI response optimization
- **Context Optimization**: Efficient prompt engineering
- **Fallback Systems**: Graceful degradation
- **Error Recovery**: Automatic retry mechanisms
- **Cost Optimization**: Efficient API usage

## 🔄 **Scalability Considerations**

### **Horizontal Scaling**
- **Load Balancing**: Multiple server instances
- **Database Sharding**: Data distribution strategy
- **CDN Distribution**: Global content delivery
- **Microservices**: Modular service architecture
- **Container Orchestration**: Kubernetes deployment

### **Vertical Scaling**
- **Resource Optimization**: CPU and memory optimization
- **Database Optimization**: Query and index optimization
- **Caching Layers**: Multi-level caching strategy
- **Performance Monitoring**: Real-time metrics
- **Auto-scaling**: Dynamic resource allocation

## 🛠️ **Development Workflow**

### **Version Control**
- **Git Repository**: Comprehensive version control
- **Branch Strategy**: Feature-based development
- **Code Reviews**: Peer review process
- **Automated Testing**: CI/CD pipeline
- **Documentation**: Comprehensive code documentation

### **Quality Assurance**
- **TypeScript**: Compile-time error checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting consistency
- **Testing**: Unit and integration tests
- **Performance Monitoring**: Real-time metrics

## 📈 **Monitoring & Analytics**

### **Application Monitoring**
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern analysis
- **Security Monitoring**: Threat detection
- **Health Checks**: System status monitoring

### **Business Metrics**
- **User Engagement**: Feature usage analytics
- **Relationship Outcomes**: Therapy effectiveness
- **AI Performance**: Response quality metrics
- **System Reliability**: Uptime and availability
- **Cost Analysis**: Resource usage optimization

---

**This architecture demonstrates enterprise-grade design principles while maintaining simplicity and scalability for a university project.**
