import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Couple } from '../types';
import { getPartner } from '../services/authService';
import api from '../services/apiClient';

interface AuthState {
  user: User | null;
  partner: User | null;
  couple: Couple | null;
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
      partner: null,
      couple: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true for initialization
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/login', { email, password });
          
          // Handle non-JSON responses
          if (typeof response.data === 'string') {
            throw new Error('Server temporarily unavailable. Please try again later.');
          }
          
          const data = response.data;

          if (!data.token || !data.user) {
            throw new Error(data.message || 'Login failed');
          }

          const { user, token } = data;
          
          // Set basic auth state first
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Also set tokens for old authService compatibility
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          // Get partner separately to avoid blocking login
          try {
            const partner = await getPartner(user);
            set({ partner });
          } catch (partnerError) {
            console.warn('Failed to load partner:', partnerError);
            // Don't fail login if partner loading fails
            set({ partner: null });
          }
          
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.post('/auth/signup', userData);
          
          // Handle non-JSON responses
          if (typeof response.data === 'string') {
            throw new Error('Server temporarily unavailable. Please try again later.');
          }
          
          const data = response.data;

          if (!data.token || !data.user) {
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

          const partner = await authService.getPartner(user);

          set({
            user,
            partner,
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
      initialize: async () => {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: true, // Keep loading while we fetch fresh data
            });

            // Fetch fresh user data from server to get current pairing status
            try {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
              
              const response = await fetch(`${apiUrl}/auth/me`, {
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
              });

              if (response.ok) {
                const data = await response.json();
                const freshUser = data.user;
                let partner = null;
                let couple = null;

                // If user has a couple, fetch partner data
                if (freshUser.coupleId) {
                  try {
                    const partnerResponse = await fetch(`${apiUrl}/couples/info`, {
                      headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                    });

                    if (partnerResponse.ok) {
                      const coupleData = await partnerResponse.json();
                      couple = coupleData.couple;
                      
                      // Find the partner (the other user in the couple)
                      if (couple.partner1Id._id === freshUser.id) {
                        partner = couple.partner2Id;
                      } else {
                        partner = couple.partner1Id;
                      }
                    }
                  } catch (partnerError) {
                    console.log('Could not fetch partner data:', partnerError);
                  }
                }

                // Update with fresh data
                set({
                  user: freshUser,
                  partner,
                  couple,
                  token,
                  isAuthenticated: true,
                  isLoading: false,
                });

                // Update localStorage with fresh data
                localStorage.setItem('user_data', JSON.stringify(freshUser));
              } else {
                // Token might be invalid, use cached data but mark as loaded
                set({ isLoading: false });
              }
            } catch (fetchError) {
              console.log('Could not fetch fresh user data, using cached:', fetchError);
              // Use cached data if server is unreachable
              set({ isLoading: false });
            }
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