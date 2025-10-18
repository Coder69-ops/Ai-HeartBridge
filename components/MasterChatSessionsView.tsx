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
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Chat Sessions</h1>
                <p className="text-white/80 text-sm">Your conversation history</p>
              </div>
            </div>
            
            <Button
              onClick={handleNewSession}
              className="bg-white text-emerald-600 hover:bg-gray-50 shadow-lg"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('all')}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-800">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('active')}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">{stats.activeSessions}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('closed')}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-400">{stats.closedSessions}</div>
              <div className="text-sm text-gray-600">Closed</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:shadow-md'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        <AnimatePresence mode="wait">
          {filteredSessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Card>
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No sessions yet</h3>
                  <p className="text-gray-600 mb-6">Start a new conversation with Bridge!</p>
                  <Button
                    onClick={handleNewSession}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start First Session
                  </Button>
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
                  <Card className="hover:shadow-xl transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                              {session.title}
                            </h3>
                            {session.mood && (
                              <span className="text-xl">{getMoodEmoji(session.mood)}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{session.messageCount} messages</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeSince(new Date(session.lastMessageAt || session.createdAt))}</span>
                            </div>
                          </div>

                          {session.lastMessage && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {session.lastMessage}
                            </p>
                          )}
                        </div>

                        <div className="flex items-start gap-2">
                          {session.status === 'active' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              Closed
                            </span>
                          )}
                          
                          <button
                            onClick={(e) => handleDelete(session.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MasterChatSessionsView;

