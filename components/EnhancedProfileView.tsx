import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Couple } from '../types';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from './shared/Card';
import { Button } from './shared/Button';
import ContextualLoader from './shared/ContextualLoader';
import { 
  User as UserIcon, 
  Mail, 
  Heart,
  Edit3,
  Save,
  X,
  Camera,
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Link as LinkIcon,
  Users,
  LogOut,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Calendar,
  Activity,
  Target,
  TrendingUp,
  Star,
  Award,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import * as authService from '../services/authService';
import { getCoupleCheckInHistory } from '../services/checkInService';
import { getJournalSessionHistory } from '../services/journalSessionService';
import { getHealthScore } from '../services/analyticsService';

interface EnhancedProfileViewProps {
  onBack: () => void;
}

type ProfileSection = 'profile' | 'partner' | 'notifications' | 'privacy' | 'appearance' | 'danger';

const EnhancedProfileView: React.FC<EnhancedProfileViewProps> = ({ onBack }) => {
  const { user, setUser, logout } = useAuthStore();
  const [partner, setPartner] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnpairConfirm, setShowUnpairConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userStats, setUserStats] = useState({
    checkIns: 0,
    journalSessions: 0,
    healthScore: 0,
    daysActive: 0
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    partnerMessages: true,
    checkInReminders: true,
    exerciseSuggestions: false,
    weeklyReports: true,
    relationshipInsights: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsOptIn: true
  });

  // Load user data and stats
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Load partner and couple data
        if (user?.coupleId) {
          const [partnerData, coupleData] = await Promise.all([
            authService.getPartner(user),
            authService.getCouple(user.coupleId)
          ]);
          setPartner(partnerData);
          setCouple(coupleData);
        }

        // Load user statistics
        if (user?.coupleId) {
          try {
            const [checkInHistory, journalHistory, healthScore] = await Promise.all([
              getCoupleCheckInHistory(user.coupleId),
              getJournalSessionHistory(user.coupleId),
              getHealthScore(user.coupleId)
            ]);

            const checkIns = Array.isArray(checkInHistory) ? checkInHistory : checkInHistory.checkIns || [];
            const journalSessions = Array.isArray(journalHistory) ? journalHistory : journalHistory.sessions || [];
            
            // Calculate days active (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentActivity = [
              ...checkIns.filter((checkIn: any) => new Date(checkIn.createdAt) >= thirtyDaysAgo),
              ...journalSessions.filter((session: any) => new Date(session.createdAt) >= thirtyDaysAgo)
            ];
            
            const uniqueDays = new Set(
              recentActivity.map((item: any) => 
                new Date(item.createdAt).toDateString()
              )
            ).size;

            setUserStats({
              checkIns: checkIns.length,
              journalSessions: journalSessions.length,
              healthScore: (healthScore as any)?.overallScore || 0,
              daysActive: uniqueDays
            });
          } catch (error) {
            console.error('Failed to load user stats:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar
      });
      
      setUser(updatedUser);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to save:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  const handleUnpair = async () => {
    try {
      await authService.unpairPartner();
      setPartner(null);
      setCouple(null);
      setShowUnpairConfirm(false);
      alert('Successfully unpaired from your partner');
    } catch (error: any) {
      console.error('Failed to unpair:', error);
      alert(error.message || 'Failed to unpair partner');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deactivateAccount();
      logout();
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error.message || 'Failed to delete account');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sections = [
    { 
      id: 'profile' as ProfileSection, 
      label: 'Profile', 
      icon: <UserIcon className="w-5 h-5" />, 
      color: 'from-emerald-500 to-cyan-500' 
    },
    { 
      id: 'partner' as ProfileSection, 
      label: 'Partner', 
      icon: <Heart className="w-5 h-5" />, 
      color: 'from-pink-500 to-rose-500' 
    },
    { 
      id: 'notifications' as ProfileSection, 
      label: 'Notifications', 
      icon: <Bell className="w-5 h-5" />, 
      color: 'from-blue-500 to-indigo-500' 
    },
    { 
      id: 'privacy' as ProfileSection, 
      label: 'Privacy', 
      icon: <Shield className="w-5 h-5" />, 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      id: 'appearance' as ProfileSection, 
      label: 'Appearance', 
      icon: <Palette className="w-5 h-5" />, 
      color: 'from-amber-500 to-orange-500' 
    },
    { 
      id: 'danger' as ProfileSection, 
      label: 'Danger Zone', 
      icon: <AlertTriangle className="w-5 h-5" />, 
      color: 'from-red-500 to-rose-500' 
    },
  ];

  if (isLoading) {
    return <ContextualLoader type="general" message="Loading your profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profile & Settings</h1>
              <p className="text-white/80">Manage your account and preferences</p>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-24" />
            
            <CardContent className="p-6 -mt-12">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl border-4 border-white">
                      {formData.avatar ? (
                        <img 
                          src={formData.avatar} 
                          alt={formData.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(formData.name)
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {formData.name || 'Your Name'}
                    </h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {formData.email}
                    </p>
                    {partner && (
                      <p className="text-sm text-gray-500 mt-1">
                        Partnered with {partner.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800">Profile updated successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Form */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 mb-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                      >
                        {isSaving ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="inline-block"
                            >
                              <Loader2 className="w-4 h-4 mr-2 inline-block" />
                            </motion.div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
              >
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">{userStats.checkIns}</div>
                    <div className="text-xs text-gray-600 font-medium">Check-ins</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.journalSessions}</div>
                    <div className="text-xs text-gray-600 font-medium">Journal Sessions</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{userStats.healthScore}</div>
                    <div className="text-xs text-gray-600 font-medium">Health Score</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600 mb-1">{userStats.daysActive}</div>
                    <div className="text-xs text-gray-600 font-medium">Days Active</div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Settings Sections */}
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 min-h-[60px] ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white border-transparent shadow-lg`
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                      {section.icon}
                    </div>
                    <span className="font-medium flex-1">{section.label}</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                  </motion.button>
                ))}
              </div>

              {/* Section Content */}
              <AnimatePresence mode="wait">
                {activeSection === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700"><strong>Name:</strong> {user?.name}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700"><strong>Email:</strong> {user?.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700"><strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'partner' && (
                  <motion.div
                    key="partner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Partner Information</h3>
                    {partner ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold">
                            {getInitials(partner.name)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{partner.name}</h4>
                            <p className="text-sm text-gray-600">{partner.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            onClick={() => setShowUnpairConfirm(true)}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Unpair Partner
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">No Partner Connected</h4>
                        <p className="text-gray-600 mb-4">Connect with your partner to start your journey together</p>
                        <Button
                          onClick={() => {/* Navigate to pairing */}}
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect Partner
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <input 
                          type="checkbox" 
                          checked={value} 
                          onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeSection === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">Privacy & Security</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Change Password</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Two-Factor Authentication</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-gray-600" />
                          <span className="text-gray-700">Data & Privacy</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'appearance' && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-gray-200 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">Appearance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Dark Mode</span>
                        <input type="checkbox" readOnly className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Compact View</span>
                        <input type="checkbox" readOnly className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Large Text</span>
                        <input type="checkbox" readOnly className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === 'danger' && (
                  <motion.div
                    key="danger"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-6 bg-white rounded-2xl border-2 border-red-200 space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">Unpair Partner</h4>
                        <p className="text-sm text-red-700 mb-3">This will end your current relationship connection.</p>
                        <Button
                          onClick={() => setShowUnpairConfirm(true)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Unpair Partner
                        </Button>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-3">This will permanently delete your account and all data.</p>
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Unpair Confirmation Modal */}
      <AnimatePresence>
        {showUnpairConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUnpairConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                Unpair Partner?
              </h3>
              <p className="text-center text-gray-600 mb-6">
                This will end your relationship connection. You can reconnect later if needed.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUnpairConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnpair}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Unpair
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                Delete Account?
              </h3>
              <p className="text-center text-gray-600 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedProfileView;
