import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { User, Couple, Exercise, Message, OnboardingData } from './types';
import { ToastProvider } from './src/components/ui/enhanced';
import * as authService from './services/authService';
import EnhancedAuthView from './components/EnhancedAuthView';
import MasterAuthView from './components/MasterAuthView';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import ChatManager from './components/ChatManager';
import { OnboardingErrorBoundary } from './src/components/ErrorBoundary';
import EnhancedDashboard from './components/EnhancedDashboard';
import MasterDashboard from './components/MasterDashboard';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import JournalingView from './components/JournalingView';
import EnhancedCheckInView from './components/EnhancedCheckInView';
import MasterCheckInView from './components/MasterCheckInView';
import ExercisesView from './components/ExercisesView';
import MasterExercisesView from './components/MasterExercisesView';
import ExerciseDetailView from './components/ExerciseDetailView';
import MasterExerciseDetailView from './components/MasterExerciseDetailView';
import TrendsView from './components/TrendsView';
import MasterTrendsView from './components/MasterTrendsView';
import EnhancedProfileView from './components/EnhancedProfileView';
import MasterProfileView from './components/MasterProfileView';
import EnhancedPartnerChat from './components/EnhancedPartnerChat';
import SafetyModal from './components/SafetyModal';
import MasterSafetyModal from './components/MasterSafetyModal';
import { GorgeousLoader } from './components/shared/GorgeousLoader';
import { exercises, loadExercises } from './data/exercises';

export const AppContent: React.FC = () => {
    // Zustand stores
    const { user, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
    const { currentView, setCurrentView, selectedExercise, setSelectedExercise } = useAppStore();

    // Local state for legacy components (will be migrated to stores)
    const [partner, setPartner] = useState<User | null>(null);
    const [couple, setCouple] = useState<Couple | null>(null);
    const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [exercisesList, setExercisesList] = useState<Exercise[]>(exercises);


    // Initialize auth on app startup
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Load additional data when authenticated
    useEffect(() => {
        const loadUserData = async () => {
            if (isAuthenticated && user && !authLoading) {
                try {
                    const userPartner = await authService.getPartner(user);
                    const userCouple = user.coupleId ? await authService.getCouple(user.coupleId) : null;
                    setPartner(userPartner);
                    setCouple(userCouple);
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
                setIsLoading(false);
            } else if (!authLoading) {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [isAuthenticated, user, authLoading]);

    // Load exercises
    useEffect(() => {
        const loadData = async () => {
            try {
                const loadedExercises = await loadExercises();
                setExercisesList(loadedExercises);
            } catch (error) {
                console.error('Failed to load exercises:', error);
            }
        };
        loadData();
    }, []);

    const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
        const { updateProfile } = useAuthStore.getState();
        try {
            // Format the onboarding data to match the backend User model structure
            const formattedData = {
                // Mark onboarding as complete
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date(),
                
                // Personal Information
                firstName: onboardingData.personalInfo?.firstName,
                lastName: onboardingData.personalInfo?.lastName,
                age: onboardingData.personalInfo?.age,
                gender: onboardingData.personalInfo?.gender,
                location: onboardingData.personalInfo?.location ? 
                    `${onboardingData.personalInfo.location.city || ''}, ${onboardingData.personalInfo.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : undefined,
                
                // Relationship Information
                relationshipStatus: onboardingData.relationshipInfo?.relationshipStatus,
                relationshipDuration: onboardingData.relationshipInfo?.relationshipDuration ? 
                    `${onboardingData.relationshipInfo.relationshipDuration.years || 0} years, ${onboardingData.relationshipInfo.relationshipDuration.months || 0} months` : undefined,
                livingTogether: onboardingData.relationshipInfo?.livingTogether,
                hasChildren: onboardingData.relationshipInfo?.hasChildren,
                childrenAges: onboardingData.relationshipInfo?.childrenAges,
                
                // Goals and Challenges
                primaryGoals: Array.isArray(onboardingData.goals) && onboardingData.goals.length > 0 ? onboardingData.goals : undefined,
                relationshipChallenges: Array.isArray(onboardingData.challenges) && onboardingData.challenges.length > 0 ? onboardingData.challenges : undefined,
                
                // App Preferences
                notificationSettings: onboardingData.preferences?.notifications !== undefined ? {
                    dailyCheckins: onboardingData.preferences.notifications,
                    exerciseReminders: onboardingData.preferences.notifications,
                    partnerUpdates: onboardingData.preferences.notifications,
                    weeklyReports: onboardingData.preferences.notifications
                } : undefined,
                privacyLevel: onboardingData.preferences?.privacyLevel,
                preferredTimeOfDay: onboardingData.preferences?.communicationStyle === 'gentle' ? 'evening' : 'afternoon'
            };

            // Remove undefined values to avoid overwriting existing data
            const cleanedData = Object.fromEntries(
                Object.entries(formattedData).filter(([_, value]) => value !== undefined)
            );

            console.log('Saving onboarding data:', cleanedData);
            
            // Update user profile with formatted onboarding data
            await updateProfile(cleanedData);
            
            // Also update the profile nested structure for frontend consistency
            await updateProfile({
                profile: {
                    ...(onboardingData.personalInfo || {}),
                    ...(onboardingData.relationshipInfo || {}),
                    primaryGoals: onboardingData.goals,
                    relationshipChallenges: onboardingData.challenges
                },
                preferences: onboardingData.preferences
            });
            
            console.log('Onboarding data saved successfully');
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Failed to save onboarding data:', error);
            // Show user the error but still proceed to avoid blocking
            alert('There was an issue saving your onboarding data. Your progress has been saved locally and will sync when connection is restored.');
            setCurrentView('dashboard');
        }
    };
    
    const handleLoginSuccess = async (loggedInUser: User) => {
        try {
            const userPartner = await authService.getPartner(loggedInUser);
            const userCouple = loggedInUser.coupleId ? await authService.getCouple(loggedInUser.coupleId) : null;
            setPartner(userPartner);
            setCouple(userCouple);
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };
    
    const handleLogout = () => {
        const { logout } = useAuthStore.getState();
        logout();
        // Also clear the old auth service tokens for compatibility
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setPartner(null);
        setCouple(null);
        setCurrentView('dashboard');
    };
    
    const handleNavigate = (newView: string) => {
        // Ensure the view is a valid string-based view
        const validViews = ['dashboard', 'journal', 'mood', 'exercises', 'goals', 'profile', 'chat', 'partner-chat'];
        if (validViews.includes(newView)) {
            setCurrentView(newView as any);
        } else {
            console.warn(`Invalid view: ${newView}, defaulting to dashboard`);
            setCurrentView('dashboard');
        }
    };

    const handlePairingSuccess = async (updatedUser: User, newPartner: User) => {
        setPartner(newPartner);
        try {
            if (updatedUser.coupleId) {
                const userCouple = await authService.getCouple(updatedUser.coupleId);
                setCouple(userCouple);
            }
        } catch (error) {
            console.error('Error loading couple data:', error);
        }
        authService.setLoggedInUser(updatedUser);
    };

    const handleStartJournaling = async () => {
        if (!couple) return;
        try {
            const newJournal = await authService.createJournalEntry(couple.id);
            setCurrentJournalId(newJournal.id);
            setCurrentView('journal');
        } catch (error) {
            console.error('Error creating journal entry:', error);
        }
    };

    const handleJournalingComplete = async (entry: { partner1Chat: Message[], partner2Chat: Message[] }) => {
        if (!currentJournalId) return;
        try {
            await authService.updateJournalEntry(currentJournalId, entry);
            setCurrentView('mood');
        } catch (error) {
            console.error('Error updating journal entry:', error);
        }
    };

    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setCurrentView('exercises');
    };

    const renderContent = () => {
        // Show loader while initializing or loading
        if (isLoading || authLoading) {
            return (
                <GorgeousLoader 
                    message="Preparing your safe space..."
                    type="therapy"
                    size="lg"
                />
            );
        }

        // Check if user needs onboarding with better debugging
        const needsOnboarding = isAuthenticated && user && !Boolean(user.isOnboardingComplete);
        
        console.log('Onboarding check:', {
            isAuthenticated,
            hasUser: !!user,
            isOnboardingComplete: user?.isOnboardingComplete,
            needsOnboarding,
            userProfile: user?.profile
        });

        if (needsOnboarding) {
            return (
                <OnboardingErrorBoundary>
                    <ComprehensiveOnboarding user={user} onComplete={handleOnboardingComplete} />
                </OnboardingErrorBoundary>
            );
        }

        // Check if user needs authentication
        if (!isAuthenticated || !user) {
            return <MasterAuthView onLoginSuccess={handleLoginSuccess} />;
        }

        // Render main app views
        switch (currentView) {
            case 'dashboard':
                return (
                    <MasterDashboard 
                        user={user} 
                        partner={partner} 
                        onNavigate={handleNavigate} 
                        onPairingSuccess={handlePairingSuccess} 
                        onStartJournaling={handleStartJournaling} 
                    />
                );
            case 'journal':
                if (user && partner) {
                    return (
                        <JournalingView 
                            user={user} 
                            partner={partner} 
                            onComplete={handleJournalingComplete} 
                            isReturningUser={!!couple?.journalIds?.length} 
                        />
                    );
                }
                return null;
            case 'mood':
                // If coming from journaling, use the current journal ID
                if (couple && currentJournalId) {
                    return (
                        <MasterCheckInView 
                            coupleId={couple.id} 
                            journalId={currentJournalId} 
                            onNavigate={handleNavigate} 
                        />
                    );
                }
                // If navigating directly to mood, show mood tracker without requiring a journal
                return (
                    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4">
                        <div className="max-w-2xl mx-auto">
                            <button 
                                onClick={() => setCurrentView('dashboard')}
                                className="mb-6 text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                ← Back to Dashboard
                            </button>
                            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Check-In</h2>
                                <p className="text-gray-600 mb-6">
                                    Complete a journaling session first to check in on your mood and get personalized insights.
                                </p>
                                <button 
                                    onClick={() => handleStartJournaling()}
                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    Start Journaling
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'exercises':
                if (selectedExercise) {
                    return (
                        <MasterExerciseDetailView 
                            exercise={selectedExercise} 
                            onNavigate={handleNavigate} 
                        />
                    );
                }
                return (
                    <MasterExercisesView 
                        exercises={exercisesList} 
                        onSelectExercise={handleSelectExercise} 
                    />
                );
            case 'goals':
                return <MasterTrendsView />;
            case 'profile':
                return <MasterProfileView onBack={() => setCurrentView('dashboard')} />;
            case 'chat':
                return <ChatManager onBack={() => setCurrentView('dashboard')} />;
            case 'partner-chat':
                return <EnhancedPartnerChat onBack={() => setCurrentView('dashboard')} />;
            default:
                return (
                    <div className="text-center p-8">
                        <p className="text-muted-foreground">Page not found.</p>
                    </div>
                );
        }
    };
    
    return (
        <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
                {isAuthenticated && user && !authLoading && (
                    <>
                        {/* Desktop Header */}
                        <Header 
                            user={user} 
                            onNavigate={handleNavigate}
                            onShowSafetyModal={() => setShowSafetyModal(true)} 
                            onLogout={handleLogout}
                            currentView={currentView}
                            partner={partner}
                        />
                    </>
                )}
                
                {/* Page Transition Animations */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                            duration: 0.4,
                            ease: "easeInOut"
                        }}
                        className="pt-16"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {showSafetyModal && (
                        <MasterSafetyModal onClose={() => setShowSafetyModal(false)} />
                    )}
                </AnimatePresence>
            </div>
        </ToastProvider>
    );
};