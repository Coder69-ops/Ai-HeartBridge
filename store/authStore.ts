import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true for initialization
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          
          console.log('🔗 Frontend-Backend Connection Debug:');
          console.log('📍 API URL:', apiUrl);
          console.log('📧 Login attempt for:', email);
          console.log('🌐 Making request to:', `${apiUrl}/auth/login`);
          
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          console.log('📡 Response received:');
          console.log('   Status:', response.status);
          console.log('   Status Text:', response.statusText);
          console.log('   Headers:', Object.fromEntries(response.headers.entries()));
          console.log('   OK:', response.ok);

          const data = await response.json();
          console.log('📦 Response data:', data);

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          // Ensure user has required fields with proper onboarding status
          const user = {
            ...data.user,
            isOnboardingComplete: Boolean(data.user.isOnboardingComplete),
            dateJoined: data.user.dateJoined ? new Date(data.user.dateJoined) : new Date(),
            lastActive: data.user.lastActive ? new Date(data.user.lastActive) : new Date(),
            // Ensure profile structure exists
            profile: {
              ...data.user.profile,
              onboardingStep: data.user.isOnboardingComplete ? undefined : 0
            },
            preferences: {
              theme: 'system',
              notifications: true,
              language: 'en',
              timezone: 'auto',
              communicationStyle: 'gentle',
              privacyLevel: 'private',
              ...data.user.preferences
            }
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Also set tokens for old authService compatibility
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          console.log('✅ Login successful!');
          console.log('   User:', user);
          console.log('   Token received:', data.token ? 'Yes' : 'No');
        } catch (error) {
          console.log('❌ Login Error:');
          console.log('   Error type:', typeof error);
          console.log('   Error message:', error instanceof Error ? error.message : error);
          console.log('   Full error:', error);
          
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          
          const response = await fetch(`${apiUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          // Ensure user has required fields with proper onboarding status
          const user = {
            ...data.user,
            isOnboardingComplete: Boolean(data.user.isOnboardingComplete),
            dateJoined: data.user.dateJoined ? new Date(data.user.dateJoined) : new Date(),
            lastActive: data.user.lastActive ? new Date(data.user.lastActive) : new Date(),
            // Ensure profile structure exists
            profile: {
              ...data.user.profile,
              onboardingStep: data.user.isOnboardingComplete ? undefined : 0
            },
            preferences: {
              theme: 'system',
              notifications: true,
              language: 'en',
              timezone: 'auto',
              communicationStyle: 'gentle',
              privacyLevel: 'private',
              ...data.user.preferences
            }
          };

          set({
            user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Also set tokens for old authService compatibility
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(user));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear both new and old auth tokens
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: async (updates) => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');

        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Profile update failed');
          }

          set({
            user: { ...user, ...updates },
            isLoading: false,
          });
          
          // Update localStorage for compatibility
          localStorage.setItem('user_data', JSON.stringify({ ...user, ...updates }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Profile update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      updatePreferences: async (preferences) => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');

        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preferences }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Preferences update failed');
          }

          set({
            user: { ...user, preferences: { ...user.preferences, ...preferences } },
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Preferences update failed',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      // Initialize auth state on app startup
      initialize: () => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            console.error('Failed to parse user data:', error);
            // Clear corrupted data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);