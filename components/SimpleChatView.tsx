// Simple, focused chat for AI HeartBridge therapy sessions
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { Button } from './shared/Button';
import { Card, CardContent } from './shared/Card';

interface SimpleChatViewProps {
  partnerName?: string;
  onComplete?: (chatHistory: Message[]) => void;
  isReturningUser?: boolean;
  initialMessages?: Message[] | null;
  isCompleting?: boolean;
}

const SimpleChatView: React.FC<SimpleChatViewProps> = ({ 
  partnerName, 
  onComplete, 
  isReturningUser = false,
  initialMessages,
  isCompleting = false
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isChatComplete, setIsChatComplete] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting from Bridge (only if no existing messages)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Calculate word count from existing messages
      const existingWords = initialMessages
        .filter(msg => msg.sender === 'user')
        .reduce((total, msg) => total + msg.text.split(' ').length, 0);
      setTotalWords(existingWords);
      setWordCount(existingWords);
      return;
    }

    const greeting = isReturningUser
      ? "Welcome back 🤗 I'm here to listen whenever you're ready to share what's on your heart 💙"
      : "Hello there 🌸 I'm Bridge, your private counselor. I'm here to help you reflect. What's weighing on your mind today? 💭";
    
    setMessages([{ sender: 'bot', text: greeting }]);
  }, [isReturningUser, initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update word counts
  useEffect(() => {
    const words = userInput.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [userInput]);

  useEffect(() => {
    const userMessages = messages.filter(m => m.sender === 'user');
    const total = userMessages.reduce((sum, msg) => {
      const words = msg.text.trim().split(/\s+/).filter(w => w.length > 0);
      return sum + words.length;
    }, 0);
    setTotalWords(total);
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isBotTyping) return;

    const userMessage: Message = { sender: 'user', text: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsBotTyping(true);

    try {
      const response = await getChatbotResponse(updatedMessages);
      
      const botMessage: Message = { sender: 'bot', text: response };
      setMessages(updatedMessages.concat(botMessage));

      // Check if conversation is complete
      if (response.includes('[CONVERSATION_COMPLETE]')) {
        setIsChatComplete(true);
      }
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = { 
        sender: 'bot', 
        text: "I'm having trouble connecting right now 💙 Please try again in a moment." 
      };
      setMessages(updatedMessages.concat(errorMessage));
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

  if (isChatComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-2 border-therapy-growth/30 bg-gradient-to-br from-therapy-safe/20 via-white to-therapy-growth/10 overflow-hidden">
          {/* Celebration Header - Mobile Optimized */}
          <div className="bg-gradient-to-r from-therapy-warmth via-therapy-growth to-therapy-calm p-4 sm:p-8 text-white text-center relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 text-4xl sm:text-6xl opacity-20"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 text-4xl sm:text-6xl opacity-20"
            >
              💝
            </motion.div>
            
            <div className="relative z-10 space-y-2 sm:space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                className="text-3xl sm:text-5xl mb-2"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold">
                Thank You for Sharing!
              </h3>
              <p className="text-white/90 text-base sm:text-lg">
                Your reflection session is complete 💝
              </p>
            </div>
          </div>

          {/* Stats Section - Mobile Optimized */}
          <CardContent className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Session Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-therapy-calm/20 space-y-4 sm:space-y-6"
            >
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Session Summary
              </h4>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-2 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200"
                >
                  <motion.div
                    className="text-xl sm:text-3xl font-bold text-blue-600 mb-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {totalWords}
                  </motion.div>
                  <div className="text-xs font-medium text-gray-600">Words Shared</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-center p-2 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200"
                >
                  <motion.div
                    className="text-xl sm:text-3xl font-bold text-emerald-600 mb-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.45, type: "spring" }}
                  >
                    {messages.length}
                  </motion.div>
                  <div className="text-xs font-medium text-gray-600">Exchanges</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center p-2 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200"
                >
                  <motion.div
                    className="text-xl sm:text-3xl font-bold text-purple-600 mb-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    💙
                  </motion.div>
                  <div className="text-xs font-medium text-gray-600">Heart Shared</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-therapy-calm/10 to-therapy-growth/10 rounded-2xl p-6 border border-therapy-calm/20"
            >
              <div className="flex gap-3">
                <div className="text-2xl">✨</div>
                <div>
                  <p className="text-neutral-700 font-medium mb-1">
                    "You showed up for your relationship today."
                  </p>
                  <p className="text-sm text-neutral-600">
                    That's what matters most. 💝
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 pt-4"
            >
              <Button 
                onClick={() => onComplete?.(messages)} 
                variant="therapy" 
                size="lg"
                className="w-full text-lg py-6 font-semibold"
              >
                ✨ See Your Insights
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="w-full text-lg py-6 font-semibold"
                onClick={() => {
                  setIsChatComplete(false);
                  setMessages([]);
                  setUserInput('');
                  inputRef.current?.focus();
                }}
              >
                💬 Continue Reflecting
              </Button>
            </motion.div>

            {/* Footer Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-neutral-600 pt-4"
            >
              Thank you for trusting Bridge with your heart. 
              <br/>
              Your partner will value your openness 💝
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Chat Header - Mobile Optimized */}
        <div className="p-3 sm:p-4 border-b border-neutral-200 bg-therapy-safe/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-therapy-calm flex-shrink-0" />
              <span className="font-medium text-therapy-calm text-sm sm:text-base">Bridge</span>
              <span className="text-xs text-neutral-500 hidden sm:inline">Your AI Counselor</span>
            </div>
            <div className="text-xs sm:text-sm text-neutral-600 flex-shrink-0">
              {totalWords} words
            </div>
          </div>
        </div>

        {/* Messages - Mobile Optimized */}
        <div className="h-[400px] sm:h-[500px] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-therapy-safe/5 to-white">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-therapy-warmth text-white rounded-br-md'
                      : 'bg-white border border-neutral-200 text-neutral-800 rounded-bl-md shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text.replace('[CONVERSATION_COMPLETE]', '')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isBotTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-neutral-200 p-4 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-therapy-calm rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-500">Bridge is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area - Mobile Optimized */}
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            {userInput.trim() && (
              <div className="flex justify-between items-center text-xs text-neutral-500 mb-2">
                <span>{wordCount} words</span>
                <span className="text-therapy-calm flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="hidden sm:inline">Every word matters</span>
                  <span className="sm:hidden">Matters</span>
                </span>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isCompleting ? "Completing reflection..." : isBotTyping ? "Bridge is typing..." : "Share what's on your mind... 💭"}
                disabled={isBotTyping || isCompleting}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-therapy-calm/20 rounded-xl focus:outline-none focus:border-therapy-calm focus:ring-2 focus:ring-therapy-calm/20 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              <Button
                type="submit"
                disabled={isBotTyping || !userInput.trim() || isCompleting}
                variant="therapy"
                size="lg"
                className="px-4 sm:px-6 min-h-[40px] sm:min-h-[44px]"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </form>
          
          {/* Manual Completion Button */}
          {messages.length > 2 && !isChatComplete && (
            <div className="mt-4 pt-4 border-t border-therapy-calm/20">
              <Button
                onClick={() => onComplete?.(messages)}
                variant="outline"
                size="sm"
                className="w-full text-therapy-calm border-therapy-calm hover:bg-therapy-calm hover:text-white"
                disabled={isCompleting}
              >
                {isCompleting ? "Completing..." : "✨ Complete My Reflection"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleChatView;

