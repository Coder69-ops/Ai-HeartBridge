import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, User } from '../types';
import SimpleChatView from './SimpleChatView';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { GorgeousLoader } from './shared/GorgeousLoader';
import Icon from './shared/Icon';
import { JournalSession, JournalSessionStatus } from '../services/journalSessionService';
import { completeJournalReflection, getJournalSession } from '../services/journalSessionService';

interface AsyncJournalingViewProps {
  sessionId: string;
  user: User;
  partner: User;
  onComplete?: (session: JournalSession) => void;
  onBack?: () => void;
}

const AsyncJournalingView: React.FC<AsyncJournalingViewProps> = ({
  sessionId,
  user,
  partner,
  onComplete,
  onBack
}) => {
  const [session, setSession] = useState<JournalSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getJournalSession(sessionId);
      setSession(response.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReflectionComplete = async (chatHistory: Message[]) => {
    try {
      setIsCompleting(true);
      const response = await completeJournalReflection(sessionId, chatHistory);
      setSession(response.session);
      
      if (onComplete) {
        onComplete(response.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete reflection');
    } finally {
      setIsCompleting(false);
    }
  };

  const getPartnerDisplayName = () => {
    if (!partner) return '';
    if (partner.profile?.firstName) {
      return partner.profile.firstName + (partner.profile.lastName ? ` ${partner.profile.lastName}` : '');
    }
    return partner.name || partner.email.split('@')[0];
  };

  const getUserDisplayName = () => {
    if (user.profile?.firstName) {
      return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName}` : '');
    }
    return user.name || user.email.split('@')[0];
  };

  const getStatusDisplay = () => {
    if (!session) return { text: 'Loading...', color: 'gray', icon: 'loader' };
    
    switch (session.status) {
      case JournalSessionStatus.CREATED:
        return { text: 'Ready to begin reflection', color: 'blue', icon: 'play' };
      case JournalSessionStatus.PARTNER1_COMPLETE:
        return { text: 'Partner 1 complete, waiting for Partner 2', color: 'yellow', icon: 'clock' };
      case JournalSessionStatus.PARTNER2_COMPLETE:
        return { text: 'Both complete, analyzing...', color: 'purple', icon: 'brain' };
      case JournalSessionStatus.ANALYSIS_PENDING:
        return { text: 'AI analyzing your reflections...', color: 'purple', icon: 'brain' };
      case JournalSessionStatus.INSIGHTS_READY:
        return { text: 'Insights ready!', color: 'green', icon: 'check' };
      case JournalSessionStatus.CLOSED:
        return { text: 'Session completed', color: 'gray', icon: 'archive' };
      default:
        return { text: 'Unknown status', color: 'gray', icon: 'help' };
    }
  };

  const shouldUserReflect = () => {
    if (!session) return false;
    const isPartner1 = session.partner1Id === user.id;
    return (isPartner1 && !session.partner1Chat?.length) || 
           (!isPartner1 && !session.partner2Chat?.length);
  };

  const shouldPartnerReflect = () => {
    if (!session) return false;
    const isPartner1 = session.partner1Id === user.id;
    return (isPartner1 && session.partner1Chat?.length && !session.partner2Chat?.length) ||
           (!isPartner1 && session.partner2Chat?.length && !session.partner1Chat?.length);
  };

  const canViewInsights = () => {
    return session?.status === JournalSessionStatus.INSIGHTS_READY;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <GorgeousLoader 
          message="Loading your journal session..." 
          type="therapy"
          size="lg"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card variant="therapy" className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <Icon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Session</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadSession} variant="therapy">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card variant="therapy" className="max-w-md mx-auto text-center">
          <CardContent className="p-6">
            <Icon name="file-x" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Session Not Found</h3>
            <p className="text-gray-600 mb-4">This journal session could not be found.</p>
            {onBack && (
              <Button onClick={onBack} variant="therapy">
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header with Back Button */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600"
            >
              <Icon name="arrow-left" className="w-4 h-4" />
              <span>Back to Journal History</span>
            </Button>
          </motion.div>
        )}

        {/* Status Indicator - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="calm" className="sticky top-0 z-10 backdrop-blur-sm border-b-2 border-therapy-calm/20">
            <CardContent className="py-3 sm:py-4 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 bg-${statusDisplay.color}-500`} />
                  <div className="flex items-center gap-2">
                    <Icon name={statusDisplay.icon} className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <span className="text-sm sm:text-base font-medium text-gray-800">
                      {statusDisplay.text}
                    </span>
                  </div>
                </div>
                
                <div className="text-left sm:text-right text-xs sm:text-sm text-gray-500 w-full sm:w-auto">
                  <div>Session: {session.title}</div>
                  <div>Created: {new Date(session.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {shouldUserReflect() && (
            <motion.div
              key="user-reflection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="therapy" className="animate-slide-in-down">
                <CardHeader className="text-center p-4 sm:p-6">
                  <CardTitle className="flex items-center justify-center gap-2 text-therapy-calm text-lg sm:text-xl">
                    <span className="text-lg sm:text-xl">💙</span>
                    <span className="truncate">{getUserDisplayName()}'s Reflection Time</span>
                  </CardTitle>
                  <p className="text-neutral-600 mt-2 text-sm sm:text-base">
                    Share your heart with Bridge - this is your private space 🤗
                  </p>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <SimpleChatView
                    partnerName={getUserDisplayName()}
                    onComplete={handleReflectionComplete}
                    isReturningUser={true}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {shouldPartnerReflect() && (
            <motion.div
              key="waiting-for-partner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="therapy" className="text-center animate-fade-in">
                <CardHeader className="p-4 sm:p-6">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-therapy-warmth/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <Icon name="heart" className="w-8 h-8 sm:w-10 sm:h-10 text-therapy-warmth" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                    ✨ Waiting for {getPartnerDisplayName()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                    You've shared your thoughts beautifully 💝 {getPartnerDisplayName()} has been notified and will share their perspective when they're ready.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Icon name="clock" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>No rush - take your time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="heart" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Your partner will be notified</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-therapy-calm/5 rounded-lg border border-therapy-calm/20">
                    <p className="text-sm sm:text-base text-therapy-calm font-medium">
                      💡 You'll receive a notification when {getPartnerDisplayName()} completes their reflection, and then you can both explore your shared insights together.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {canViewInsights() && (
            <motion.div
              key="insights-ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="therapy" className="text-center animate-fade-in">
                <CardHeader className="p-4 sm:p-6">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-therapy-growth/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <Icon name="sparkles" className="w-8 h-8 sm:w-10 sm:h-10 text-therapy-growth" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                    ✨ Your Insights Are Ready!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                    Both reflections have been analyzed with AI-powered insights. Discover your shared growth opportunities and relationship strengths.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Icon name="brain" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>AI Analysis Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="users" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Both perspectives included</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      // This would navigate to insights view
                      console.log('View insights for session:', sessionId);
                    }}
                    variant="therapy" 
                    size="lg"
                    className="mt-4 sm:mt-6 animate-bounce-in text-sm sm:text-base py-2.5 sm:py-3"
                  >
                    🌟 View Your Shared Insights
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {session.status === JournalSessionStatus.ANALYSIS_PENDING && (
            <motion.div
              key="analysis-pending"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="therapy" className="text-center animate-fade-in">
                <CardHeader className="p-4 sm:p-6">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-therapy-calm/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <Icon name="brain" className="w-8 h-8 sm:w-10 sm:h-10 text-therapy-calm animate-pulse" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-therapy-calm">
                    🧠 Analyzing Your Reflections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                    Our AI is carefully analyzing both of your reflections to provide personalized insights and growth opportunities.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 py-3 sm:py-4 text-xs sm:text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Icon name="clock" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>This usually takes 1-2 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="shield" className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Your privacy is protected</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <GorgeousLoader 
                      message="Generating your personalized insights..." 
                      type="therapy"
                      size="md"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AsyncJournalingView;
