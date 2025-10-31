
import { AnalysisResult, Message } from '../types';
import api from './apiClient';

/**
 * Gets a response from the chatbot for the journaling session.
 */
export const getChatbotResponse = async (history: Message[]): Promise<string> => {
    try {
        const response = await api.post('/journal-sessions/chat-response', { 
            messageHistory: history 
        });
        return response.data.message;
    } catch (error: any) {
        console.error('Chatbot error:', error);
        throw new Error(error.response?.data?.error || 'Failed to get chatbot response');
    }
};

/**
 * Analyzes journal entries from both partners to provide insights.
 */
export const analyzeEntries = async (coupleId: string, journalId: string): Promise<AnalysisResult> => {
    try {
        const response = await api.get(`/journal-sessions/${journalId}/insights`);
        return response.data;
    } catch (error: any) {
        console.error('Analysis error:', error);
        throw new Error(error.response?.data?.error || 'Failed to analyze journal entry');
    }
};
