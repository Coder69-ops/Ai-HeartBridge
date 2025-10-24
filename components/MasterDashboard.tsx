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
  Shield
} from 'lucide-react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { pairUsers } from '../services/authService';
import { useToast } from '../src/components/ui/enhanced/ModernToast';
import { toast } from '../src/components/ui/enhanced/ModernToast';
import { getRelationshipTrends, getHealthScore } from '../services/analyticsService';
import { getJournalSessionHistory } from '../services/journalSessionService';
import { getCoupleCheckInHistory } from '../services/checkInService';
import { getCoupleExerciseProgress } from '../services/exerciseService';
import ContextualLoader from './shared/ContextualLoader';

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
  const [pairingCode, setPairingCode] = useState('');
  const [showPairing, setShowPairing] = useState(!partner);
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
    relationshipTrends: null as any
  });
  const { showToast } = useToast();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load all dashboard data in parallel
        const [healthScore, journalSessions, checkInHistory, exerciseProgress, trends] = await Promise.all([
          getHealthScore().catch(() => ({ overallScore: 0 })),
          getJournalSessionHistory().catch(() => []),
          getCoupleCheckInHistory().catch(() => []),
          getCoupleExerciseProgress(1, 100).catch(() => ({ progress: [] })),
          getRelationshipTrends('3months').catch(() => null)
        ]);

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
        const checkIns = Array.isArray(checkInHistory) ? checkInHistory : checkInHistory.checkIns || [];
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

        setDashboardData({
          healthScore: (healthScore as any)?.overallScore || 0,
          checkInCount: (checkIns || []).length,
          journalSessions: (journalSessions || []).length,
          exerciseCount: (exercises || []).length,
          daysActive: activeDays.size,
          recentInsights: (journalSessions || []).find((s: any) => s?.insights) || null,
          relationshipTrends: trends
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user.id, partner?.id]);

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
      showToast(toast.success('Partnership Connected!', 'You are now connected with your partner.'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setPairingError(errorMessage);
      showToast(toast.error('Connection Failed', errorMessage));
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
    <div className="h-screen overflow-y-auto pt-16">
      {/* Mobile-First Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
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
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={user.pairingCode}
                            readOnly
                            className="flex-1 px-3 sm:px-4 py-2 text-center text-lg sm:text-2xl font-mono font-bold bg-gray-50 border-2 border-gray-200 rounded-lg"
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
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="flex-1 px-3 sm:px-4 py-2 text-center text-base sm:text-lg font-mono font-bold border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Completed daily check-in</p>
                    <p className="text-xs sm:text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl">✨</span>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Chat session</p>
                    <p className="text-xs sm:text-sm text-gray-600">Yesterday</p>
                  </div>
                </div>
                <span className="text-xl sm:text-2xl">💙</span>
              </div>
              
              <Button variant="outline" className="w-full text-sm sm:text-base">
                View All Activity
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Bottom Spacing */}
        <div className="h-16 sm:h-20" />
      </div>
    </div>
  );
};

export default MasterDashboard;

