import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Heart, MessageCircle, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Button } from './shared/Button';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import Icon from './shared/Icon';

export interface Notification {
  id: string;
  type: 'journal_partner_complete' | 'journal_insights_ready' | 'journal_reminder' | 'general';
  title: string;
  message: string;
  sessionId?: string;
  isRead: boolean;
  priority: 'high' | 'normal' | 'low';
  createdAt: Date;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  isOpen,
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'high':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'journal_partner_complete':
        return <Heart className="w-4 h-4 text-emerald-600" />;
      case 'journal_insights_ready':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'journal_reminder':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'normal':
        return 'border-l-emerald-500 bg-emerald-50/50';
      case 'low':
        return 'border-l-gray-400 bg-gray-50/50';
      default:
        return 'border-l-gray-400 bg-gray-50/50';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed top-16 right-4 w-full max-w-sm sm:max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-3 border-b border-gray-100 bg-gray-50/50">
        {(['all', 'unread', 'high'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === filterType
                ? 'bg-emerald-500 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filterType === 'all' ? 'All' : filterType === 'unread' ? `Unread (${unreadCount})` : `High (${highPriorityCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`border-l-4 ${getNotificationColor(notification.priority)} ${
                  !notification.isRead ? 'bg-white' : 'bg-gray-50/30'
                } hover:bg-gray-50 transition-colors cursor-pointer`}
                onClick={() => {
                  onNotificationClick(notification);
                  if (!notification.isRead) {
                    onMarkAsRead(notification.id);
                  }
                }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.actionText && (
                          <span className="text-xs text-emerald-600 font-medium">
                            {notification.actionText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-600 mb-1">No notifications</h4>
              <p className="text-xs text-gray-500">
                {filter === 'unread' ? "You're all caught up!" : "No notifications to show"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50/50">
          <p className="text-xs text-gray-500 text-center">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationCenter;
