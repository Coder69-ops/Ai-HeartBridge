import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GorgeousLoader } from './shared/GorgeousLoader';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { JournalSession, getJournalSessions, deleteJournalSession } from '../services/journalSessionService';
import { Calendar, Trash2, Eye, Archive, Heart } from 'lucide-react';

interface JournalSessionsViewProps {
  onSelectSession?: (sessionId: string) => void;
  onNewSession?: () => void;
}

const JournalSessionsView: React.FC<JournalSessionsViewProps> = ({ 
  onSelectSession, 
  onNewSession 
}) => {
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await getJournalSessions({ 
        status: filter,
        limit: 50 
      });
      setSessions(response.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this journal session?')) {
      try {
        await deleteJournalSession(sessionId);
        setSessions(sessions.filter(s => s.id !== sessionId));
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <GorgeousLoader 
        message="Loading your journal sessions..." 
        type="therapy"
        size="lg"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                📔 Journal History
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">View and revisit your relationship reflections</p>
            </div>
            <Button
              onClick={onNewSession}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white w-full sm:w-auto text-sm sm:text-base py-2 sm:py-2.5"
            >
              <Heart className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-emerald-600 mb-1">
                  {sessions.filter(s => !s.isClosed).length}
                </div>
                <div className="text-xs text-gray-600">Active Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-cyan-600 mb-1">
                  {sessions.filter(s => s.isClosed).length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {sessions.reduce((sum, s) => sum + s.wordCount, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Words</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 space-y-3 sm:space-y-4"
        >
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all text-xs sm:text-sm ${
                  filter === f
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journal entries..."
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 text-sm sm:text-base"
          />
        </motion.div>

        {/* Sessions List - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence>
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer hover:shadow-lg transition-all ${
                      session.isClosed ? 'border-l-4 border-l-cyan-500' : 'border-l-4 border-l-emerald-500'
                    }`}
                    onClick={() => onSelectSession?.(session.id)}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0 w-full sm:w-auto">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                            {session.title || `Session on ${new Date(session.createdAt).toLocaleDateString()}`}
                          </h3>
                          
                          <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                            {session.summary || 'Relationship reflection session'}
                          </p>

                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs">{new Date(session.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-xs">💬 {session.messageCount} messages</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-xs">📝 {session.wordCount} words</span>
                            </div>
                            {session.mood && (
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-xs">😊 {session.mood}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSession?.(session.id);
                            }}
                            className="p-1.5 sm:p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View session"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📔</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No journal sessions yet</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Start your first couple's journal session today</p>
                <Button
                  onClick={onNewSession}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm sm:text-base py-2 sm:py-2.5 px-4 sm:px-6"
                >
                  Start Journaling
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JournalSessionsView;
