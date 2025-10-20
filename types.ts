export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  pairingCode: string;
  coupleId?: string;
  isOnboardingComplete: boolean;
  dateJoined?: Date;
  lastActive?: Date;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
    timezone?: string;
    communicationStyle?: 'direct' | 'gentle' | 'analytical' | 'emotional';
    privacyLevel?: 'open' | 'moderate' | 'private';
  };
  profile?: {
    // Personal Information
    firstName?: string;
    lastName?: string;
    age?: number;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';
    location?: {
      city?: string;
      country?: string;
      timezone?: string;
    };
    
    // Relationship Information
    relationshipStatus?: 'dating' | 'engaged' | 'married' | 'domestic-partnership' | 'other';
    relationshipDuration?: {
      years: number;
      months: number;
    };
    anniversaryDate?: Date;
    livingTogether?: boolean;
    hasChildren?: boolean;
    childrenAges?: number[];
    
    // Goals and Aspirations
    primaryGoals?: string[];
    relationshipChallenges?: string[];
    strengthsAsCouple?: string[];
    personalStrengths?: string[];
    areasForGrowth?: string[];
    
    // Communication and Therapy
    communicationStyle?: 'direct' | 'indirect' | 'analytical' | 'emotional' | 'mixed';
    conflictResolutionStyle?: 'collaborative' | 'competitive' | 'accommodating' | 'avoiding' | 'compromising';
    loveLanguages?: Array<'words-of-affirmation' | 'acts-of-service' | 'receiving-gifts' | 'quality-time' | 'physical-touch'>;
    therapyHistory?: {
      hasHadTherapy: boolean;
      isCurrentlyInTherapy: boolean;
      therapyType?: 'individual' | 'couples' | 'both';
      duration?: string;
      effectiveness?: 1 | 2 | 3 | 4 | 5;
    };
    
    // Mental Health and Wellness
    mentalHealthHistory?: {
      hasHistory: boolean;
      conditions?: string[];
      isManaged: boolean;
      affectsRelationship?: boolean;
    };
    stressLevel?: 1 | 2 | 3 | 4 | 5;
    wellnessGoals?: string[];
    
    // Emergency and Support
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
      email?: string;
    };
    supportSystem?: {
      hasFamilySupport: boolean;
      hasFriendsSupport: boolean;
      hasProfessionalSupport: boolean;
      supportDetails?: string;
    };
    
    // Interests and Values
    interests?: string[];
    values?: string[];
    dealBreakers?: string[];
    futureVision?: string;
    
    // App Usage Preferences
    preferredSessionLength?: 15 | 30 | 45 | 60;
    preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    reminderFrequency?: 'daily' | 'every-other-day' | 'weekly' | 'as-needed';
    
    // Onboarding Progress
    onboardingStep?: number;
    completedSections?: string[];
  };
}

export interface Couple {
  id: string;
  partner1Id: string;
  partner2Id: string;
  journalIds: string[];
}

export interface Message {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp?: Date;
}

export interface JournalEntry {
  id: string;
  coupleId: string;
  date: string;
  partner1Chat: Message[];
  partner2Chat: Message[];
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  opportunities: string[];
  fourHorsemen: {
    criticism: boolean;
    contempt: boolean;
    defensiveness: boolean;
    stonewalling: boolean;
  };
  repairPlan: string[];
}

export enum View {
  Onboarding = 'ONBOARDING',
  Auth = 'AUTH',
  PersonalInfo = 'PERSONAL_INFO',
  RelationshipInfo = 'RELATIONSHIP_INFO',
  Goals = 'GOALS',
  Dashboard = 'DASHBOARD',
  Journaling = 'JOURNALING',
  CheckIn = 'CHECK_IN',
  Exercises = 'EXERCISES',
  ExerciseDetail = 'EXERCISE_DETAIL',
  Trends = 'TRENDS',
  Profile = 'PROFILE',
  Chat = 'CHAT',
  RelationshipChat = 'RELATIONSHIP_CHAT',
  PartnerChat = 'PARTNER_CHAT',
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: 'personal-info' | 'relationship-info' | 'goals-challenges' | 'communication-style' | 'preferences';
  isRequired: boolean;
  isCompleted: boolean;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface OnboardingData {
  personalInfo: Partial<User['profile']>;
  relationshipInfo: Partial<User['profile']>;
  goals: string[];
  challenges: string[];
  preferences: Partial<User['preferences']>;
  isComplete: boolean;
}

export type IconName = 
  | 'home'
  | 'journal'
  | 'chart-bar'
  | 'book-open'
  | 'heart'
  | 'lightbulb'
  | 'arrow-right'
  | 'lock'
  | 'check'
  | 'sparkles'
  | 'users'
  | 'arrow-left'
  | 'flag'
  | 'send'
  | 'brain'
  | 'arrow-uturn-left'
  | 'alert-circle'
  | 'message-circle';

export interface Exercise {
  id: string;
  title: string;
  category: string;
  icon: IconName;
  description: string;
  steps: string[];
}
