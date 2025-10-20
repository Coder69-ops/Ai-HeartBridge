import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from './shared/Button';
import NotificationCenter from './NotificationCenter';
import { Notification } from './NotificationCenter';

interface NotificationBadgeProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  useEffect(() => {
    // Show animation when new notifications arrive
    if (unreadCount > 0) {
      setHasNewNotifications(true);
      const timer = setTimeout(() => setHasNewNotifications(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}

        {/* High Priority Indicator */}
        {highPriorityCount > 0 && (
          <motion.div
            animate={hasNewNotifications ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: hasNewNotifications ? 2 : 0 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
          />
        )}

        {/* Pulse Animation for New Notifications */}
        {hasNewNotifications && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-red-500/20 rounded-full"
          />
        )}
      </Button>

      {/* Notification Center */}
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
