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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                📔 Journal History
              </h1>
              <p className="text-gray-600">View and revisit your relationship reflections</p>
            </div>
            <Button
              onClick={onNewSession}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {sessions.filter(s => !s.isClosed).length}
                </div>
                <div className="text-xs text-gray-600">Active Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cyan-600 mb-1">
                  {sessions.filter(s => s.isClosed).length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {sessions.reduce((sum, s) => sum + s.wordCount, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Words</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
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
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          />
        </motion.div>

        {/* Sessions List */}
        <div className="space-y-4">
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
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {session.title || `Session on ${new Date(session.createdAt).toLocaleDateString()}`}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {session.summary || 'Relationship reflection session'}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              💬 {session.messageCount} messages
                            </div>
                            <div className="flex items-center gap-2">
                              📝 {session.wordCount} words
                            </div>
                            {session.mood && (
                              <div className="flex items-center gap-2">
                                😊 {session.mood}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSession?.(session.id);
                            }}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View session"
                          >
                            <Eye className="w-5 h-5 text-emerald-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete session"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
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
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">📔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No journal sessions yet</h3>
                <p className="text-gray-600 mb-6">Start your first couple's journal session today</p>
                <Button
                  onClick={onNewSession}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
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
