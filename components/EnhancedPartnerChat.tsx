// AI HeartBridge - Enhanced Mobile-First Partner Chat
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socketService } from '../services/socketService';
import { 
  getPartnerChat, 
  sendPartnerMessage, 
  markMessagesAsRead,
  checkPartnerPresence,
  formatMessageTime,
  isMyMessage,
  isMessageDeleted,
  isMessageEdited,
  getMessageStatus,
  type PartnerMessage,
  type PartnerChatResponse 
} from '../services/partnerChatService';
import { 
  Send, 
  ArrowLeft, 
  Heart, 
  Smile, 
  MoreVertical, 
  Check, 
  CheckCheck,
  MessageCircle,
  Sparkles,
  X,
  Copy,
  Trash2
} from 'lucide-react';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface EnhancedPartnerChatProps {
  onBack: () => void;
}

const EnhancedPartnerChat: React.FC<EnhancedPartnerChatProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [partnerOnlineStatus, setPartnerOnlineStatus] = useState(false);
  const [partnerLastSeen, setPartnerLastSeen] = useState<Date | null>(null);

  // Quick reaction emojis
  const quickEmojis = ['❤️', '😊', '👍', '🎉', '😂', '🤗', '💪', '✨'];
  
  // Fetch partner chat data
  const {
    data: chatData,
    isLoading,
    error,
    refetch
  } = useQuery<PartnerChatResponse>({
    queryKey: ['partner-chat'],
    queryFn: getPartnerChat,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 2000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  // Send message mutation with therapeutic error handling
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => sendPartnerMessage(message),
    onSuccess: (data) => {
      queryClient.setQueryData(['partner-chat'], (oldData: PartnerChatResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          chat: {
            ...oldData.chat,
            messages: [...oldData.chat.messages, data.messageData],
            totalMessages: data.chat.totalMessages,
            lastMessageAt: data.chat.lastMessageAt
          }
        };
      });
      setMessageText('');
      setShowEmojiPicker(false);
      scrollToBottom();
      console.log('💚 Message sent with love to your partner');
    },
    onError: (error: any) => {
      console.error('💔 Message couldn\'t be delivered right now, but don\'t worry - we\'ll keep trying', error);
      
      // Show therapeutic error message based on error type
      let errorMessage = "Your message is important to us. We're having trouble sending it right now, but we'll keep trying. Your connection with your partner remains strong. 💚";
      
      if (error?.response?.status === 429) {
        errorMessage = "You're sharing so much love! Let's take a mindful pause and try sending again in a moment. Sometimes slowing down helps us connect better. 🌱";
      } else if (error?.response?.status === 413) {
        errorMessage = "Your message has so much to say! Could you share your thoughts in a shorter message? Sometimes the most powerful words are the simplest ones. ✨";
      } else if (!navigator.onLine) {
        errorMessage = "Your internet connection stepped away for a moment. Don't worry - your message will be sent as soon as you're reconnected. Take this time to breathe. 💙";
      }
      
      // You can add toast notification here with errorMessage
      // For now, just log it therapeutically
      console.log('🤗 Therapeutic guidance:', errorMessage);
    }
  });

  // Mark messages as read with gentle error handling
  const markReadMutation = useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: () => {
      queryClient.setQueryData(['partner-chat'], (oldData: PartnerChatResponse | undefined) => {
        if (!oldData || !user) return oldData;
        return {
          ...oldData,
          chat: {
            ...oldData.chat,
            messages: oldData.chat.messages.map(msg => 
              msg.receiverId === user.id ? { ...msg, isRead: true } : msg
            ),
            unreadCount: 0
          }
        };
      });
      console.log('💚 Messages marked as read - your partner knows you\'re listening');
    },
    onError: (error: any) => {
      console.error('🤗 Having trouble updating read status, but your connection remains strong', error);
      // Silently retry in background without bothering the user
      setTimeout(() => {
        if (chatData?.chat.unreadCount && chatData.chat.unreadCount > 0) {
          markReadMutation.mutate();
        }
      }, 3000);
    }
  });

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark as read when viewing and update initial status
  useEffect(() => {
    if (chatData?.chat.unreadCount && chatData.chat.unreadCount > 0) {
      markReadMutation.mutate();
    }
    
    // Update initial partner status from API response
    if (chatData?.partner) {
      setPartnerOnlineStatus(chatData.partner.isOnline);
      setPartnerLastSeen(chatData.partner.lastSeen ? new Date(chatData.partner.lastSeen) : null);
    }
  }, [chatData?.chat.messages.length, chatData?.partner]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [chatData?.chat.messages]);

  // Focus input and setup socket connection
  useEffect(() => {
    inputRef.current?.focus();
    
    // Connect to socket with therapeutic error handling
    if (user?.id) {
      try {
        socketService.connect(user.id);
        console.log('💚 Socket connected - Ready to connect with your partner');
      } catch (error) {
        console.error('💔 Connection challenge - We\'ll keep trying to reconnect you both', error);
      }
      
      // Listen for partner status changes with error handling
      const unsubscribeStatus = socketService.onPartnerStatusChange((partnerId, isOnline) => {
        try {
          if (chatData?.partner.id === partnerId) {
            setPartnerOnlineStatus(isOnline);
            if (!isOnline) {
              setPartnerLastSeen(new Date());
            }
            console.log(`💝 Partner ${isOnline ? 'joined' : 'stepped away'} - Connection updated`);
          }
        } catch (error) {
          console.error('🤗 Small hiccup with partner status, but your connection remains strong', error);
        }
      });
      
      // Listen for new messages with therapeutic error handling
      const unsubscribeMessages = socketService.onNewPartnerMessage((messageData) => {
        try {
          // Update query data with new message
          queryClient.setQueryData(['partner-chat'], (oldData: PartnerChatResponse | undefined) => {
            if (!oldData || messageData.chatId !== oldData.chat.id) return oldData;
            return {
              ...oldData,
              chat: {
                ...oldData.chat,
                messages: [...oldData.chat.messages, messageData.message],
                totalMessages: oldData.chat.totalMessages + 1,
                lastMessageAt: messageData.message.timestamp
              }
            };
          });
          console.log('💌 New message from your partner received with love');
        } catch (error) {
          console.error('💙 Message received but we\'re having trouble displaying it - refreshing your chat', error);
          // Graceful fallback - refetch chat data
          queryClient.invalidateQueries({ queryKey: ['partner-chat'] });
        }
      });
      
      // Check initial partner status via API with therapeutic error handling
      if (chatData?.partner.id) {
        const checkPresence = () => {
          checkPartnerPresence(chatData.partner.id).then((presence) => {
            console.log('💝 Partner presence updated - connection thriving');
            setPartnerOnlineStatus(presence.isOnline);
            setPartnerLastSeen(presence.lastSeen ? new Date(presence.lastSeen) : null);
          }).catch(err => {
            console.error('🤗 Having trouble checking if your partner is online, but your bond remains strong', err);
            // Don't clear the status, keep the last known state for user comfort
          });
        };
        
        checkPresence();
        const presenceInterval = setInterval(checkPresence, 10000); // Check every 10 seconds
        
        return () => {
          unsubscribeStatus();
          unsubscribeMessages();
          clearInterval(presenceInterval);
        };
      }
      
      return () => {
        unsubscribeStatus();
        unsubscribeMessages();
      };
    }
  }, [user?.id, chatData?.partner.id, queryClient]);
  
  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (user?.id) {
        socketService.disconnect();
      }
    };
  }, [user?.id]);

  // Handle send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(messageText.trim());
  };

  // Handle emoji send
  const handleSendEmoji = (emoji: string) => {
    if (sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(emoji);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Format last seen time
  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastSeen).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(lastSeen).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your conversation...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !chatData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-purple-400 mx-auto" />
          <h3 className="text-xl font-bold text-gray-900">Unable to Connect</h3>
          <p className="text-gray-600">
            {error ? 'Failed to load chat. Please check your connection.' : 'No partner found. Please pair first.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Go Back
            </Button>
            {error && (
              <Button onClick={() => refetch()} variant="therapy" className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const { chat, partner } = chatData;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header - Mobile Optimized */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Back & Partner Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                onClick={onBack}
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {(partner.name || 'P')[0].toUpperCase()}
                  </div>
                  {(partnerOnlineStatus || partner.isOnline) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                
                {/* Name & Status */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                    {partner.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(partnerOnlineStatus || partner.isOnline) ? (
                      <span>Active now</span>
                    ) : (
                      <span>
                        {partnerLastSeen || partner.lastSeen 
                          ? `Last seen ${formatLastSeen(partnerLastSeen || partner.lastSeen || null)}`
                          : 'Offline'
                        }
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Count */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>{chat.totalMessages}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 native-scroll">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Empty State */}
          {chat.messages.length === 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Start Your Private Conversation
              </h3>
              <p className="text-gray-600 max-w-md text-sm sm:text-base">
                Send your first message to {partner.name}. This is your private space to connect and grow together.
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {chat.messages.map((message, index) => {
              const isMyMsg = isMyMessage(message, user?.id || '');
              const isDeleted = isMessageDeleted(message);
              const isEdited = isMessageEdited(message);
              const status = getMessageStatus(message, isMyMsg);
              const showTime = index === 0 || 
                (chatData.chat.messages[index - 1] && 
                 new Date(message.timestamp).getTime() - new Date(chatData.chat.messages[index - 1].timestamp).getTime() > 300000);

              return (
                <motion.div key={message._id}>
                  {/* Time Divider */}
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] sm:max-w-md group`}>
                      {/* Message Content */}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          isMyMsg 
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-br-md' 
                            : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
                        } ${message.messageType === 'emoji' ? 'text-center text-5xl py-2' : ''}`}
                      >
                        {isDeleted ? (
                          <p className="text-sm italic opacity-60">Message deleted</p>
                        ) : (
                          <p className={`text-sm sm:text-base whitespace-pre-wrap break-words ${
                            message.messageType === 'emoji' ? 'text-4xl' : ''
                          }`}>
                            {message.text}
                          </p>
                        )}
                        
                        {/* Message Footer */}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          isMyMsg ? 'text-white/70 justify-end' : 'text-gray-500'
                        }`}>
                          {isEdited && <span className="italic">Edited</span>}
                          <span>{new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          {isMyMsg && (
                            <span>
                              {message.isRead ? (
                                <CheckCheck className="w-3 h-3 inline text-emerald-300" />
                              ) : (
                                <Check className="w-3 h-3 inline" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Actions - Show on hover/tap */}
                      {!isDeleted && (
                        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.text);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                          {quickEmojis.slice(0, 3).map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleSendEmoji(emoji)}
                              className="hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Sticky Bottom */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg safe-bottom"
      >
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Emoji Picker */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-3 p-3 bg-gray-50 rounded-xl flex flex-wrap gap-2"
              >
                {quickEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSendEmoji(emoji)}
                    className="text-2xl hover:scale-125 transition-transform active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
            {/* Emoji Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex-shrink-0"
            >
              {showEmojiPicker ? <X className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${partner.name}...`}
                disabled={sendMessageMutation.isPending}
                className="w-full px-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
              />
              {messageText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {messageText.length}
                </div>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg flex-shrink-0"
              size="icon"
            >
              {sendMessageMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedPartnerChat;

