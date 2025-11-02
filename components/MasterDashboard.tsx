// AI HeartBridge - Masterpiece Mobile-First Dashboard
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Sparkles,
  Activity,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Plus,
  CheckCircle,
  HeartHandshake,
  AlertCircle,
  Loader2,
  BarChart3,
  Shield,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { pairUsers } from '../services/authService';
import { useToast } from '../src/components/ui/enhanced/ModernToast';
import { getRelationshipTrends, getHealthScore, HealthScore } from '../services/analyticsService';
import { getJournalSessionHistory, JournalSession } from '../services/journalSessionService';
import { getCoupleCheckInHistory, CheckIn } from '../services/checkInService';
import { getCoupleExerciseProgress, ExerciseProgress } from '../services/exerciseService';
import ContextualLoader from './shared/ContextualLoader';

// Activity type for recent activities
type ActivityItem = {
  id: string;
  type: 'checkin' | 'journal' | 'exercise' | 'chat';
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
  bgColor: string;
  emoji: string;
};

interface MasterDashboardProps {
  user: User;
  partner: User | null;
  onNavigate: (view: string) => void;
  onPairingSuccess: (updatedUser: User, newPartner: User) => void;
  onStartJournaling: () => void;
}

const MasterDashboard: React.FC<MasterDashboardProps> = ({
  user,
  partner,
  onNavigate,
  onPairingSuccess,
  onStartJournaling,
}) => {
  // Helper function to format time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const { showToast } = useToast();
  const [pairingCode, setPairingCode] = useState('');
  const [showPairing, setShowPairing] = useState(false);
  
  // Update pairing visibility when partner status changes
  useEffect(() => {
    setShowPairing(!partner);
  }, [partner]);
  const [isPairing, setIsPairing] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    healthScore: 0,
    checkInCount: 0,
    journalSessions: 0,
    exerciseCount: 0,
    daysActive: 0,
    recentInsights: null as any,
    relationshipTrends: null as any,
    recentActivities: [] as ActivityItem[]
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Only load analytics data if user is paired
      if (!partner || !user.coupleId) {
        console.log('User not paired, skipping analytics data load');
        setDashboardData({
          healthScore: 0,
          checkInCount: 0,
          journalSessions: 0,
          exerciseCount: 0,
          daysActive: 0,
          recentInsights: null,
          relationshipTrends: null,
          recentActivities: []
        });
        setLoading(false);
        return;
      }
      
      // Load all dashboard data in parallel
      const [healthScoreData, journalSessions, checkInResponse, exerciseResponse, trends] = await Promise.all([
        getHealthScore().catch(() => null),
        getJournalSessionHistory().catch(() => []),
        getCoupleCheckInHistory().catch(() => ({ checkIns: [] })),
        getCoupleExerciseProgress(1, 100).catch(() => ({ progress: [] })),
        getRelationshipTrends('3months').catch(() => null)
      ]);
      
      const checkInHistory = checkInResponse?.checkIns || [];
      const exerciseProgress = { progress: exerciseResponse?.progress || [] };

      // Calculate basic health score from check-in data if analytics service fails
      let calculatedHealthScore = 0;
      if (!healthScoreData && checkInHistory.length > 0) {
        const completedCheckIns = checkInHistory.filter((checkIn: any) => checkIn.isCompleted && checkIn.averageScore);
        if (completedCheckIns.length > 0) {
          const latestCheckIn = completedCheckIns[completedCheckIns.length - 1];
          // Convert CSI score to 0-100 scale
          if (latestCheckIn.averageScore !== undefined) {
            const maxScore = latestCheckIn.type === 'CSI-4' ? 24 : 96;
            calculatedHealthScore = Math.round((latestCheckIn.averageScore / maxScore) * 100);
          }
        }
      }

      // Calculate days active (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeDays = new Set();
      journalSessions.forEach((session: any) => {
        const sessionDate = new Date(session.createdAt);
        if (sessionDate >= thirtyDaysAgo) {
          activeDays.add(sessionDate.toDateString());
        }
      });
      
      // Handle checkInHistory structure
      const checkIns = checkInHistory;
      checkIns.forEach((checkIn: any) => {
        const checkInDate = new Date(checkIn.createdAt);
        if (checkInDate >= thirtyDaysAgo) {
          activeDays.add(checkInDate.toDateString());
        }
      });

      // Add exercise progress to active days
      const exercises = exerciseProgress.progress || [];
      exercises.forEach((exercise: any) => {
        const exerciseDate = new Date(exercise.dateCompleted);
        if (exerciseDate >= thirtyDaysAgo) {
          activeDays.add(exerciseDate.toDateString());
        }
      });

      // Collect recent activities from all sources
      const recentActivities: ActivityItem[] = [];

      // Add recent check-ins
      const recentCheckIns = (checkIns || [])
        .filter((checkIn: CheckIn) => new Date(checkIn.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a: CheckIn, b: CheckIn) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      recentCheckIns.forEach((checkIn: CheckIn) => {
        recentActivities.push({
          id: `checkin-${checkIn.id}`,
          type: 'checkin' as const,
          title: checkIn.isCompleted ? 'Completed relationship assessment' : 'Started relationship assessment',
          description: `${checkIn.type} - ${getTimeAgo(new Date(checkIn.createdAt))}`,
          timestamp: new Date(checkIn.createdAt),
          icon: CheckCircle,
          color: checkIn.isCompleted ? 'text-emerald-600' : 'text-amber-600',
          bgColor: checkIn.isCompleted ? 'bg-emerald-50' : 'bg-amber-50',
          emoji: checkIn.isCompleted ? '✅' : '⏳'
        });
      });

      // Add recent journal sessions
      const recentJournals = (journalSessions || [])
        .filter((session: JournalSession) => new Date(session.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a: JournalSession, b: JournalSession) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      recentJournals.forEach((session: JournalSession) => {
        recentActivities.push({
          id: `journal-${session.id}`,
          type: 'journal' as const,
          title: session.isClosed ? 'Completed journaling session' : 'Active journaling session',
          description: `${session.title || 'Untitled session'} - ${getTimeAgo(new Date(session.createdAt))}`,
          timestamp: new Date(session.createdAt),
          icon: BookOpen,
          color: session.isClosed ? 'text-purple-600' : 'text-blue-600',
          bgColor: session.isClosed ? 'bg-purple-50' : 'bg-blue-50',
          emoji: session.insights ? '💡' : '📝'
        });
      });

      // Add recent exercises
      const recentExercises = (exercises || [])
        .filter((exercise: ExerciseProgress) => new Date(exercise.dateCompleted) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a: ExerciseProgress, b: ExerciseProgress) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime())
        .slice(0, 3);

      recentExercises.forEach((exercise: ExerciseProgress) => {
        recentActivities.push({
          id: `exercise-${exercise.id}`,
          type: 'exercise' as const,
          title: 'Completed relationship exercise',
          description: `Rating: ${exercise.rating ? `${exercise.rating}/5` : 'Not rated'} - ${getTimeAgo(new Date(exercise.dateCompleted))}`,
          timestamp: new Date(exercise.dateCompleted),
          icon: Target,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          emoji: exercise.rating && exercise.rating >= 4 ? '🌟' : '💪'
        });
      });

      // Sort all activities by timestamp and take the most recent ones
      const sortedActivities = recentActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      setDashboardData({
        healthScore: healthScoreData?.healthScore || calculatedHealthScore || 0,
        checkInCount: (checkIns || []).length,
        journalSessions: (journalSessions || []).length,
        exerciseCount: (exercises || []).length,
        daysActive: activeDays.size,
        recentInsights: (journalSessions || []).find((s: any) => s?.insights) || null,
        relationshipTrends: trends,
        recentActivities: sortedActivities
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showToast({ 
        type: 'error', 
        title: 'Dashboard Load Failed', 
        description: 'Some dashboard data may not be available. Please try refreshing.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data when component mounts or partner status changes
  useEffect(() => {
    loadDashboardData();
  }, [partner, user.coupleId]); // Reload when partner or couple status changes

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

  const handlePairingSubmit = async () => {
    if (!pairingCode.trim() || pairingCode.length < 6) return;
    
    setIsPairing(true);
    setPairingError('');

    try {
      const { currentUser, partner } = await pairUsers(user.id, pairingCode);
      onPairingSuccess(currentUser, partner);
      setPairingCode('');
      setShowPairing(false);
      showToast({ type: 'success', title: 'Partnership Connected! You are now connected with your partner.' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setPairingError(errorMessage);
      showToast({ type: 'error', title: 'Connection Failed', description: errorMessage });
    } finally {
      setIsPairing(false);
    }
  };

  const quickActions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'AI Chat',
      description: 'Private reflection space',
      color: 'from-blue-500 to-cyan-500',
      action: () => onNavigate('chat'),
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Journal Together',
      description: 'Shared reflections',
      color: 'from-purple-500 to-pink-500',
      action: onStartJournaling,
      disabled: !partner,
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Check-in',
      description: 'Track your relationship',
      color: 'from-emerald-500 to-teal-500',
      action: () => onNavigate('checkin'),
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Exercises',
      description: 'Grow together',
      color: 'from-orange-500 to-amber-500',
      action: () => onNavigate('exercises'),
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Insights',
      description: 'View your analytics',
      color: 'from-indigo-500 to-purple-500',
      action: () => onNavigate('trends'),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safety',
      description: 'Crisis resources',
      color: 'from-red-500 to-rose-500',
      action: () => onNavigate('safety'),
    },
  ];

  const stats = [
    { 
      label: 'Check-ins', 
      value: dashboardData.checkInCount.toString(), 
      icon: <CheckCircle className="w-5 h-5" />, 
      color: 'text-emerald-600' 
    },
    { 
      label: 'Sessions', 
      value: dashboardData.journalSessions.toString(), 
      icon: <MessageCircle className="w-5 h-5" />, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Exercises', 
      value: dashboardData.exerciseCount.toString(), 
      icon: <Award className="w-5 h-5" />, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Days Active', 
      value: dashboardData.daysActive.toString(), 
      icon: <Calendar className="w-5 h-5" />, 
      color: 'text-amber-600' 
    },
  ];

  // Show loading state
  if (loading) {
    return <ContextualLoader type="dashboard" message="Loading your relationship dashboard..." />;
  }

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden pt-16 pb-safe">
      {/* Mobile-First Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-6">
        
        {/* Welcome Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center sm:text-left"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back! 💝
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {getUserDisplayName()}
          </p>

        </motion.div>

        {/* Partner Connection Status - Mobile Optimized */}
        <AnimatePresence mode="wait">
          {partner ? (
            <motion.div
              key="partner-connected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-white rounded-full shadow-lg flex-shrink-0">
                        <HeartHandshake className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">Connected with Partner</h3>
                        <p className="text-sm sm:text-base text-gray-600 truncate">{getPartnerDisplayName()}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => onNavigate('partner-chat')}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 h-auto flex-shrink-0 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                    >
                      💬 Chat Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="no-partner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      <h3 className="font-semibold text-base sm:text-lg">Connect with Your Partner</h3>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 sm:p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Pairing Code
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                          <input
                            type="text"
                            value={user.pairingCode}
                            readOnly
                            className="flex-1 px-4 sm:px-4 py-3 sm:py-2 text-center text-xl sm:text-2xl font-mono font-bold bg-gray-50 border-2 border-gray-200 rounded-lg touch-manipulation"
                          />
                          <Button
                            onClick={() => navigator.clipboard.writeText(user.pairingCode)}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center text-gray-500 text-sm">OR</div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Partner's Code
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                          <input
                            type="text"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="flex-1 px-4 sm:px-4 py-3 sm:py-2 text-center text-lg sm:text-lg font-mono font-bold border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 touch-manipulation"
                          />
                          <Button 
                            disabled={pairingCode.length < 6 || isPairing}
                            onClick={handlePairingSubmit}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isPairing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              'Connect'
                            )}
                          </Button>
                        </div>
                        
                        {/* Error Display */}
                        <AnimatePresence>
                          {pairingError && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center space-x-2 text-red-600 text-sm mt-2"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{pairingError}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-cyan-50 border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Relationship Health</h3>
                  <p className="text-sm text-gray-600">Based on your recent activity</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {dashboardData.healthScore}
                  </div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
              
              {/* Health Score Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dashboardData.healthScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full ${
                      dashboardData.healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      dashboardData.healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      dashboardData.healthScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Needs Work</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Health Score Message */}
              <div className="mt-3 p-3 bg-white/60 rounded-lg">
                <p className="text-sm text-gray-700">
                  {dashboardData.healthScore >= 80 && "🌟 Your relationship is thriving! Keep up the great work."}
                  {dashboardData.healthScore >= 60 && dashboardData.healthScore < 80 && "💪 Good progress! Continue building your connection."}
                  {dashboardData.healthScore >= 40 && dashboardData.healthScore < 60 && "🌱 Room for growth. Try more check-ins and exercises."}
                  {dashboardData.healthScore < 40 && "💝 Every relationship can grow. Start with daily check-ins."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-lift">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className={`inline-flex p-1.5 sm:p-2 rounded-full bg-gray-50 mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid - Mobile First */}
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card 
                  className={`hover-lift cursor-pointer group ${action.disabled ? 'opacity-50' : ''}`}
                  onClick={action.disabled ? undefined : action.action}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                      </div>
                      {!action.disabled && (
                        <div className="flex items-center text-emerald-600 font-medium text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                          Get Started
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        </div>
                      )}
                      {action.disabled && (
                        <div className="text-xs sm:text-sm text-gray-400">
                          Connect partner first
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity - Mobile Friendly */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ProgressSection 
              healthScore={dashboardData.healthScore}
              checkInCount={dashboardData.checkInCount}
              journalSessions={dashboardData.journalSessions}
              exerciseCount={dashboardData.exerciseCount}
              daysActive={dashboardData.daysActive}
              recentInsights={dashboardData.recentInsights}
              recentActivities={dashboardData.recentActivities}
              onNavigate={onNavigate}
            />
          </CardContent>
        </Card>

        {/* Mobile Bottom Safe Area */}
        <div className="h-20 sm:h-16 pb-safe" />
      </div>
    </div>
  );
};

// Progress Section Component
interface ProgressSectionProps {
  healthScore: number;
  checkInCount: number;
  journalSessions: number;
  exerciseCount: number;
  daysActive: number;
  recentInsights: any;
  recentActivities: ActivityItem[];
  onNavigate: (view: string) => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({
  healthScore,
  checkInCount,
  journalSessions,
  exerciseCount,
  daysActive,
  recentInsights,
  recentActivities,
  onNavigate
}) => {
  // Calculate progress milestones
  const progressMilestones = [
    {
      title: 'First Steps',
      description: 'Complete your first check-in',
      completed: checkInCount > 0,
      target: 1,
      current: checkInCount,
      color: 'emerald',
      emoji: '🌱'
    },
    {
      title: 'Building Habits',
      description: 'Complete 5 check-ins',
      completed: checkInCount >= 5,
      target: 5,
      current: checkInCount,
      color: 'blue',
      emoji: '🎯'
    },
    {
      title: 'Deep Connection',
      description: 'Complete 3 journal sessions',
      completed: journalSessions >= 3,
      target: 3,
      current: journalSessions,
      color: 'purple',
      emoji: '💝'
    },
    {
      title: 'Growth Together',
      description: 'Complete 5 exercises',
      completed: exerciseCount >= 5,
      target: 5,
      current: exerciseCount,
      color: 'orange',
      emoji: '🌟'
    },
    {
      title: 'Consistency',
      description: 'Stay active for 7 days',
      completed: daysActive >= 7,
      target: 7,
      current: daysActive,
      color: 'amber',
      emoji: '🔥'
    }
  ];

  // Calculate weekly goals
  const weeklyGoals = [
    {
      title: 'Daily Check-ins',
      description: 'Complete check-ins this week',
      progress: Math.min((checkInCount % 7) / 7 * 100, 100),
      target: 7,
      current: checkInCount % 7,
      color: 'emerald'
    },
    {
      title: 'Journal Sessions',
      description: 'Share thoughts together',
      progress: Math.min((journalSessions % 3) / 3 * 100, 100),
      target: 3,
      current: journalSessions % 3,
      color: 'blue'
    },
    {
      title: 'Growth Activities',
      description: 'Practice exercises',
      progress: Math.min((exerciseCount % 2) / 2 * 100, 100),
      target: 2,
      current: exerciseCount % 2,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Health Score Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base text-gray-800">Relationship Health</h3>
          <span className="text-sm text-gray-600">{healthScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${healthScore}%` }}
            transition={{ duration: 1 }}
            className={`h-2 rounded-full ${
              healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              healthScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              healthScore >= 40 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
          />
        </div>
        <div className="text-xs text-gray-600">
          {healthScore >= 80 && "🌟 Excellent relationship health!"}
          {healthScore >= 60 && healthScore < 80 && "💪 Good progress, keep it up!"}
          {healthScore >= 40 && healthScore < 60 && "🌱 Growing stronger together"}
          {healthScore < 40 && "💝 Every journey starts with a first step"}
        </div>
      </div>

      {/* Weekly Goals */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm sm:text-base text-gray-800">This Week's Goals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weeklyGoals.map((goal, index) => (
            <motion.div
              key={goal.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg border-2"
              style={{
                borderColor: goal.progress === 100 ? (
                  goal.color === 'emerald' ? '#a7f3d0' :
                  goal.color === 'blue' ? '#bfdbfe' :
                  goal.color === 'purple' ? '#ddd6fe' : '#e5e7eb'
                ) : '#e5e7eb',
                backgroundColor: goal.progress === 100 ? (
                  goal.color === 'emerald' ? '#ecfdf5' :
                  goal.color === 'blue' ? '#eff6ff' :
                  goal.color === 'purple' ? '#f5f3ff' : '#f9fafb'
                ) : '#f9fafb'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-xs sm:text-sm">{goal.title}</h4>
                <span className="text-xs text-gray-600">{goal.current}/{goal.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-1.5 rounded-full"
                  style={{
                    backgroundColor: goal.color === 'emerald' ? '#10b981' :
                                   goal.color === 'blue' ? '#3b82f6' :
                                   goal.color === 'purple' ? '#8b5cf6' :
                                   goal.color === 'orange' ? '#f97316' :
                                   goal.color === 'amber' ? '#f59e0b' : '#6b7280'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600">{goal.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Milestones */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm sm:text-base text-gray-800">Achievement Milestones</h3>
        <div className="space-y-2">
          {progressMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all"
              style={{
                borderColor: milestone.completed ? (
                  milestone.color === 'emerald' ? '#a7f3d0' :
                  milestone.color === 'blue' ? '#bfdbfe' :
                  milestone.color === 'purple' ? '#ddd6fe' :
                  milestone.color === 'orange' ? '#fed7aa' :
                  milestone.color === 'amber' ? '#fde68a' : '#e5e7eb'
                ) : '#e5e7eb',
                backgroundColor: milestone.completed ? (
                  milestone.color === 'emerald' ? '#ecfdf5' :
                  milestone.color === 'blue' ? '#eff6ff' :
                  milestone.color === 'purple' ? '#f5f3ff' :
                  milestone.color === 'orange' ? '#fff7ed' :
                  milestone.color === 'amber' ? '#fffbeb' : '#f9fafb'
                ) : '#f9fafb'
              }}
            >
              <div className={`text-lg ${milestone.completed ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                {milestone.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{milestone.title}</h4>
                  {milestone.completed && (
                    <CheckCircle 
                      className="w-4 h-4"
                      style={{
                        color: milestone.color === 'emerald' ? '#059669' :
                               milestone.color === 'blue' ? '#2563eb' :
                               milestone.color === 'purple' ? '#7c3aed' :
                               milestone.color === 'orange' ? '#ea580c' :
                               milestone.color === 'amber' ? '#d97706' : '#4b5563'
                      }}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-600">{milestone.description}</p>
                {!milestone.completed && (
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(milestone.current / milestone.target) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-1 rounded-full"
                        style={{
                          backgroundColor: milestone.color === 'emerald' ? '#10b981' :
                                         milestone.color === 'blue' ? '#3b82f6' :
                                         milestone.color === 'purple' ? '#8b5cf6' :
                                         milestone.color === 'orange' ? '#f97316' :
                                         milestone.color === 'amber' ? '#f59e0b' : '#6b7280'
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {milestone.current}/{milestone.target}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm sm:text-base text-gray-800">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 3).map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${activity.bgColor} border border-gray-200`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${activity.color}`} />
                    <div>
                      <p className="font-medium text-xs sm:text-sm text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-lg">{activity.emoji}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <Button 
          onClick={() => onNavigate('trends')} 
          variant="outline" 
          className="w-full text-sm"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          View Detailed Analytics
        </Button>
        <Button 
          onClick={() => onNavigate('checkin')} 
          className="w-full text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          Start Check-in
        </Button>
      </div>
    </div>
  );
};

export default MasterDashboard;

