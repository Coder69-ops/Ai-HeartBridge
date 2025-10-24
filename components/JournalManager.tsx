import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { 
  JournalSession, 
  JournalSessionStatus, 
  getActiveJournalSession, 
  getJournalSessionHistory,
  continueJournalSession,
  createJournalSession
} from '../services/journalSessionService';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';
import ContextualLoader from './shared/ContextualLoader';
import JournalingView from './JournalingView';
import JournalSessionsView from './JournalSessionsView';
import JournalNotification from './JournalNotification';

interface JournalManagerProps {
  user: User;
  partner: User;
  onBack: () => void;
}

type JournalView = 'menu' | 'active' | 'history' | 'new';

const JournalManager: React.FC<JournalManagerProps> = ({ user, partner, onBack }) => {
  const [currentView, setCurrentView] = useState<JournalView>('menu');
  const [activeSession, setActiveSession] = useState<JournalSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<JournalSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'partner_completed' | 'insights_ready' | 'reminder';
    partnerName?: string;
  } | null>(null);

  // Load active session and history on mount
  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load active session and history in parallel
      const [activeSessionData, historyData] = await Promise.all([
        getActiveJournalSession().catch(() => null),
        getJournalSessionHistory().catch(() => [])
      ]);

      setActiveSession(activeSessionData);
      setSessionHistory(historyData);

      // Show appropriate notifications based on session status
      if (activeSessionData) {
        // Only show notifications to the partner who should see them
        if (activeSessionData.status === JournalSessionStatus.PARTNER1_COMPLETE && !activeSessionData.isCurrentUserPartner1) {
          // Partner1 completed, show notification to Partner2
          setNotification({
            type: 'partner_completed',
            partnerName: partner.profile?.firstName || partner.name || 'Your partner'
          });
        } else if (activeSessionData.status === JournalSessionStatus.PARTNER2_COMPLETE && activeSessionData.isCurrentUserPartner1) {
          // Partner2 completed, show notification to Partner1
          setNotification({
            type: 'partner_completed',
            partnerName: partner.profile?.firstName || partner.name || 'Your partner'
          });
        } else if (activeSessionData.status === JournalSessionStatus.INSIGHTS_READY) {
          // Both completed, show insights ready notification to both
          setNotification({
            type: 'insights_ready'
          });
        }
        // Don't automatically go to active view - let user choose from menu
      }
    } catch (err: any) {
      console.error('Error loading journal data:', err);
      setError(err.message || 'Failed to load journal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewSession = async () => {
    try {
      setIsLoading(true);
      const newSession = await createJournalSession();
      setActiveSession(newSession.session);
      setCurrentView('active');
    } catch (err: any) {
      console.error('Error creating new session:', err);
      setError(err.message || 'Failed to create new session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = await continueJournalSession(sessionId);
      setActiveSession(session);
      setCurrentView('active');
    } catch (err: any) {
      console.error('Error continuing session:', err);
      setError(err.message || 'Failed to continue session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJournalComplete = async (entry: { partner1Chat: any[], partner2Chat: any[] }) => {
    console.log('JournalManager - handleJournalComplete called, refreshing data...');
    // Refresh data after completion
    await loadJournalData();
    // Don't navigate away - stay in the journal view to show updated status
    console.log('JournalManager - Data refreshed, staying in journal view');
  };

  const getSessionStatusInfo = (status: JournalSessionStatus) => {
    switch (status) {
      case JournalSessionStatus.CREATED:
        return { text: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' };
      case JournalSessionStatus.PARTNER1_COMPLETE:
        return { text: 'Waiting for Partner', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case JournalSessionStatus.PARTNER2_COMPLETE:
        return { text: 'Generating Insights', color: 'text-purple-600', bg: 'bg-purple-50' };
      case JournalSessionStatus.INSIGHTS_READY:
        return { text: 'Insights Ready', color: 'text-green-600', bg: 'bg-green-50' };
      case JournalSessionStatus.CLOSED:
        return { text: 'Completed', color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  if (isLoading) {
    return <ContextualLoader type="journal" message="Loading your journal..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <Icon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadJournalData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's an active session, show the journaling view
  if (currentView === 'active' && activeSession) {
    console.log('JournalManager - Rendering JournalingView with activeSession:', activeSession);
    console.log('JournalManager - activeSession.status:', activeSession.status);
    console.log('JournalManager - activeSession.insights:', activeSession.insights);
    return (
      <JournalingView
        user={user}
        partner={partner}
        onComplete={handleJournalComplete}
        isReturningUser={sessionHistory.length > 0}
        sessionId={activeSession.id}
        initialUserChat={activeSession.isCurrentUserPartner1 
          ? activeSession.partner1Chat?.map(msg => ({
              id: `msg_${Date.now()}_${Math.random()}`,
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp
            }))
          : activeSession.partner2Chat?.map(msg => ({
              id: `msg_${Date.now()}_${Math.random()}`,
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp
            }))
        }
        initialPartnerChat={activeSession.isCurrentUserPartner1 
          ? activeSession.partner2Chat?.map(msg => ({
              id: `msg_${Date.now()}_${Math.random()}`,
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp
            }))
          : activeSession.partner1Chat?.map(msg => ({
              id: `msg_${Date.now()}_${Math.random()}`,
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp
            }))
        }
        currentUserId={user.id}
        sessionStatus={activeSession.status}
        isCurrentUserPartner1={activeSession.isCurrentUserPartner1}
        insights={activeSession.insights}
      />
    );
  }

  // Show history view
  if (currentView === 'history') {
    return (
      <JournalSessionsView
        sessions={sessionHistory}
        onBack={() => setCurrentView('menu')}
        onContinueSession={handleContinueSession}
        onNewSession={handleStartNewSession}
      />
    );
  }

  // Main menu view
  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4 pt-20 overflow-y-auto">
      {/* Notification */}
      {notification && (
        <JournalNotification
          type={notification.type}
          partnerName={notification.partnerName}
          onAction={() => {
            if (notification.type === 'partner_completed' || notification.type === 'insights_ready') {
              setCurrentView('active');
            }
          }}
          onDismiss={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-white/50 flex-shrink-0"
            >
              <Icon name="arrow-left" className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Journal</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Reflect together and grow stronger</p>
            </div>
          </div>
        </div>

        {/* Active Session Card - Mobile Optimized */}
        {activeSession && (
          <Card className="mb-4 sm:mb-6 border-2 border-emerald-200 bg-emerald-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-full flex-shrink-0">
                    <Icon name="book-open" className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Active Journal Session</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {getSessionStatusInfo(activeSession.status).text}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => {
                      console.log('View Insights button clicked');
                      console.log('activeSession.status:', activeSession.status);
                      console.log('activeSession.insights:', activeSession.insights);
                      setCurrentView('active');
                    }}
                    variant="therapy"
                    size="sm"
                  >
                    {activeSession.status === JournalSessionStatus.INSIGHTS_READY ? 'View Insights' : 'Continue'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* New Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={handleStartNewSession}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon name="plus" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Start New Session</h3>
                <p className="text-gray-600 text-sm">
                  Begin a fresh reflection session with your partner
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* View History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setCurrentView('history')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon name="history" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">View History</h3>
                <p className="text-gray-600 text-sm">
                  Browse past sessions and insights ({sessionHistory.length} sessions)
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Sessions Preview */}
        {sessionHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionHistory.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleContinueSession(session.id)}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{session.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString()} • {session.messageCount} messages
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionStatusInfo(session.status).bg} ${getSessionStatusInfo(session.status).color}`}>
                          {getSessionStatusInfo(session.status).text}
                        </span>
                        <Icon name="chevron-right" className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
                {sessionHistory.length > 3 && (
                  <Button
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setCurrentView('history')}
                  >
                    View All Sessions
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JournalManager;
