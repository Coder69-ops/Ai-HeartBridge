import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import Icon from './shared/Icon';
import ContextualLoader from './shared/ContextualLoader';
import { 
  getChatSessions, 
  createChatSession, 
  deleteChatSession,
  updateChatSessionTitle,
  closeChatSession,
  reopenChatSession,
  formatTimeSince,
  getMoodEmoji,
  ChatSession 
} from '../services/chatSessionService';
import { useAuthStore } from '../store/authStore';

interface ChatSessionsViewProps {
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

const ChatSessionsView: React.FC<ChatSessionsViewProps> = ({ onSessionSelect, onNewSession }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [stats, setStats] = useState({ totalSessions: 0, activeSessions: 0, closedSessions: 0 });
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { user } = useAuthStore();

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
      setError(err instanceof Error ? err.message : 'Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const response = await createChatSession();
      setSessions(prev => [response.session, ...prev]);
      setStats(prev => ({ ...prev, totalSessions: prev.totalSessions + 1, activeSessions: prev.activeSessions + 1 }));
      onSessionSelect(response.session.id);
      onNewSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new session');
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setStats(prev => ({ 
        ...prev, 
        totalSessions: prev.totalSessions - 1,
        activeSessions: prev.activeSessions - (sessions.find(s => s.id === sessionId)?.isActive ? 1 : 0),
        closedSessions: prev.closedSessions - (sessions.find(s => s.id === sessionId)?.isClosed ? 1 : 0)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const handleToggleSession = async (sessionId: string, isClosed: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isClosed) {
        await reopenChatSession(sessionId);
      } else {
        await closeChatSession(sessionId);
      }
      
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, isClosed: !isClosed, isActive: isClosed }
          : session
      ));
      
      setStats(prev => ({
        ...prev,
        activeSessions: isClosed ? prev.activeSessions + 1 : prev.activeSessions - 1,
        closedSessions: isClosed ? prev.closedSessions - 1 : prev.closedSessions + 1
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle session');
    }
  };

  const handleUpdateTitle = async (sessionId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await updateChatSessionTitle(sessionId, newTitle.trim());
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle.trim() }
          : session
      ));
      setEditingTitle(null);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update title');
    }
  };

  const startEditingTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitle(sessionId);
    setNewTitle(currentTitle);
  };

  const cancelEditing = () => {
    setEditingTitle(null);
    setNewTitle('');
  };

  if (isLoading) {
    return <ContextualLoader type="chat" message="Loading your chat sessions..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="therapy" className="animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-therapy-calm">
            <Icon name="message-circle" className="w-6 h-6" />
            Your Private Chat Sessions
          </CardTitle>
          <p className="text-neutral-600 text-sm">
            All your conversations with Bridge are saved here. You can continue any chat anytime.
          </p>
        </CardHeader>
      </Card>

      {/* Stats */}
      <motion.div 
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="calm" className="text-center">
          <CardContent className="py-6">
            <div className="text-2xl font-bold text-therapy-calm">{stats.totalSessions}</div>
            <div className="text-sm text-neutral-600">Total Sessions</div>
          </CardContent>
        </Card>
        <Card variant="safe" className="text-center">
          <CardContent className="py-6">
            <div className="text-2xl font-bold text-therapy-growth">{stats.activeSessions}</div>
            <div className="text-sm text-neutral-600">Active</div>
          </CardContent>
        </Card>
        <Card variant="warmth" className="text-center">
          <CardContent className="py-6">
            <div className="text-2xl font-bold text-therapy-warmth">{stats.closedSessions}</div>
            <div className="text-sm text-neutral-600">Completed</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2">
          {(['all', 'active', 'closed'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'therapy' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={`capitalize transition-all duration-200 ${
                filter === filterType 
                  ? 'shadow-md' 
                  : 'hover:shadow-sm hover:border-therapy-calm/50'
              }`}
            >
              {filterType}
            </Button>
          ))}
        </div>
        
        <Button 
          onClick={handleNewSession}
          variant="therapy"
          size="lg"
          className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Icon name="plus" className="w-5 h-5" />
          New Chat Session
        </Button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-error/10 border border-error/20 rounded-lg"
        >
          <p className="text-error text-sm flex items-center gap-2">
            <Icon name="alert-circle" className="w-4 h-4" />
            {error}
          </p>
        </motion.div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Icon name="message-circle" className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">No chat sessions yet</h3>
              <p className="text-neutral-400 mb-6">Start your first conversation with Bridge</p>
              <Button onClick={handleNewSession} variant="therapy">
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </motion.div>
          ) : (
            sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card 
                  variant={session.isClosed ? 'calm' : 'safe'}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    session.isClosed ? 'opacity-75' : ''
                  }`}
                  onClick={() => onSessionSelect(session.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{getMoodEmoji(session.mood)}</span>
                          {editingTitle === session.id ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-therapy-calm"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleUpdateTitle(session.id);
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                              />
                              <Button size="xs" variant="therapy" onClick={() => handleUpdateTitle(session.id)}>
                                <Icon name="check" className="w-3 h-3" />
                              </Button>
                              <Button size="xs" variant="outline" onClick={cancelEditing}>
                                <Icon name="x" className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <h3 
                              className="font-medium text-neutral-800 truncate flex-1"
                              title={session.title}
                            >
                              {session.title}
                            </h3>
                          )}
                          {session.isClosed && (
                            <span className="px-2 py-1 text-xs bg-neutral-200 text-neutral-600 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Icon name="message-circle" className="w-3 h-3" />
                            {session.messageCount} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="type" className="w-3 h-3" />
                            {session.wordCount} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="clock" className="w-3 h-3" />
                            {formatTimeSince(session.lastMessageAt)}
                          </span>
                        </div>
                        
                        {session.topics && Array.isArray(session.topics) && session.topics.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {session.topics.slice(0, 3).map((topic) => (
                              <span 
                                key={topic}
                                className="px-2 py-1 text-xs bg-therapy-calm/10 text-therapy-calm rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4 opacity-60 hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => startEditingTitle(session.id, session.title, e)}
                          title="Edit title"
                          className="h-8 w-8 p-0 hover:bg-therapy-calm/10 hover:text-therapy-calm border border-transparent hover:border-therapy-calm/20"
                        >
                          <Icon name="edit-2" className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleToggleSession(session.id, session.isClosed, e)}
                          title={session.isClosed ? 'Reopen session' : 'Close session'}
                          className="h-8 w-8 p-0 hover:bg-therapy-growth/10 hover:text-therapy-growth border border-transparent hover:border-therapy-growth/20"
                        >
                          <Icon name={session.isClosed ? 'play' : 'pause'} className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          title="Delete session"
                          className="h-8 w-8 p-0 text-neutral-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200"
                        >
                          <Icon name="trash-2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatSessionsView;