import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatSessionsView from './ChatSessionsView';
import PersistentChatView from './PersistentChatView';
import { ChatSession } from '../services/chatSessionService';

interface ChatManagerProps {
  onBack?: () => void;
}

const ChatManager: React.FC<ChatManagerProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'sessions' | 'chat'>('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentView('chat');
  };

  const handleNewSession = () => {
    setCurrentView('chat');
  };

  const handleBackToSessions = () => {
    setSelectedSessionId(null);
    setCurrentSession(null);
    setCurrentView('sessions');
  };

  const handleSessionUpdate = (session: ChatSession) => {
    setCurrentSession(session);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-therapy-safe/20 to-therapy-calm/10 p-4">
      <AnimatePresence mode="wait">
        {currentView === 'sessions' ? (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ChatSessionsView 
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PersistentChatView 
              sessionId={selectedSessionId}
              onBackToSessions={handleBackToSessions}
              onSessionUpdate={handleSessionUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatManager;