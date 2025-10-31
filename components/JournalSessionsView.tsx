import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualLoader from './shared/ContextualLoader';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { JournalSession, JournalSessionStatus, getJournalSessions, deleteJournalSession } from '../services/journalSessionService';
import { Calendar, Trash2, Eye, Archive, Heart, Clock, Brain, CheckCircle, Play, AlertCircle } from 'lucide-react';
import Icon from './shared/Icon';

interface JournalSessionsViewProps {
  sessions?: JournalSession[];
  onSelectSession?: (sessionId: string) => void;
  onNewSession?: () => void;
  onContinueSession?: (sessionId: string) => void;
  onBack?: () => void;
}

const JournalSessionsView: React.FC<JournalSessionsViewProps> = ({ 
  sessions: propSessions,
  onSelectSession, 
  onNewSession,
  onContinueSession,
  onBack
}) => {
  const [sessions, setSessions] = useState<JournalSession[]>(propSessions || []);
  const [isLoading, setIsLoading] = useState(!propSessions);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'insights_ready' | 'waiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!propSessions) {
      loadSessions();
    }
  }, [filter, propSessions]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      // Map component filter to API filter
      const apiFilter: 'all' | 'active' | 'completed' = 
        filter === 'insights_ready' || filter === 'waiting' ? 'all' :
        filter === 'active' ? 'active' :
        filter === 'completed' ? 'completed' :
        'all';
        
      const response = await getJournalSessions({ 
        status: apiFilter,
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

  const getStatusInfo = (session: JournalSession) => {
    switch (session.status) {
      case JournalSessionStatus.CREATED:
        return { 
          text: 'Ready to begin', 
          color: 'blue', 
          icon: Play,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        };
      case JournalSessionStatus.PARTNER1_COMPLETE:
      case JournalSessionStatus.PARTNER2_COMPLETE:
        return { 
          text: 'Waiting for partner', 
          color: 'yellow', 
          icon: Clock,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
      case JournalSessionStatus.ANALYSIS_PENDING:
        return { 
          text: 'Analyzing...', 
          color: 'purple', 
          icon: Brain,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700'
        };
      case JournalSessionStatus.INSIGHTS_READY:
        return { 
          text: 'Insights ready', 
          color: 'green', 
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case JournalSessionStatus.CLOSED:
        return { 
          text: 'Completed', 
          color: 'gray', 
          icon: Archive,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        };
      default:
        return { 
          text: 'Unknown', 
          color: 'gray', 
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700'
        };
    }
  };

  const filteredSessions = (sessions || []).filter(session => {
    const matchesSearch = session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'active':
        return session.status === JournalSessionStatus.CREATED || 
               session.status === JournalSessionStatus.PARTNER1_COMPLETE ||
               session.status === JournalSessionStatus.PARTNER2_COMPLETE;
      case 'completed':
        return session.status === JournalSessionStatus.CLOSED;
      case 'insights_ready':
        return session.status === JournalSessionStatus.INSIGHTS_READY;
      case 'waiting':
        return session.status === JournalSessionStatus.PARTNER1_COMPLETE ||
               session.status === JournalSessionStatus.PARTNER2_COMPLETE ||
               session.status === JournalSessionStatus.ANALYSIS_PENDING;
      default:
        return true;
    }
  });

  if (isLoading) {
    return <ContextualLoader type="journal" message="Loading your journal sessions..." />;
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="hover:bg-white/50 flex-shrink-0 min-h-[44px] min-w-[44px] p-2"
                >
                  <Icon name="arrow-left" className="w-5 h-5" />
                </Button>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-tight">
                  📔 Journal History
                </h1>
                <p className="text-gray-600 text-sm sm:text-base mt-1">View and revisit your relationship reflections</p>
              </div>
            </div>
            <Button
              onClick={onNewSession}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white w-full sm:w-auto text-sm sm:text-base py-3 px-6 min-h-[48px] font-medium shadow-md hover:shadow-lg transition-shadow"
            >
              <Heart className="w-4 h-4 mr-2 flex-shrink-0" />
              New Entry
            </Button>
          </div>

          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-emerald-600 mb-1">
                  {(sessions || []).filter(s => s?.status === JournalSessionStatus.CREATED || 
                                       s?.status === JournalSessionStatus.PARTNER1_COMPLETE ||
                                       s?.status === JournalSessionStatus.PARTNER2_COMPLETE).length}
                </div>
                <div className="text-xs text-gray-600">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1">
                  {(sessions || []).filter(s => s?.status === JournalSessionStatus.INSIGHTS_READY).length}
                </div>
                <div className="text-xs text-gray-600">Insights Ready</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-cyan-600 mb-1">
                  {(sessions || []).filter(s => s?.status === JournalSessionStatus.CLOSED).length}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-3xl font-bold text-orange-600 mb-1">
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
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'waiting', 'insights_ready', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-full font-medium transition-all text-sm min-h-[44px] min-w-[60px] ${
                  filter === f
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {f === 'insights_ready' ? 'Insights' : 
                 f === 'waiting' ? 'Waiting' :
                 f.charAt(0).toUpperCase() + f.slice(1)}
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
                    className={`cursor-pointer hover:shadow-lg transition-all border-l-4 ${
                      getStatusInfo(session).borderColor
                    }`}
                    onClick={() => onSelectSession?.(session.id)}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                              {session.title || `Session on ${new Date(session.createdAt).toLocaleDateString()}`}
                            </h3>
                            <div className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium items-center gap-2 ${getStatusInfo(session).bgColor} ${getStatusInfo(session).textColor}`}>
                              {React.createElement(getStatusInfo(session).icon, { className: "w-4 h-4" })}
                              <span>{getStatusInfo(session).text}</span>
                            </div>
                          </div>
                        </div>
                        
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

                        <div className="flex gap-2 justify-end">
                          {/* Continue button for active sessions */}
                          {(session.status === JournalSessionStatus.CREATED || 
                            session.status === JournalSessionStatus.PARTNER1_COMPLETE ||
                            session.status === JournalSessionStatus.PARTNER2_COMPLETE) && onContinueSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onContinueSession(session.id);
                              }}
                              className="min-h-[44px] min-w-[44px] p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-sm hover:shadow-md flex items-center justify-center"
                              title="Continue session"
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          )}
                          
                          {/* View button for completed sessions */}
                          {(session.status === JournalSessionStatus.INSIGHTS_READY || 
                            session.status === JournalSessionStatus.CLOSED) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSession?.(session.id);
                              }}
                              className="min-h-[44px] min-w-[44px] p-2.5 hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-300 rounded-xl transition-colors flex items-center justify-center"
                              title="View session"
                            >
                              <Eye className="w-5 h-5 text-emerald-600" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            className="min-h-[44px] min-w-[44px] p-2.5 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 rounded-xl transition-colors flex items-center justify-center"
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
