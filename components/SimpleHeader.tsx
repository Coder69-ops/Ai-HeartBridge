import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  MessageCircle, 
  BookOpen, 
  TrendingUp, 
  Target,
  Shield,
  Activity
} from 'lucide-react';
import { User as UserType } from '../types';
import { Button } from './shared/Button';
import NotificationBadge from './NotificationBadge';
import { Notification } from './NotificationCenter';
import Logo from './shared/Logo';
import { PulseIndicator } from '../src/components/ui/enhanced';

interface SimpleHeaderProps {
  user: UserType;
  onNavigate: (view: string) => void;
  onShowSafetyModal: () => void;
  onLogout: () => void;
  currentView?: string;
  partner?: UserType | null;
  notifications?: Notification[];
  onMarkNotificationAsRead?: (notificationId: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  user,
  onNavigate,
  onShowSafetyModal,
  onLogout,
  currentView = 'dashboard',
  partner = null,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onNotificationClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, view: 'dashboard' },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle, view: 'chat' },
    { id: 'partner-chat', label: 'Partner Chat', icon: Heart, view: 'partner-chat' },
    { id: 'journal', label: 'Journal', icon: Target, view: 'journal' },
    { id: 'checkin', label: 'Check-in', icon: Activity, view: 'checkin' },
    { id: 'exercises', label: 'Exercises', icon: BookOpen, view: 'exercises' },
    { id: 'trends', label: 'Insights', icon: TrendingUp, view: 'trends' },
    { id: 'profile', label: 'Profile', icon: User, view: 'profile' }
  ];

  const getUserDisplayName = () => {
    if (user.profile?.firstName) {
      return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName[0]}.` : '');
    }
    return user.name || user.email.split('@')[0];
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setUserMenuOpen(false);
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <motion.div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <Logo 
                size="md" 
                animated={true}
                showText={true}
                className="group-hover:scale-105 transition-transform duration-200"
              />
              {partner && (
                <PulseIndicator
                  size="sm"
                  color="emerald"
                  className="absolute -top-1 -right-1"
                />
              )}
            </div>
            {partner && (
              <div className="ml-3 hidden sm:block">
                <p className="text-xs text-emerald-500 font-medium">
                  Connected with {(partner as UserType)?.profile?.firstName || (partner as UserType)?.name || 'Partner'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.view ? "default" : "ghost"}
                  onClick={() => handleNavClick(item.view)}
                  className={`px-3 py-2 text-sm font-medium transition-all ${
                    currentView === item.view
                      ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Safety Button */}
            <Button
              variant="ghost"
              onClick={() => onShowSafetyModal()}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
              title="Safety Center"
            >
              <Shield className="w-5 h-5" />
            </Button>
            {/* Desktop Notification Badge - Hidden on mobile */}
            <div className="hidden md:block">
              <NotificationBadge
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                onNotificationClick={onNotificationClick || (() => {})}
              />
            </div>

            {/* Safety Button - Always visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowSafetyModal}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Shield className="w-5 h-5" />
            </Button>

            {/* User Menu - Desktop only */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
              </Button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => {
                        handleNavClick('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile & Settings</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button with Notification Badge */}
            <div className="md:hidden flex items-center space-x-2">
              <NotificationBadge
                notifications={notifications}
                onMarkAsRead={onMarkNotificationAsRead || (() => {})}
                onMarkAllAsRead={onMarkAllNotificationsAsRead || (() => {})}
                onNotificationClick={onNotificationClick || (() => {})}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3 space-y-2">
              {/* User Info Section */}
              <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                  {partner && (
                    <p className="text-xs text-emerald-600">
                      Connected with {(partner as UserType)?.profile?.firstName || (partner as UserType)?.name || 'Partner'}
                    </p>
                  )}
                </div>
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.view)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-base font-medium rounded-lg transition-all touch-manipulation ${
                      currentView === item.view
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="border-t border-gray-200 my-3"></div>
              
              <button
                onClick={() => {
                  handleNavClick('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-base text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 rounded-lg transition-all touch-manipulation"
              >
                <User className="w-6 h-6" />
                <span>Profile & Settings</span>
              </button>
              
              <button
                onClick={() => {
                  handleLogoutClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-base text-red-600 hover:text-red-50 hover:bg-red-50 active:bg-red-100 rounded-lg transition-all touch-manipulation"
              >
                <LogOut className="w-6 h-6" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default SimpleHeader; 