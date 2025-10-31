import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import { User, Exercise, Message, OnboardingData } from './types';
import { ToastProvider, useToast } from './src/components/ui/enhanced/ModernToast';
import * as authService from './services/authService';
import MasterAuthView from './components/MasterAuthView';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import ChatManager from './components/ChatManager';
import { OnboardingErrorBoundary } from './src/components/ErrorBoundary';
import { JournalErrorBoundary } from './components/JournalErrorBoundary';
import MasterDashboard from './components/MasterDashboard';
import SimpleHeader from './components/SimpleHeader';
import JournalingView from './components/JournalingView';
import JournalManager from './components/JournalManager';
import MasterCheckInView from './components/MasterCheckInView';
import StandaloneCheckInView from './components/StandaloneCheckInView';


import EnhancedExercisesView from './components/EnhancedExercisesView';
import MasterTrendsView from './components/MasterTrendsView';
import MasterProfileView from './components/MasterProfileView';
import EnhancedProfileView from './components/EnhancedProfileView';
import EnhancedPartnerChat from './components/EnhancedPartnerChat';
import MasterSafetyModal from './components/MasterSafetyModal';
import MasterPartnerPairingView from './components/MasterPartnerPairingView';
import MasterSafetyCenter from './components/MasterSafetyCenter';
import { GorgeousLoader } from './components/shared/GorgeousLoader';


const AppContentInner: React.FC = () => {
    // Zustand stores
    const { user, partner, couple, isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
    const { currentView, setCurrentView, showSafetyModal, toggleSafetyModal, currentJournalId, setCurrentJournalId } = useAppStore();
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);



    // Initialize auth on app startup
    useEffect(() => {
        const initializeAuth = async () => {
            await initialize();
        };
        initializeAuth();
    }, [initialize]);

    // Set local loading to false after auth loading completes
    useEffect(() => {
        if (!authLoading) {
            setIsLoading(false);
        }
    }, [authLoading]);

    // Force loading to complete after a timeout to prevent infinite loading
    useEffect(() => {
        const forceLoadTimeout = setTimeout(() => {
            console.log('Force completing loading after timeout');
            setIsLoading(false);
        }, 5000); // 5 second timeout

        return () => clearTimeout(forceLoadTimeout);
    }, []);





    const handleOnboardingComplete = async (onboardingData: OnboardingData) => {
        const { updateProfile } = useAuthStore.getState();
        try {
            const formattedData = {
                isOnboardingComplete: true,
                onboardingCompletedAt: new Date(),
                firstName: onboardingData.personalInfo?.firstName,
                lastName: onboardingData.personalInfo?.lastName,
                age: onboardingData.personalInfo?.age,
                gender: onboardingData.personalInfo?.gender,
                location: onboardingData.personalInfo?.location ? 
                    `${onboardingData.personalInfo.location.city || ''}, ${onboardingData.personalInfo.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : undefined,
                relationshipStatus: onboardingData.relationshipInfo?.relationshipStatus,
                relationshipDuration: onboardingData.relationshipInfo?.relationshipDuration ? 
                    `${onboardingData.relationshipInfo.relationshipDuration.years || 0} years, ${onboardingData.relationshipInfo.relationshipDuration.months || 0} months` : undefined,
                livingTogether: onboardingData.relationshipInfo?.livingTogether,
                hasChildren: onboardingData.relationshipInfo?.hasChildren,
                childrenAges: onboardingData.relationshipInfo?.childrenAges,
                primaryGoals: Array.isArray(onboardingData.goals) && onboardingData.goals.length > 0 ? onboardingData.goals : undefined,
                relationshipChallenges: Array.isArray(onboardingData.challenges) && onboardingData.challenges.length > 0 ? onboardingData.challenges : undefined,
                notificationSettings: onboardingData.preferences?.notifications !== undefined ? {
                    dailyCheckins: onboardingData.preferences.notifications,
                    exerciseReminders: onboardingData.preferences.notifications,
                    partnerUpdates: onboardingData.preferences.notifications,
                    weeklyReports: onboardingData.preferences.notifications
                } : undefined,
                privacyLevel: onboardingData.preferences?.privacyLevel,
                preferredTimeOfDay: onboardingData.preferences?.communicationStyle === 'gentle' ? 'evening' : 'afternoon',
                profile: {
                    ...(onboardingData.personalInfo || {}),
                    ...(onboardingData.relationshipInfo || {}),
                    primaryGoals: onboardingData.goals,
                    relationshipChallenges: onboardingData.challenges
                },
                preferences: onboardingData.preferences
            };

            const cleanedData = Object.fromEntries(
                Object.entries(formattedData).filter(([_, value]) => value !== undefined)
            );

            console.log('Saving onboarding data:', cleanedData);
            
            await updateProfile(cleanedData);
            
            console.log('Onboarding data saved successfully');
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Failed to save onboarding data:', error);
            showToast({ 
                type: 'error', 
                title: 'Onboarding Save Failed', 
                description: 'Your progress has been saved locally and will sync when connection is restored.' 
            });
            setCurrentView('dashboard');
        }
    };
    

    
    const handleLogout = () => {
        const { logout } = useAuthStore.getState();
        logout();
        // Also clear the old auth service tokens for compatibility
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setCurrentView('dashboard');
    };
    
    const handleNavigate = (newView: string) => {
        // Ensure the view is a valid string-based view
        const validViews = ['dashboard', 'journal', 'checkin', 'exercises', 'trends', 'profile', 'chat', 'partner-chat', 'pairing', 'safety'];
        if (validViews.includes(newView)) {
            setCurrentView(newView as any);
        } else {
            console.warn(`Invalid view: ${newView}, defaulting to dashboard`);
            setCurrentView('dashboard');
        }
    };



    const handleStartJournaling = async () => {
        if (!user?.coupleId || !partner) return;
        try {
            const newJournal = await authService.createJournalEntry(user.coupleId);
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
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Error updating journal entry:', error);
        }
    };

    const handlePairingSuccess = (updatedUser: User, newPartner: User) => {
        // Update auth store directly with the fresh data from pairing response
        useAuthStore.setState({
            user: updatedUser,
            partner: newPartner
        });
        
        // Also update localStorage with the new user data
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        console.log('Partner pairing successful:', { updatedUser, newPartner });
    };

    const renderContent = () => {
        console.log('AppContent render state:', { 
            isLoading, 
            authLoading, 
            isAuthenticated, 
            hasUser: !!user, 
            currentView,
            userOnboardingComplete: user?.isOnboardingComplete 
        });

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
            return <MasterAuthView />;
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
                        <JournalErrorBoundary onBack={() => setCurrentView('dashboard')}>
                            <React.Suspense fallback={<div className="p-8 text-center">Loading journal...</div>}>
                                <JournalManager 
                                    user={user} 
                                    partner={partner} 
                                    onBack={() => setCurrentView('dashboard')}
                                />
                            </React.Suspense>
                        </JournalErrorBoundary>
                    );
                }
                return (
                    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Journal</h2>
                            <p className="text-gray-600 mb-6">
                                You need to be paired with a partner to use the journal feature.
                            </p>
                            <button 
                                onClick={() => setCurrentView('dashboard')}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                );
            case 'checkin':
                // If coming from journaling, use the current journal ID for analysis
                if (couple && currentJournalId) {
                    return (
                        <MasterCheckInView 
                            coupleId={couple.id} 
                            journalId={currentJournalId} 
                            onNavigate={handleNavigate} 
                        />
                    );
                }
                // If navigating directly to check-in, show standalone check-in
                return (
                    <StandaloneCheckInView 
                        coupleId={couple?.id || ''} 
                        onNavigate={handleNavigate} 
                    />
                );
            case 'exercises':
                return (
                    <EnhancedExercisesView 
                        onBack={() => setCurrentView('dashboard')} 
                    />
                );
            case 'trends':
                return <MasterTrendsView onBack={() => setCurrentView('dashboard')} />;
            case 'profile':
                return <EnhancedProfileView onBack={() => setCurrentView('dashboard')} />;
            case 'chat':
                return <ChatManager onBack={() => setCurrentView('dashboard')} />;
            case 'partner-chat':
                return <EnhancedPartnerChat onBack={() => setCurrentView('dashboard')} />;
            case 'pairing':
                return (
                    <MasterPartnerPairingView 
                        user={user} 
                        onBack={() => setCurrentView('dashboard')} 
                    />
                );
            case 'safety':
                return <MasterSafetyCenter onBack={() => setCurrentView('dashboard')} />;
            default:
                return (
                    <div className="text-center p-8">
                        <p className="text-muted-foreground">Page not found.</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50" style={{ position: 'relative' }}>
                {isAuthenticated && user && !authLoading && (
                    <>
                        {/* Simple Header - Fully Responsive */}
                        <SimpleHeader 
                            user={user} 
                            onNavigate={handleNavigate}
                            onShowSafetyModal={() => toggleSafetyModal(true)} 
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
                        className={isLoading || authLoading ? "" : "pt-16"}
                    >
                        <React.Suspense fallback={<div>Loading content...</div>}>
                            {renderContent()}
                        </React.Suspense>
                    </motion.div>
                </AnimatePresence>

                <AnimatePresence>
                    {showSafetyModal && (
                        <MasterSafetyModal 
                            onClose={() => toggleSafetyModal(false)} 
                            onNavigateToSafetyCenter={() => {
                                toggleSafetyModal(false);
                                setCurrentView('safety');
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Debug overlay */}
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    right: 0, 
                    background: 'rgba(0,0,0,0.8)', 
                    color: 'white', 
                    padding: '10px', 
                    fontSize: '12px',
                    zIndex: 9999 
                }}>
                    Debug: Loading={isLoading ? 'true' : 'false'}, Auth={isAuthenticated ? 'true' : 'false'}, View={currentView}
                </div>
            </div>
    );
};

export const AppContent: React.FC = () => {
    return (
        <ToastProvider>
            <AppContentInner />
        </ToastProvider>
    );
};