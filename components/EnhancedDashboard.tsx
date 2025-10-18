import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import * as authService from '../services/authService';
import { 
  GlassmorphismCard, 
  GlassCardHeader, 
  GlassCardTitle, 
  GlassCardContent,
  AnimatedButton,
  ModernLoader,
  useToast,
  toast 
} from '../src/components/ui/enhanced';
import { Heart, Users, MessageCircle, Activity, QrCode, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface DashboardProps {
  user: User;
  partner: User | null;
  onNavigate: (view: string) => void;
  onPairingSuccess: (user: User, partner: User) => void;
  onStartJournaling: () => void;
}

const EnhancedDashboard: React.FC<DashboardProps> = ({ 
  user, 
  partner, 
  onNavigate, 
  onPairingSuccess, 
  onStartJournaling 
}) => {
  const [pairingCode, setPairingCode] = useState('');
  const [isPairing, setIsPairing] = useState(false);
  const [pairingError, setPairingError] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [pairingSuccessData, setPairingSuccessData] = useState<{ currentUser: User, partner: User } | null>(null);
  const { showToast } = useToast();

  const handlePairingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCode.trim()) return;
    
    setIsPairing(true);
    setPairingError('');

    try {
      const { currentUser, partner } = await authService.pairUsers(user.id, pairingCode);
      setPairingSuccessData({ currentUser, partner });
      showToast(toast.success('Partnership Connected!', 'You are now connected with your partner.'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setPairingError(errorMessage);
      showToast(toast.error('Connection Failed', errorMessage));
    } finally {
      setIsPairing(false);
    }
  };

  const handleConfirmPairing = () => {
    if (pairingSuccessData) {
      onPairingSuccess(pairingSuccessData.currentUser, pairingSuccessData.partner);
    }
  };

  const handleQuickAction = (action: string, title: string) => {
    showToast(toast.info(`Opening ${title}`, 'Taking you to your next step...'));
    setTimeout(() => onNavigate(action), 500);
  };

  // Pairing Success View
  if (pairingSuccessData) {
    return (
      <motion.div 
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <GlassmorphismCard 
          variant="therapy" 
          padding="lg" 
          className="text-center"
          shimmer
          floatingElements
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          </motion.div>
          
          <GlassCardTitle className="text-2xl text-emerald-700 mb-4">
            Connection Successful! 💚
          </GlassCardTitle>
          
          <GlassCardContent>
            <motion.p 
              className="text-emerald-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to your shared journey with <strong>{pairingSuccessData.partner.name}</strong>!
              You're now connected and ready to strengthen your relationship.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatedButton 
                variant="therapy" 
                size="lg" 
                onClick={handleConfirmPairing}
                animation="bounce"
                leftIcon={<Heart className="w-5 h-5" />}
              >
                Start Your Journey Together
              </AnimatedButton>
            </motion.div>
          </GlassCardContent>
        </GlassmorphismCard>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          Welcome back, {user.name}! 💙
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your safe space for connection, growth, and deeper understanding
        </motion.p>
      </motion.div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassmorphismCard 
            variant={partner ? "therapy" : "default"}
            hover
            className="h-full"
          >
            <GlassCardHeader 
              icon={partner ? 
                <Heart className="w-8 h-8 text-emerald-500" /> : 
                <Users className="w-8 h-8 text-gray-400" />
              }
            >
              <div>
                <GlassCardTitle className="text-xl">
                  {partner ? 'Connected' : 'Ready to Connect'}
                </GlassCardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {partner ? `With ${partner.name}` : 'Find your partner'}
                </p>
              </div>
            </GlassCardHeader>
            
            <GlassCardContent>
              {partner ? (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-emerald-700 font-medium">Partnership Active</span>
                  </div>
                  
                  <AnimatedButton 
                    variant="therapy" 
                    onClick={onStartJournaling}
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    className="w-full"
                  >
                    Start Reflection Session
                  </AnimatedButton>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Share your pairing code or enter your partner's code to connect
                  </p>
                  
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-600 mb-2">Your Pairing Code:</p>
                    <code className="text-2xl font-bold text-blue-800">{user.pairingCode}</code>
                  </div>

                  <form onSubmit={handlePairingSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter partner's code"
                      value={pairingCode}
                      onChange={(e) => setPairingCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      disabled={isPairing}
                    />
                    
                    <AnimatePresence>
                      {pairingError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center space-x-2 text-red-600 text-sm"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>{pairingError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatedButton 
                      type="submit" 
                      variant="primary" 
                      loading={isPairing}
                      disabled={!pairingCode.trim() || isPairing}
                      className="w-full"
                    >
                      {isPairing ? 'Connecting...' : 'Connect with Partner'}
                    </AnimatedButton>
                  </form>
                </div>
              )}
            </GlassCardContent>
          </GlassmorphismCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassmorphismCard hover className="h-full">
            <GlassCardHeader icon={<Sparkles className="w-8 h-8 text-indigo-500" />}>
              <div>
                <GlassCardTitle className="text-xl">Quick Actions</GlassCardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Explore tools for growth
                </p>
              </div>
            </GlassCardHeader>
            
            <GlassCardContent>
              <div className="grid grid-cols-2 gap-3">
                <AnimatedButton
                  variant="therapy"
                  size="sm"
                  onClick={() => handleQuickAction('chat', 'AI Chat')}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  className="text-xs col-span-2"
                >
                  💬 Chat with AI Companion
                </AnimatedButton>
                
                <AnimatedButton
                  variant="calm"
                  size="sm"
                  onClick={() => handleQuickAction('exercises', 'Exercises')}
                  leftIcon={<Activity className="w-4 h-4" />}
                  className="text-xs"
                >
                  Exercises
                </AnimatedButton>
                
                <AnimatedButton
                  variant="warm"
                  size="sm"
                  onClick={() => handleQuickAction('goals', 'Progress')}
                  leftIcon={<Activity className="w-4 h-4" />}
                  className="text-xs"
                >
                  Progress
                </AnimatedButton>
                
                <AnimatedButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickAction('profile', 'Profile')}
                  leftIcon={<Users className="w-4 h-4" />}
                  className="text-xs col-span-2"
                >
                  Manage Profile
                </AnimatedButton>
              </div>
            </GlassCardContent>
          </GlassmorphismCard>
        </motion.div>
      </div>

      {/* Daily Inspiration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassmorphismCard variant="warm" padding="lg">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-12 h-12 text-amber-500 mx-auto" />
            </motion.div>
            
            <div>
              <h3 className="text-2xl font-semibold text-amber-800 mb-2">
                Daily Relationship Insight
              </h3>
              <p className="text-amber-700 text-lg italic">
                "Every relationship needs three things: eyes that won't cry, lips that won't lie, and love that won't die."
              </p>
              <p className="text-amber-600 text-sm mt-2">
                Take a moment today to express gratitude for your partner 💛
              </p>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;