// AI HeartBridge - Stunning Mobile-First Chat Sessions List
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { GorgeousLoader } from './shared/GorgeousLoader';
import { 
  MessageCircle,
  Plus,
  Clock,
  Heart,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Edit3,
  Trash2,
  Archive,
  MoreVertical
} from 'lucide-react';
import { 
  getChatSessions, 
  createChatSession, 
  deleteChatSession,
  updateChatSessionTitle,
  formatTimeSince,
  getMoodEmoji,
  ChatSession 
} from '../services/chatSessionService';

interface MasterChatSessionsViewProps {
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const MasterChatSessionsView: React.FC<MasterChatSessionsViewProps> = ({ 
  onSessionSelect, 
  onNewSession 
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalSessions: 0, activeSessions: 0, closedSessions: 0 });

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getChatSessions({
        status: filter,
        limit: 50
      });
      
      setSessions(response.sessions);
      setStats(response.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const response = await createChatSession();
      setSessions(prev => [response.session, ...prev]);
      onSessionSelect(response.session.id);
      onNewSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this session? This cannot be undone.')) return;
    
    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      setError('Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  if (isLoading) {
    return (
      <GorgeousLoader 
        message="Loading your sessions..."
        type="default"
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Enhanced Header with Floating Elements - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 text-white px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16 overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -bottom-10 -left-10 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg"
              >
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                >
                  Chat Sessions
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/90 text-sm sm:text-lg font-medium"
                >
                  Your conversation history
                </motion.p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={handleNewSession}
                className="w-full sm:w-auto bg-white text-emerald-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold px-4 sm:px-6 py-3 text-sm sm:text-base"
                size="sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden xs:inline">New Session</span>
                <span className="xs:hidden">New</span>
              </Button>
            </motion.div>
          </div>

          {/* Enhanced Search - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-4 focus:ring-white/30 focus:bg-white transition-all duration-300 text-base sm:text-lg shadow-lg"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 pb-8 sm:pb-12">
        {/* Enhanced Stats Cards - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 pt-6 sm:pt-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                filter === 'all' 
                  ? 'bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 shadow-lg' 
                  : 'hover:shadow-lg hover:border-emerald-200'
              }`} 
              onClick={() => setFilter('all')}
            >
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <motion.div 
                  key={stats.totalSessions}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xl sm:text-3xl font-bold text-gray-800 mb-1"
                >
                  {stats.totalSessions}
                </motion.div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Total</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                filter === 'active' 
                  ? 'bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 shadow-lg' 
                  : 'hover:shadow-lg hover:border-emerald-200'
              }`} 
              onClick={() => setFilter('active')}
            >
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Check className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <motion.div 
                  key={stats.activeSessions}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xl sm:text-3xl font-bold text-emerald-600 mb-1"
                >
                  {stats.activeSessions}
                </motion.div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Active</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                filter === 'closed' 
                  ? 'bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 shadow-lg' 
                  : 'hover:shadow-lg hover:border-emerald-200'
              }`} 
              onClick={() => setFilter('closed')}
            >
              <CardContent className="p-3 sm:p-6 text-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Archive className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <motion.div 
                  key={stats.closedSessions}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-xl sm:text-3xl font-bold text-gray-500 mb-1"
                >
                  {stats.closedSessions}
                </motion.div>
                <div className="text-xs sm:text-sm font-medium text-gray-600">Closed</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Filter Pills - Mobile Responsive */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 no-scrollbar"
        >
          {(['all', 'active', 'closed'] as const).map((f, index) => (
            <motion.button
              key={f}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                filter === f
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white text-gray-600 hover:shadow-md hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Sessions List - Mobile Optimized */}
        <AnimatePresence mode="wait">
          {filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8 sm:py-16"
            >
              <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-200">
                <CardContent className="p-8 sm:p-16">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                  >
                    <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                  </motion.div>
                  
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl sm:text-2xl font-bold text-gray-800 mb-3"
                  >
                    No sessions yet
                  </motion.h3>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-4"
                  >
                    Start your first conversation with Bridge and begin your journey together! 💝
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      onClick={handleNewSession}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-xl hover:shadow-2xl transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Start First Session
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500"
                  >
                    ✨ Your conversations are private and secure
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key={filter + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 hover:border-emerald-200 bg-gradient-to-br from-white to-gray-50/50">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                                  {session.title}
                                </h3>
                                {session.mood && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl sm:text-2xl">{getMoodEmoji(session.mood)}</span>
                                    <span className="text-xs sm:text-sm text-gray-500 capitalize">{session.mood}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <MessageCircle className="w-3 h-3 text-blue-600" />
                                </div>
                                <span className="font-medium">{session.messageCount} messages</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Clock className="w-3 h-3 text-purple-600" />
                                </div>
                                <span className="font-medium">{formatTimeSince(new Date(session.lastMessageAt || session.createdAt))}</span>
                              </div>
                            </div>

                            {session.lastMessage && (
                              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 mt-3">
                                <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 italic">
                                  "{session.lastMessage}"
                                </p>
                              </div>
                            )}

                            {session.themes && Array.isArray(session.themes) && session.themes.length > 0 && (
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
                                {session.themes.slice(0, 3).map((theme, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 sm:px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full"
                                  >
                                    {theme}
                                  </span>
                                ))}
                                {session.themes.length > 3 && (
                                  <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                    +{session.themes.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                            {session.status === 'active' ? (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full border border-emerald-200"
                              >
                                ✨ Active
                              </motion.span>
                            ) : (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 sm:px-3 py-1 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-full border border-gray-300"
                              >
                                📁 Closed
                              </motion.span>
                            )}
                            
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDelete(session.id, e)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MasterChatSessionsView;

