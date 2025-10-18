import api from './apiClient';
import { Exercise } from '../types';

export interface ExerciseProgress {
  id: string;
  exerciseId: string;
  completedBy: string[];
  rating?: number;
  feedback?: string;
  dateCompleted: string;
  timeSpent?: number;
}

// Get all exercises
export const getExercises = async (filters?: {
  category?: string;
  framework?: string;
  difficulty?: string;
}): Promise<Exercise[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.framework) params.append('framework', filters.framework);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);

    const response = await api.get(`/exercises?${params}`);
    return response.data.exercises;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch exercises');
  }
};

// Get exercise by ID
export const getExerciseById = async (exerciseId: string): Promise<{
  exercise: Exercise;
  progress: ExerciseProgress[];
}> => {
  try {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch exercise');
  }
};

// Complete exercise
export const completeExercise = async (
  exerciseId: string,
  data: {
    rating?: number;
    feedback?: string;
    timeSpent?: number;
  }
): Promise<ExerciseProgress> => {
  try {
    const response = await api.post(`/exercises/${exerciseId}/complete`, data);
    return response.data.progress;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to complete exercise');
  }
};

// Get exercise categories and metadata
export const getExerciseMetadata = async (): Promise<{
  categories: string[];
  frameworks: string[];
  difficulties: string[];
}> => {
  try {
    const response = await api.get('/exercises/meta/categories');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch exercise metadata');
  }
};

// Get couple's exercise progress
export const getCoupleExerciseProgress = async (page = 1, limit = 10): Promise<{
  progress: ExerciseProgress[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}> => {
  try {
    const response = await api.get(`/exercises/couple/progress?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Failed to fetch exercise progress');
  }
};