import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './shared/Card';
import { Button } from './shared/Button';
import { Input } from './shared/Input';
import { MessageCircle, Send, Bot, User, Heart, Sparkles, Clock, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatbotResponse } from '../services/geminiService';
import { Message } from '../types';

interface SimpleChatViewProps {
  partnerName?: string;
  onComplete?: (messages: Message[]) => void;
  isReturningUser?: boolean;
  initialMessages?: Message[];
  isCompleting?: boolean;
}

export default function SimpleChatView({
  partnerName = "Bridge",
  onComplete, 
  isReturningUser = false,
  initialMessages = [],
  isCompleting = false
}: SimpleChatViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Calculate total words
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setTotalWords(0);
      return;
    }
    
    const total = messages.reduce((sum, msg) => {
      const words = msg.text.split(' ').filter(word => word.length > 0);
      return sum + words.length;
    }, 0);
    setTotalWords(total);
  }, [messages]);

  // Initialize with greeting if no messages
  useEffect(() => {
    if ((!messages || messages.length === 0) && !isReturningUser) {
      const greeting = `Hi there! I'm ${partnerName}, your AI relationship counselor. I'm here to listen and help you explore your thoughts and feelings. What's on your mind today? 💙`;
      setMessages([{ sender: 'bot', text: greeting }]);
    }
  }, [partnerName, isReturningUser, messages]);

  const handleSendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isBotTyping || isCompleting || isChatComplete) return;

    // Create user message
    const userMessage: Message = { 
      sender: 'user', 
      text: trimmed,
      timestamp: new Date()
    };

    // Add user message to state immediately
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsBotTyping(true);

    try {
      // Get bot response
      const response = await getChatbotResponse([...messages, userMessage]);
      
      // Create bot message
      const botMessage: Message = { 
        sender: 'bot', 
        text: response,
        timestamp: new Date()
      };

      // Check if conversation is complete before adding bot message
      if (response.includes('[CONVERSATION_COMPLETE]')) {
        console.log('SimpleChatView - AI completed conversation, automatically completing session');
        // Remove the [CONVERSATION_COMPLETE] marker from the response
        const cleanResponse = response.replace('[CONVERSATION_COMPLETE]', '').trim();
        
        // Create clean bot message
        const cleanBotMessage: Message = { 
          sender: 'bot', 
          text: cleanResponse,
          timestamp: new Date()
        };
        
        // Add the clean bot message to state
        setMessages(prev => [...prev, cleanBotMessage]);
        
        // Automatically complete the session
        if (onComplete) {
          onComplete([...messages, userMessage, cleanBotMessage]);
        }
        setIsChatComplete(true);
        setUserInput(''); // Clear input field
        return; // Exit early to prevent further processing
      }

      // Add bot message to state (only if not completed)
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = { 
        sender: 'bot', 
        text: "I'm having trouble connecting right now 💙 Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setIsChatComplete(false);
    setMessages([]);
    setUserInput('');
    inputRef.current?.focus();
  };

  // Show completion screen
  if (isChatComplete) {
    console.log('SimpleChatView - Rendering completion screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
              >
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
              
              <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3 sm:mb-4"
            >
                ✨ Reflection Complete
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2"
              >
                Thank you for sharing your thoughts with me. Your reflection has been automatically saved and will be part of your relationship journey.
              </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
                className="space-y-4"
            >
              <Button 
                  onClick={startNewChat}
                variant="therapy" 
                size="lg"
                  className="w-full sm:w-auto px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start New Chat
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Chat Header - Mobile Optimized */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
          <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 truncate">{partnerName}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Your AI Relationship Counselor</p>
                  </div>
            </div>
                <div className="text-right hidden sm:block flex-shrink-0">
                  <div className="text-sm font-medium text-gray-700">{totalWords} words</div>
                  <div className="text-xs text-gray-500">{messages.length} messages</div>
            </div>
          </div>
          {/* Mobile Stats */}
          <div className="sm:hidden mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{totalWords} words</span>
            <span>{messages.length} messages</span>
          </div>
        </div>

            {/* Messages Container */}
            <div className="h-[400px] sm:h-[500px] lg:h-[600px] overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                    key={`${msg.sender}-${idx}-${msg.timestamp ? (msg.timestamp instanceof Date ? msg.timestamp.getTime() : new Date(msg.timestamp).getTime()) : Date.now()}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
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
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        )}
                      </div>

                      {/* Message Bubble - Mobile Optimized */}
                      <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm group relative ${
                    msg.sender === 'user'
                          ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text.replace('[CONVERSATION_COMPLETE]', '')}
                  </p>
                        {msg.timestamp && (
                          <div className={`text-xs mt-1 sm:mt-2 ${
                            msg.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isBotTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">Bridge is typing...</span>
                </div>
              </div>
            </motion.div>
          )}

              <div ref={messagesEndRef} />
        </div>

            {/* Input Area - Mobile Optimized */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-gray-200 bg-white">
              <div className="flex gap-2 sm:gap-3">
                <Input
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                  placeholder={isChatComplete ? "Conversation completed" : isCompleting ? "Completing reflection..." : isBotTyping ? "Bridge is typing..." : "Share what's on your mind... 💭"}
                  disabled={isBotTyping || isCompleting || isChatComplete}
                  className="flex-1 text-sm sm:text-base lg:text-lg py-2 sm:py-3 px-3 sm:px-4 border-2 border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 rounded-xl transition-all duration-200 min-h-[44px]"
              />
              <Button
                  onClick={handleSendMessage}
                  disabled={isBotTyping || !userInput.trim() || isCompleting || isChatComplete}
                variant="therapy"
                size="lg"
                  className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

        </div>
      </CardContent>
    </Card>
      </div>
    </div>
  );
}