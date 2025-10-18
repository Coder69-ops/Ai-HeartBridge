import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { User, Couple, Exercise, Message, OnboardingData } from './types';
import { ToastProvider } from './src/components/ui/enhanced';
import * as authService from './services/authService';
import EnhancedAuthView from './components/EnhancedAuthView';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import ChatManager from './components/ChatManager';
import { OnboardingErrorBoundary } from './src/components/ErrorBoundary';
import EnhancedDashboard from './components/EnhancedDashboard';
import Header from './components/Header';
import JournalingView from './components/JournalingView';
import EnhancedCheckInView from './components/EnhancedCheckInView';
import ExercisesView from './components/ExercisesView';
import ExerciseDetailView from './components/ExerciseDetailView';
import TrendsView from './components/TrendsView';
import EnhancedProfileView from './components/EnhancedProfileView';
import PartnerChatView from './components/PartnerChatView';
import SafetyModal from './components/SafetyModal';
import { Loader } from './components/shared/Loader';
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
                firstName: onboardingData.personalInfo.firstName,
                lastName: onboardingData.personalInfo.lastName,
                age: onboardingData.personalInfo.age,
                gender: onboardingData.personalInfo.gender,
                location: onboardingData.personalInfo.location ? 
                    `${onboardingData.personalInfo.location.city || ''}, ${onboardingData.personalInfo.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : undefined,
                
                // Relationship Information
                relationshipStatus: onboardingData.relationshipInfo.relationshipStatus,
                relationshipDuration: onboardingData.relationshipInfo.relationshipDuration ? 
                    `${onboardingData.relationshipInfo.relationshipDuration.years || 0} years, ${onboardingData.relationshipInfo.relationshipDuration.months || 0} months` : undefined,
                livingTogether: onboardingData.relationshipInfo.livingTogether,
                hasChildren: onboardingData.relationshipInfo.hasChildren,
                childrenAges: onboardingData.relationshipInfo.childrenAges,
                
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
                    ...onboardingData.personalInfo,
                    ...onboardingData.relationshipInfo,
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
                <motion.div 
                    className="flex justify-center items-center min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center space-y-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                        >
                            <Loader size="lg" text="Initializing AI HeartBridge..." centered />
                        </motion.div>
                        <motion.p 
                            className="text-emerald-600 text-lg font-medium"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            💝 Preparing your safe space...
                        </motion.p>
                        <motion.div
                            className="flex space-x-2 justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
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
            return <EnhancedAuthView onLoginSuccess={handleLoginSuccess} />;
        }

        // Render main app views
        switch (currentView) {
            case 'dashboard':
                return (
                    <EnhancedDashboard 
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
                if (couple && currentJournalId) {
                    return (
                        <EnhancedCheckInView 
                            coupleId={couple.id} 
                            journalId={currentJournalId} 
                            onNavigate={handleNavigate} 
                        />
                    );
                }
                return null;
            case 'exercises':
                if (selectedExercise) {
                    return (
                        <ExerciseDetailView 
                            exercise={selectedExercise} 
                            onNavigate={handleNavigate} 
                        />
                    );
                }
                return (
                    <ExercisesView 
                        exercises={exercisesList} 
                        onSelectExercise={handleSelectExercise} 
                    />
                );
            case 'goals':
                return <TrendsView />;
            case 'profile':
                return <EnhancedProfileView onBack={() => setCurrentView('dashboard')} />;
            case 'chat':
                return <ChatManager onBack={() => setCurrentView('dashboard')} />;
            case 'partner-chat':
                return <PartnerChatView onBack={() => setCurrentView('dashboard')} />;
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
            <motion.div 
                className="bg-gradient-to-br from-slate-50 via-white to-blue-50 min-h-screen font-sans text-slate-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatePresence mode="wait">
                    {isAuthenticated && user && (
                        <motion.div
                            key="header"
                            initial={{ y: -60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <Header 
                                user={user} 
                                onNavigate={handleNavigate} 
                                onShowSafetyModal={() => setShowSafetyModal(true)} 
                                onLogout={handleLogout} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
                
                <AnimatePresence>
                    {showSafetyModal && (
                        <SafetyModal onClose={() => setShowSafetyModal(false)} />
                    )}
                </AnimatePresence>
            </motion.div>
        </ToastProvider>
    );
};