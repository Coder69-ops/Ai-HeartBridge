import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { 
  getChatSession, 
  sendMessage, 
  closeChatSession,
  ChatSession,
  ChatMessage,
  formatTimeSince,
  getMoodEmoji 
} from '../services/chatSessionService';
import { 
  Bot, 
  User, 
  Send, 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  Heart, 
  Sparkles,
  X,
  MoreVertical,
  Copy,
  Trash2
} from 'lucide-react';

interface PersistentChatViewProps {
  sessionId: string | null;
  onBackToSessions: () => void;
  onSessionUpdate?: (session: ChatSession) => void;
}

const PersistentChatView: React.FC<PersistentChatViewProps> = ({ 
  sessionId, 
  onBackToSessions, 
  onSessionUpdate 
}) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [showMenu, setShowMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Load session on mount
  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Calculate word count from user input
  useEffect(() => {
    const words = userInput.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userInput]);

  // Calculate total words from session
  const totalWords = session?.wordCount || 0;
  const messageCount = session?.messages?.length || 0;

  const loadSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await getChatSession(sessionId);
      setSession(response.session);
      onSessionUpdate?.(response.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isBotTyping || !sessionId || session?.isClosed) return;

    const messageText = userInput.trim();
    setUserInput('');
    setIsBotTyping(true);
    setError(null);

    // Immediately show user's message optimistically
    const userMessage: ChatMessage = {
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    if (session) {
      const optimisticSession = {
        ...session,
        messages: [...(session.messages || []), userMessage]
      };
      setSession(optimisticSession);
    }

    try {
      const response = await sendMessage(sessionId, messageText);
      
      // Add the bot message using functional update to preserve user message
      setSession(prevSession => {
        if (!prevSession) return prevSession;
        
        const updatedSession = {
          ...prevSession,
          messages: [...(prevSession.messages || []), response.botMessage],
          isActive: response.session.isActive,
          isClosed: response.session.isClosed,
          messageCount: response.session.messageCount,
          wordCount: response.session.wordCount,
          lastMessageAt: response.session.lastMessageAt
        };
        
        onSessionUpdate?.(updatedSession);
        return updatedSession;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      
      // Remove optimistic user message on error
      setSession(prevSession => {
        if (!prevSession) return prevSession;
        
        const originalSession = {
          ...prevSession,
          messages: (prevSession.messages || []).slice(0, -1)
        };
        return originalSession;
      });
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleCloseSession = async () => {
    if (!sessionId || !session) return;
    
    try {
      const response = await closeChatSession(sessionId);
      setSession(prev => prev ? { ...prev, isClosed: true, isActive: false } : null);
      onSessionUpdate?.(response.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-gray-600">Loading your conversation...</p>
        </div>
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Found</h2>
          <p className="text-gray-600 mb-6">This chat session could not be loaded.</p>
          <Button
            onClick={onBackToSessions}
            variant="therapy"
            size="lg"
            className="px-8 py-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Sessions
        </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-screen flex flex-col">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Chat Header - Mobile Optimized */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-cyan-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Button
                    onClick={onBackToSessions}
                    variant="outline"
                    size="sm"
                    className="p-2 flex-shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">AI HeartBridge</h2>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {session.isClosed ? 'Session Closed' : 'Your AI Relationship Counselor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-700">{totalWords} words</div>
                    <div className="text-xs text-gray-500">{messageCount} messages</div>
                  </div>
                  <div className="relative">
                    <Button
                      onClick={() => setShowMenu(!showMenu)}
                      variant="outline"
                      size="sm"
                      className="p-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={handleCloseSession}
                          className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                        >
                          <X className="w-4 h-4" />
                          Close Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Mobile Stats */}
              <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{totalWords} words</span>
                <span>{messageCount} messages</span>
              </div>
            </div>
            
            {/* Messages Container - Mobile Optimized */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-white to-gray-50">
              <AnimatePresence>
                {session.messages?.map((msg, idx) => (
                  <motion.div
                    key={`${msg.sender}-${idx}-${msg.text.slice(0, 20)}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar - Mobile Optimized */}
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-orange-400 to-pink-500' 
                          : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                      }`}>
                        {msg.sender === 'user' ? (
                          <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                        ) : (
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                        )}
                      </div>

                      {/* Message Bubble - Mobile Optimized */}
                      <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm group relative ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        {msg.timestamp && (
                          <div className={`text-xs mt-1 sm:mt-2 ${
                            msg.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        
                        {/* Message Actions - Desktop Only */}
                        <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block ${
                          msg.sender === 'user' ? 'hidden' : ''
                        }`}>
                          <button
                            onClick={() => copyMessage(msg.text)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
          
              {/* Typing Indicator - Mobile Optimized */}
              {isBotTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 ml-2">Bridge is typing...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
                >
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
            </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area - Mobile Optimized */}
            {!session.isClosed ? (
              <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
                  <Input
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isBotTyping ? "Bridge is typing..." : "Share what's on your mind... 💭"}
                    disabled={isBotTyping}
                    className="flex-1 text-sm sm:text-base lg:text-lg py-2 sm:py-3 px-3 sm:px-4 border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl transition-all duration-200 min-h-[44px]"
                  />
                  <Button
                    type="submit"
                    disabled={isBotTyping || !userInput.trim()}
                    variant="therapy"
                    size="lg"
                    className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </form>
                
                {/* Word Count - Mobile Optimized */}
                {wordCount > 0 && (
                  <div className="mt-1 sm:mt-2 text-xs text-gray-500 text-right">
                    {wordCount} words
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Session Closed</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">This conversation has been closed.</p>
                  <Button
                    onClick={onBackToSessions}
                    variant="outline"
                    size="lg"
                    className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Back to Sessions
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default PersistentChatView;