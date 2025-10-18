import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import Icon from './shared/Icon';
import { Loader } from './shared/Loader';
import { 
  getChatSession, 
  sendMessage, 
  closeChatSession,
  ChatSession,
  ChatMessage,
  formatTimeSince,
  getMoodEmoji 
} from '../services/chatSessionService';

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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const words = userInput.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [userInput]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isBotTyping]);

  const loadSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getChatSession(sessionId);
      setSession(response.session);
      
      // Focus input after loading
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
      
      // Add the bot message to the current session (user message is already displayed optimistically)
      if (session) {
        const updatedSession = {
          ...session,
          messages: [...(session.messages || []), response.botMessage],
          isActive: response.session.isActive,
          isClosed: response.session.isClosed,
          messageCount: response.session.messageCount,
          wordCount: response.session.wordCount,
          lastMessageAt: response.session.lastMessageAt
        };
        
        setSession(updatedSession);
        onSessionUpdate?.(updatedSession);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      
      // Remove optimistic user message on error
      if (session) {
        const originalSession = {
          ...session,
          messages: (session.messages || []).slice(0, -1)
        };
        setSession(originalSession);
      }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (!sessionId || !session) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Icon name="message-circle" className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-500 mb-2">No chat session selected</h3>
        <p className="text-neutral-400 mb-6">Select a session from your chat history or start a new one</p>
        <Button onClick={onBackToSessions} variant="therapy">
          <Icon name="arrow-left" className="w-4 h-4 mr-2" />
          Back to Chat Sessions
        </Button>
      </div>
    );
  }

  const messages = session.messages || [];
  const userMessages = messages.filter(m => m.sender === 'user');
  const totalWordCount = userMessages.reduce((total, msg) => {
    const words = msg.text.trim().split(/\s+/).filter(word => word.length > 0);
    return total + words.length;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Chat Header */}
      <Card variant="therapy" className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBackToSessions}
              className="flex items-center gap-2 text-neutral-600 hover:text-therapy-calm"
            >
              <Icon name="arrow-left" className="w-4 h-4" />
              Back to Sessions
            </Button>
            
            <div className="flex items-center gap-3">
              {session.isClosed ? (
                <span className="px-3 py-1 text-sm bg-neutral-200 text-neutral-600 rounded-full">
                  Completed Session
                </span>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCloseSession}
                  className="flex items-center gap-2"
                >
                  <Icon name="check" className="w-4 h-4" />
                  Complete Session
                </Button>
              )}
            </div>
          </div>
          
          <div className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-therapy-calm">
              <span className="text-xl">{getMoodEmoji(session.mood)}</span>
              {session.title}
            </CardTitle>
            <p className="text-neutral-600 text-sm mt-2">
              {session.isClosed ? 'Session completed' : 'Private conversation with Bridge'} • 
              Started {formatTimeSince(session.createdAt)}
            </p>
            
            {/* Session Stats */}
            <div className="flex justify-center items-center gap-6 mt-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Icon name="message-circle" className="w-4 h-4" />
                <span>{messages.filter(m => m.sender === 'user').length} messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="type" className="w-4 h-4" />
                <span>{totalWordCount} words shared</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="clock" className="w-4 h-4" />
                <span>{formatTimeSince(session.lastMessageAt)}</span>
              </div>
            </div>
            
            {session.topics.length > 0 && (
              <div className="flex justify-center flex-wrap gap-2 mt-3">
                {session.topics.map((topic) => (
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
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card variant="calm" className="flex flex-col h-[70vh] animate-scale-in">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-therapy-safe to-neutral-50/50 native-scroll">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-therapy-calm to-therapy-growth flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-sm font-medium">B</span>
                  </div>
                )}
                <div className={`max-w-sm md:max-w-md p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-therapy-calm text-white rounded-br-sm' 
                    : 'bg-white text-neutral-800 rounded-bl-sm border border-neutral-200'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div className={`text-xs mt-2 ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-neutral-500'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-therapy-warmth flex items-center justify-center flex-shrink-0 shadow-md">
                    <Icon name="user" className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isBotTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-3 justify-start"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-therapy-calm to-therapy-growth flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white text-sm font-medium">B</span>
              </div>
              <div className="max-w-sm md:max-w-md p-4 rounded-2xl bg-white text-neutral-800 rounded-bl-sm border border-neutral-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-therapy-calm rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-therapy-calm rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-therapy-calm rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-neutral-500 ml-2">Bridge is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="p-6 border-t border-neutral-200 bg-white">
          {session.isClosed ? (
            <div className="text-center py-4">
              <p className="text-neutral-500 text-sm mb-4">
                This session has been completed. You can view the conversation history but cannot send new messages.
              </p>
              <Button onClick={onBackToSessions} variant="therapy">
                <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                Back to Sessions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Word count indicator */}
              {userInput.trim() && (
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>{wordCount} words</span>
                  <span className="text-therapy-calm">Keep sharing - every word matters 💙</span>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={isBotTyping ? "Bridge is typing..." : "Continue your conversation... 💭"}
                    disabled={isBotTyping}
                    variant="therapy"
                    className="rounded-2xl resize-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isBotTyping || !userInput.trim()} 
                  variant="therapy"
                  size="lg"
                  className="rounded-2xl px-6 therapy-button"
                >
                  <Icon name="send" className="w-5 h-5" />
                </Button>
              </form>
            </div>
          )}
          
          {error && (
            <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error text-center flex items-center justify-center gap-2">
                <Icon name="alert-circle" className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PersistentChatView;