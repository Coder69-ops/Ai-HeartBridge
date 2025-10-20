// AI HeartBridge - Mobile-First Responsive Header
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  MessageCircle,
  Activity,
  BookOpen,
  Target,
  User as UserIcon,
  AlertCircle,
  LogOut,
  Heart,
  Settings,
  TrendingUp
} from 'lucide-react';
import { User } from '../types';
import { Button } from './shared/Button';

interface MobileHeaderProps {
  user: User;
  onNavigate: (view: string) => void;
  onShowSafetyModal: () => void;
  onLogout: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  user,
  onNavigate,
  onShowSafetyModal,
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getUserDisplayName = () => {
    if (user.profile?.firstName) {
      return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName}` : '');
    }
    return user.name || user.email.split('@')[0];
  };

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', view: 'dashboard' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Chat', view: 'chat' },
    { icon: <Activity className="w-5 h-5" />, label: 'Check-in', view: 'mood' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Journal', view: 'journal' },
    { icon: <Target className="w-5 h-5" />, label: 'Exercises', view: 'exercises' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Trends', view: 'goals' },
    { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', view: 'profile' },
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  AI HeartBridge
                </h1>
                <p className="text-xs text-gray-500">Relationship Therapy</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.slice(0, 5).map((item) => (
                <Button
                  key={item.view}
                  variant="ghost"
                  onClick={() => handleNavClick(item.view)}
                  className="gap-2"
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Safety Button - Always Visible */}
              <Button
                variant="outline"
                size="icon"
                onClick={onShowSafetyModal}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                title="Safety Resources"
              >
                <AlertCircle className="w-5 h-5" />
              </Button>

              {/* Profile - Desktop Only */}
              <Button
                variant="ghost"
                onClick={() => handleNavClick('profile')}
                className="hidden sm:flex gap-2"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden lg:inline">{user.name || 'Profile'}</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl overflow-y-auto lg:hidden"
            >
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {getUserDisplayName()[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleNavClick('profile')}
                    className="w-full justify-start gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.view}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavClick(item.view)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-emerald-100 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                        {item.label}
                      </span>
                    </motion.button>
                  ))}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-gray-200 space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onShowSafetyModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Safety Resources
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={onLogout}
                    className="w-full justify-start gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>

                {/* App Version */}
                <div className="text-center text-xs text-gray-400">
                  AI HeartBridge v1.0.0
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileHeader;

