// AI HeartBridge - Masterpiece Mobile-First Dashboard
import React, { useState } from 'react';
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
  HeartHandshake
} from 'lucide-react';
import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';

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

  const quickActions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Chat with AI',
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
      title: 'Daily Check-in',
      description: 'Track your mood',
      color: 'from-emerald-500 to-teal-500',
      action: () => onNavigate('mood'),
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Exercises',
      description: 'Grow together',
      color: 'from-orange-500 to-amber-500',
      action: () => onNavigate('exercises'),
    },
  ];

  const stats = [
    { label: 'Check-ins', value: '12', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-600' },
    { label: 'Sessions', value: '8', icon: <MessageCircle className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'Exercises', value: '5', icon: <Award className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Days Active', value: '14', icon: <Calendar className="w-5 h-5" />, color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Mobile-First Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Welcome Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center sm:text-left"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back! 💝
          </h1>
          <p className="text-gray-600 text-lg">
            {user.name || user.email}
          </p>
        </motion.div>

        {/* Partner Connection Status */}
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
                    <div className="p-3 bg-white rounded-full shadow-lg flex-shrink-0">
                      <HeartHandshake className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900">Connected with Partner</h3>
                      <p className="text-gray-600 truncate">{partner.email}</p>
                    </div>
                    <Button
                      onClick={() => onNavigate('partner-chat')}
                      className="px-6 py-3 h-auto flex-shrink-0 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all"
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
                      <Users className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-lg">Connect with Your Partner</h3>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Pairing Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={user.pairingCode}
                            readOnly
                            className="flex-1 px-4 py-2 text-center text-2xl font-mono font-bold bg-gray-50 border-2 border-gray-200 rounded-lg"
                          />
                          <Button
                            onClick={() => navigator.clipboard.writeText(user.pairingCode)}
                            variant="outline"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center text-gray-500">OR</div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Partner's Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                            placeholder="ABC123"
                            className="flex-1 px-4 py-2 text-center text-lg font-mono font-bold border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200"
                          />
                          <Button 
                            disabled={pairingCode.length < 6}
                            onClick={() => {
                              // TODO: Implement partner pairing logic here
                              console.log('Connecting with code:', pairingCode);
                              // After success: setPairingCode('');
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-lift">
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-2 rounded-full bg-gray-50 mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid - Mobile First */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg`}>
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      {!action.disabled && (
                        <div className="flex items-center text-emerald-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      )}
                      {action.disabled && (
                        <div className="text-sm text-gray-400">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Completed daily check-in</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <span className="text-2xl">✨</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Chat session</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                </div>
                <span className="text-2xl">💙</span>
              </div>
              
              <Button variant="outline" className="w-full">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Bottom Spacing */}
        <div className="h-20 sm:h-0" />
      </div>
    </div>
  );
};

export default MasterDashboard;

