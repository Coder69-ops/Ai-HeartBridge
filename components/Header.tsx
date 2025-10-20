import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import Icon from './shared/Icon';
import { 
  AnimatedButton,
  InteractiveAnimation,
  PulseIndicator,
  FloatingNotification
} from '../src/components/ui/enhanced';
import { 
  Bell, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Shield,
  MessageCircle,
  Search,
  Menu
} from 'lucide-react';

interface HeaderProps {
    user: User;
    onNavigate: (view: string) => void;
    onShowSafetyModal: () => void;
    onLogout: () => void;
    currentView?: string;
    notifications?: number;
    partner?: User | null;
}

const Header: React.FC<HeaderProps> = ({ 
    user, 
    onNavigate, 
    onShowSafetyModal, 
    onLogout, 
    currentView = 'dashboard',
    notifications = 0,
    partner = null 
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        onNavigate('profile');
        setDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    const handleNavigate = (view: string) => {
        onNavigate(view);
        setMobileMenuOpen(false);
    };

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'home', view: 'dashboard' },
        { id: 'chat', label: 'AI Chat', icon: 'brain', view: 'chat' },
        { id: 'partner-chat', label: 'Partner Chat', icon: 'heart', view: 'partner-chat' },
        { id: 'exercises', label: 'Exercises', icon: 'book-open', view: 'exercises' },
        { id: 'trends', label: 'Insights', icon: 'chart-bar', view: 'trends' },
        { id: 'journal', label: 'Journal', icon: 'journal', view: 'journal' }
    ];

    const getUserDisplayName = () => {
        if (user.profile?.firstName) {
            return user.profile.firstName + (user.profile.lastName ? ` ${user.profile.lastName[0]}.` : '');
        }
        return user.name || user.email.split('@')[0];
    };

    const getPartnerStatus = () => {
        if (partner) {
            return `Connected with ${(partner as User).profile?.firstName || (partner as User).name || 'Partner'}`;
        }
        return 'Single user mode';
    };

    return (
        <motion.header 
            className="bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-100 sticky top-0 z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <InteractiveAnimation hover tap>
                        <motion.div 
                            className="flex items-center cursor-pointer group"
                            onClick={() => handleNavigate('dashboard')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div
                                className="relative"
                                animate={{ 
                                    rotate: [0, 5, -5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            >
                                <Icon name="heart" className="w-8 h-8 text-emerald-600 group-hover:text-emerald-700 transition-colors"/>
                                {partner && (
                                    <PulseIndicator 
                                        size="sm" 
                                        color="emerald" 
                                        className="absolute -top-1 -right-1" 
                                    />
                                )}
                            </motion.div>
                            <div className="ml-3">
                                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    AI HeartBridge
                                </span>
                                <div className="text-xs text-emerald-500 font-medium">
                                    {getPartnerStatus()}
                                </div>
                            </div>
                        </motion.div>
                    </InteractiveAnimation>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-2">
                        {navigationItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AnimatedButton
                                    variant={currentView === item.view ? 'therapy' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleNavigate(item.view)}
                                    leftIcon={<Icon name={item.icon as any} className="w-4 h-4" />}
                                    className={`relative ${
                                        currentView === item.view 
                                            ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                                            : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                    animation="bounce"
                                >
                                    {item.label}
                                    {currentView === item.view && (
                                        <motion.div
                                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"
                                            layoutId="activeIndicator"
                                        />
                                    )}
                                </AnimatedButton>
                            </motion.div>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                                animation="pulse"
                            >
                                <Bell className="w-5 h-5" />
                                {notifications > 0 && (
                                    <motion.span
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        {notifications > 9 ? '9+' : notifications}
                                    </motion.span>
                                )}
                            </AnimatedButton>
                            
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="p-4 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                    <p>No new notifications</p>
                                                </div>
                                            ) : (
                                                <div className="p-2">
                                                    {Array.from({ length: Math.min(notifications, 5) }).map((_, i) => (
                                                        <div key={i} className="p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-800">New insight available</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Your relationship progress report is ready</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Safety Button */}
                        <AnimatedButton
                            variant="ghost"
                            size="sm"
                            onClick={onShowSafetyModal}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            animation="pulse"
                        >
                            <Shield className="w-5 h-5" />
                        </AnimatedButton>

                        {/* User Menu */}
                        <div className="relative" ref={dropdownRef}>
                            <AnimatedButton
                                variant="ghost"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-emerald-200/50"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                    {getUserDisplayName().charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left max-w-[120px]">
                                    <div className="text-sm font-medium text-gray-800 truncate">
                                        {getUserDisplayName()}
                                    </div>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </AnimatedButton>
                            
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                                    {getUserDisplayName().charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-800 truncate">{getUserDisplayName()}</div>
                                                    <div className="text-sm text-gray-600 truncate">{user.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <InteractiveAnimation hover>
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                >
                                                    <UserIcon className="w-4 h-4" />
                                                    <span>Profile & Settings</span>
                                                </button>
                                            </InteractiveAnimation>
                                            
                                            <InteractiveAnimation hover>
                                                <button
                                                    onClick={() => handleNavigate('chat')}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>AI Companion Chat</span>
                                                </button>
                                            </InteractiveAnimation>
                                            
                                            <div className="border-t border-gray-100 my-2"></div>
                                            
                                            <InteractiveAnimation hover>
                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </InteractiveAnimation>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <AnimatedButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                                <Menu className="w-5 h-5" />
                            </AnimatedButton>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Navigation */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="px-4 py-4 space-y-2">
                                {navigationItems.map((item) => (
                                    <AnimatedButton
                                        key={item.id}
                                        variant={currentView === item.view ? 'therapy' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleNavigate(item.view)}
                                        leftIcon={<Icon name={item.icon as any} className="w-4 h-4" />}
                                        className={`w-full justify-start ${
                                            currentView === item.view 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    >
                                        {item.label}
                                    </AnimatedButton>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Connection Status Indicator */}
            {partner && (
                <FloatingNotification
                    message={`Connected with ${(partner as User).profile?.firstName || 'Partner'}`}
                    type="success"
                    position="top-right"
                    duration={3000}
                />
            )}
        </motion.header>
    );
};

export default Header;
