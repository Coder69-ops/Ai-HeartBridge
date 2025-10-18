import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingStep, OnboardingData, User } from '../types';
import { useAuthStore } from '../store/authStore';
import { 
  AnimatedButton, 
  GlassmorphismCard, 
  GlassCardContent,
  ModernInput,
  InteractiveAnimation,
  PageTransition 
} from '../src/components/ui/enhanced';
import { 
  Heart, 
  User as UserIcon, 
  Users, 
  Target, 
  MessageCircle, 
  Calendar,
  MapPin,
  Baby,
  Lightbulb,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown
} from 'lucide-react';

interface ComprehensiveOnboardingProps {
  user: User;
  onComplete: (data: OnboardingData) => void;
}

// Move step components outside to prevent recreation on every render
const WelcomeStep: React.FC<{ user: User }> = ({ user }) => (
  <div className="text-center space-y-6">
    <motion.div
      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Heart className="w-12 h-12 text-white" />
    </motion.div>
    
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {user.name || user.profile?.firstName || 'there'}! 👋
      </h2>
      <p className="text-lg text-gray-600 max-w-md mx-auto">
        Let's set up your personalized HeartBridge experience. This will help us provide better insights and recommendations for your relationship journey.
      </p>
    </div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold text-emerald-800">Your Privacy Matters</h3>
      </div>
      <p className="text-sm text-emerald-700">
        All information you share is encrypted and stored securely. Only you and your partner (when paired) can access your data.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="space-y-2">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <UserIcon className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600">Personal Info</p>
      </div>
      <div className="space-y-2">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <p className="text-sm text-gray-600">Relationship</p>
      </div>
      <div className="space-y-2">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <Target className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-sm text-gray-600">Goals</p>
      </div>
    </div>
  </div>
);

const PersonalInfoStep: React.FC<{ 
  onboardingData: OnboardingData;
  updateOnboardingData: (section: keyof OnboardingData, data: any) => void;
}> = ({ onboardingData, updateOnboardingData }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <UserIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-gray-800">Tell Us About Yourself</h2>
      <p className="text-gray-600">This helps us personalize your experience</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <ModernInput
        label="First Name"
        value={onboardingData.personalInfo.firstName || ''}
        onChange={(value) => updateOnboardingData('personalInfo', { firstName: value })}
        placeholder="Your first name"
        required
      />
      <ModernInput
        label="Last Name"
        value={onboardingData.personalInfo.lastName || ''}
        onChange={(value) => updateOnboardingData('personalInfo', { lastName: value })}
        placeholder="Your last name"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
        <select
          value={onboardingData.personalInfo.age || ''}
          onChange={(e) => updateOnboardingData('personalInfo', { age: parseInt(e.target.value) })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
          required
        >
          <option value="">Select age</option>
          {Array.from({ length: 65 }, (_, i) => i + 18).map(age => (
            <option key={age} value={age}>{age}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <select
          value={onboardingData.personalInfo.gender || ''}
          onChange={(e) => updateOnboardingData('personalInfo', { gender: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
      <div className="grid grid-cols-2 gap-4">
        <ModernInput
          label=""
          value={onboardingData.personalInfo.location?.city || ''}
          onChange={(value) => updateOnboardingData('personalInfo', { 
            location: { ...onboardingData.personalInfo.location, city: value }
          })}
          placeholder="City"
          leftIcon={<MapPin className="w-4 h-4" />}
        />
        <ModernInput
          label=""
          value={onboardingData.personalInfo.location?.country || ''}
          onChange={(value) => updateOnboardingData('personalInfo', { 
            location: { ...onboardingData.personalInfo.location, country: value }
          })}
          placeholder="Country"
        />
      </div>
    </div>
  </div>
);

const RelationshipInfoStep: React.FC<{ 
  onboardingData: OnboardingData;
  updateOnboardingData: (section: keyof OnboardingData, data: any) => void;
}> = ({ onboardingData, updateOnboardingData }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-gray-800">Your Relationship</h2>
      <p className="text-gray-600">Help us understand your relationship context</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Status *</label>
      <select
        value={onboardingData.relationshipInfo.relationshipStatus || ''}
        onChange={(e) => updateOnboardingData('relationshipInfo', { relationshipStatus: e.target.value })}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
        required
      >
        <option value="">Select status</option>
        <option value="dating">Dating</option>
        <option value="engaged">Engaged</option>
        <option value="married">Married</option>
        <option value="domestic-partnership">Domestic Partnership</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">How long have you been together? *</label>
      <div className="grid grid-cols-2 gap-4">
        <select
          value={onboardingData.relationshipInfo.relationshipDuration?.years || ''}
          onChange={(e) => updateOnboardingData('relationshipInfo', { 
            relationshipDuration: { 
              ...onboardingData.relationshipInfo.relationshipDuration, 
              years: parseInt(e.target.value) 
            }
          })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
          required
        >
          <option value="">Years</option>
          {Array.from({ length: 51 }, (_, i) => i).map(year => (
            <option key={year} value={year}>{year} year{year !== 1 ? 's' : ''}</option>
          ))}
        </select>
        
        <select
          value={onboardingData.relationshipInfo.relationshipDuration?.months || ''}
          onChange={(e) => updateOnboardingData('relationshipInfo', { 
            relationshipDuration: { 
              ...onboardingData.relationshipInfo.relationshipDuration, 
              months: parseInt(e.target.value) 
            }
          })}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
        >
          <option value="">Months</option>
          {Array.from({ length: 12 }, (_, i) => i).map(month => (
            <option key={month} value={month}>{month} month{month !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="livingTogether"
          checked={onboardingData.relationshipInfo.livingTogether || false}
          onChange={(e) => updateOnboardingData('relationshipInfo', { livingTogether: e.target.checked })}
          className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="livingTogether" className="text-sm text-gray-700">
          We live together
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="hasChildren"
          checked={onboardingData.relationshipInfo.hasChildren || false}
          onChange={(e) => updateOnboardingData('relationshipInfo', { hasChildren: e.target.checked })}
          className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="hasChildren" className="text-sm text-gray-700 flex items-center space-x-2">
          <Baby className="w-4 h-4" />
          <span>We have children together</span>
        </label>
      </div>
    </div>

    {onboardingData.relationshipInfo.hasChildren && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Children's Ages (Optional)</label>
        <ModernInput
          label=""
          value={onboardingData.relationshipInfo.childrenAges?.join(', ') || ''}
          onChange={(value) => {
            const ages = value.split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age));
            updateOnboardingData('relationshipInfo', { childrenAges: ages });
          }}
          placeholder="e.g., 5, 8, 12"
          helperText="Separate ages with commas"
        />
      </div>
    )}
  </div>
);

const GoalsChallengesStep: React.FC<{ 
  onboardingData: OnboardingData;
  updateOnboardingData: (section: keyof OnboardingData, data: any) => void;
}> = ({ onboardingData, updateOnboardingData }) => {
  const commonGoals = [
    'Improve communication',
    'Resolve conflicts better',
    'Increase intimacy',
    'Build trust',
    'Strengthen emotional connection',
    'Better work-life balance',
    'Plan our future together',
    'Improve physical intimacy',
    'Support each other\'s goals',
    'Have more fun together'
  ];

  const commonChallenges = [
    'We argue frequently',
    'Lack of quality time',
    'Stress from work/life',
    'Financial disagreements',
    'Parenting challenges',
    'Different communication styles',
    'Trust issues',
    'Intimacy concerns',
    'Extended family issues',
    'Different future goals'
  ];

  const toggleGoal = (goal: string) => {
    const currentGoals = Array.isArray(onboardingData.goals) ? onboardingData.goals : [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    updateOnboardingData('goals', newGoals);
  };

  const toggleChallenge = (challenge: string) => {
    const currentChallenges = Array.isArray(onboardingData.challenges) ? onboardingData.challenges : [];
    const newChallenges = currentChallenges.includes(challenge)
      ? currentChallenges.filter(c => c !== challenge)
      : [...currentChallenges, challenge];
    updateOnboardingData('challenges', newChallenges);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800">Goals & Challenges</h2>
        <p className="text-gray-600">What do you hope to achieve together?</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-emerald-600" />
          <span>What are your relationship goals? *</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">Select all that apply (choose at least one)</p>
        
        <div className="grid grid-cols-2 gap-3">
          {commonGoals.map(goal => (
            <InteractiveAnimation key={goal} hover tap>
              <button
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`p-3 text-left text-sm rounded-lg border transition-all duration-200 ${
                  Array.isArray(onboardingData.goals) && onboardingData.goals.includes(goal)
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{goal}</span>
                  {Array.isArray(onboardingData.goals) && onboardingData.goals.includes(goal) && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </button>
            </InteractiveAnimation>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Challenges (Optional)</h3>
        <p className="text-sm text-gray-600 mb-4">What challenges are you facing? This helps us provide better guidance.</p>
        
        <div className="grid grid-cols-2 gap-3">
          {commonChallenges.map(challenge => (
            <InteractiveAnimation key={challenge} hover tap>
              <button
                type="button"
                onClick={() => toggleChallenge(challenge)}
                className={`p-3 text-left text-sm rounded-lg border transition-all duration-200 ${
                  Array.isArray(onboardingData.challenges) && onboardingData.challenges.includes(challenge)
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{challenge}</span>
                  {Array.isArray(onboardingData.challenges) && onboardingData.challenges.includes(challenge) && (
                    <Check className="w-4 h-4 text-amber-600" />
                  )}
                </div>
              </button>
            </InteractiveAnimation>
          ))}
        </div>
      </div>
    </div>
  );
};

const ComprehensiveOnboarding: React.FC<ComprehensiveOnboardingProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {},
    relationshipInfo: {},
    goals: [],
    challenges: [],
    preferences: {},
    isComplete: false
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Your Journey',
      description: 'Let\'s personalize your HeartBridge experience',
      component: 'personal-info',
      isRequired: false,
      isCompleted: false
    },
    {
      id: 'personal-info',
      title: 'Tell Us About Yourself',
      description: 'Basic information to personalize your experience',
      component: 'personal-info',
      isRequired: true,
      isCompleted: false
    },
    {
      id: 'relationship-info',
      title: 'Your Relationship',
      description: 'Help us understand your relationship context',
      component: 'relationship-info',
      isRequired: true,
      isCompleted: false
    },
    {
      id: 'goals-challenges',
      title: 'Goals & Challenges',
      description: 'What do you hope to achieve together?',
      component: 'goals-challenges',
      isRequired: true,
      isCompleted: false
    },
    {
      id: 'communication-style',
      title: 'Communication Style',
      description: 'How do you prefer to communicate?',
      component: 'communication-style',
      isRequired: false,
      isCompleted: false
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      description: 'Customize your app experience',
      component: 'preferences',
      isRequired: false,
      isCompleted: false
    }
  ];

  const updateOnboardingData = useCallback((section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => {
      // Handle arrays directly for goals and challenges
      if (section === 'goals' || section === 'challenges') {
        return {
          ...prev,
          [section]: Array.isArray(data) ? data : []
        };
      }
      // Handle objects for other sections
      return {
        ...prev,
        [section]: { ...prev[section], ...data }
      };
    });
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      const completeData = { 
        ...onboardingData, 
        isComplete: true,
        // Ensure arrays are properly initialized
        goals: Array.isArray(onboardingData.goals) ? onboardingData.goals : [],
        challenges: Array.isArray(onboardingData.challenges) ? onboardingData.challenges : []
      };
      
      console.log('Completing onboarding with data:', completeData);
      onComplete(completeData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    if (!step.isRequired) return true;
    
    // Validation logic for each step
    switch (step.id) {
      case 'personal-info':
        return onboardingData.personalInfo.age && onboardingData.personalInfo.firstName;
      case 'relationship-info':
        return onboardingData.relationshipInfo.relationshipStatus && onboardingData.relationshipInfo.relationshipDuration;
      case 'goals-challenges':
        return Array.isArray(onboardingData.goals) && onboardingData.goals.length > 0;
      default:
        return true;
    }
  };

  // Create step components directly without memoization to avoid stale closures
  const getCurrentStepComponent = () => {
    const stepId = steps[currentStep]?.id || 'welcome';
    switch (stepId) {
      case 'welcome':
        return <WelcomeStep user={user} />;
      case 'personal-info':
        return <PersonalInfoStep onboardingData={onboardingData} updateOnboardingData={updateOnboardingData} />;
      case 'relationship-info':
        return <RelationshipInfoStep onboardingData={onboardingData} updateOnboardingData={updateOnboardingData} />;
      case 'goals-challenges':
        return <GoalsChallengesStep onboardingData={onboardingData} updateOnboardingData={updateOnboardingData} />;
      default:
        return <WelcomeStep user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <GlassmorphismCard variant="therapy" padding="xl">
          <GlassCardContent>
            <div className="transition-opacity duration-300">
              {getCurrentStepComponent()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <AnimatedButton
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className={currentStep === 0 ? 'invisible' : ''}
              >
                Back
              </AnimatedButton>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <AnimatedButton
                variant="therapy"
                onClick={nextStep}
                disabled={!canProceed()}
                rightIcon={currentStep === steps.length - 1 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                animation="bounce"
              >
                {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}
              </AnimatedButton>
            </div>
          </GlassCardContent>
        </GlassmorphismCard>
      </div>
    </div>
  );
};

export default ComprehensiveOnboarding;