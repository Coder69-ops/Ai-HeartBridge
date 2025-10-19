
import { User, Couple, JournalEntry, Message, AnalysisResult } from '../types';
import api from './apiClient';

// Auth token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// --- Auth Functions ---

export const signup = async (email: string, password: string): Promise<User> => {
    try {
        const response = await api.post('/auth/signup', { email, password });
        const { token, user } = response.data;
        
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return user;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Signup failed');
    }
};

export const login = async (email: string, password: string): Promise<User> => {
    console.log('🚨 OLD AUTHSERVICE LOGIN CALLED - This should NOT appear');
    try {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        return user;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Login failed');
    }
};

export const setLoggedInUser = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getLoggedInUser = (): User | null => {
    try {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch {
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// --- User & Couple Functions ---

export const getUserById = async (id: string): Promise<User | undefined> => {
    try {
        const response = await api.get(`/users/${id}`);
        return response.data.user;
    } catch {
        return undefined;
    }
};

export const getPartner = async (user: User): Promise<User | null> => {
    try {
        const response = await api.get('/users/partner');
        return response.data.partner;
    } catch {
        return null;
    }
};

export const getCouple = async (coupleId: string): Promise<Couple | undefined> => {
    try {
        const response = await api.get('/couples/info');
        return response.data.couple;
    } catch {
        return undefined;
    }
};

export const pairUsers = async (currentUserId: string, partnerPairingCode: string): Promise<{ currentUser: User, partner: User }> => {
    try {
        const response = await api.post('/couples/pair', { pairingCode: partnerPairingCode });
        const { currentUser, partner } = response.data;
        
        // Update stored user data
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        
        return { currentUser, partner };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Pairing failed');
    }
};

// --- Journal Functions ---

export const createJournalEntry = async (coupleId: string): Promise<JournalEntry> => {
    try {
        const response = await api.post('/journals/create');
        return {
            id: response.data.journalEntry.id,
            coupleId: response.data.journalEntry.coupleId,
            date: response.data.journalEntry.createdAt,
            partner1Chat: [],
            partner2Chat: []
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to create journal entry');
    }
};

export const getJournalEntry = async (journalId: string): Promise<JournalEntry | undefined> => {
    try {
        const response = await api.get(`/journals/${journalId}`);
        const journal = response.data.journalEntry;
        
        return {
            id: journal._id,
            coupleId: journal.coupleId,
            date: journal.createdAt,
            partner1Chat: journal.partner1Chat || [],
            partner2Chat: journal.partner2Chat || [],
            analysis: journal.analysis
        };
    } catch {
        return undefined;
    }
};

export const updateJournalEntry = async (journalId: string, data: { partner1Chat?: Message[], partner2Chat?: Message[], analysis?: AnalysisResult }): Promise<JournalEntry> => {
    try {
        // Update chat messages
        if (data.partner1Chat || data.partner2Chat) {
            const messages = data.partner1Chat || data.partner2Chat || [];
            await api.put(`/journals/${journalId}/chat`, { messages });
        }
        
        // Get updated entry
        const journal = await getJournalEntry(journalId);
        if (!journal) {
            throw new Error('Journal entry not found');
        }
        
        return journal;
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to update journal entry');
    }
};
