import { create } from 'zustand';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: string;
  duration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string[];
  completedAt?: Date;
  rating?: number;
  notes?: string;
  type?: string;
  icon?: string;
  steps?: string[];
}

export interface MoodEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  anxiety: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  date: Date;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'wellness' | 'therapy' | 'lifestyle' | 'relationships' | 'career';
  targetDate?: Date;
  completed: boolean;
  progress: number; // 0-100
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  createdAt: Date;
}

interface AppState {
  // Data
  journalEntries: JournalEntry[];
  exercises: Exercise[];
  moodEntries: MoodEntry[];
  goals: Goal[];
  
  // UI State
  currentView: 'dashboard' | 'journal' | 'exercises' | 'checkin' | 'trends' | 'profile' | 'chat' | 'partner-chat' | 'pairing' | 'safety';
  isLoading: boolean;
  error: string | null;
  
  // Modal states
  showJournalModal: boolean;
  showExerciseModal: boolean;
  showMoodModal: boolean;
  showGoalModal: boolean;
  showSafetyModal: boolean;
  
  // Selected items
  selectedJournalEntry: JournalEntry | null;
  selectedExercise: Exercise | null;
  selectedGoal: Goal | null;
  currentJournalId: string | null;
  
  // Actions
  setCurrentView: (view: AppState['currentView']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  toggleSafetyModal: (show?: boolean) => void;
  
  // Journal actions
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  setSelectedJournalEntry: (entry: JournalEntry | null) => void;
  setCurrentJournalId: (id: string | null) => void;
  toggleJournalModal: (show?: boolean) => void;
  
  // Exercise actions
  completeExercise: (id: string, rating: number, notes?: string) => void;
  setSelectedExercise: (exercise: Exercise | null) => void;
  toggleExerciseModal: (show?: boolean) => void;
  
  // Mood actions
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'date'>) => void;
  updateMoodEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  toggleMoodModal: (show?: boolean) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed' | 'progress'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalCompletion: (id: string) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  toggleMilestone: (goalId: string, milestoneId: string) => void;
  setSelectedGoal: (goal: Goal | null) => void;
  toggleGoalModal: (show?: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial data
  journalEntries: [],
  exercises: [],
  moodEntries: [],
  goals: [],
  
  // Initial UI state
  currentView: 'dashboard',
  isLoading: false,
  error: null,
  
  // Initial modal states
  showJournalModal: false,
  showExerciseModal: false,
  showMoodModal: false,
  showGoalModal: false,
  showSafetyModal: false,
  
  // Initial selected items
  selectedJournalEntry: null,
  selectedExercise: null,
  selectedGoal: null,
  currentJournalId: null,
  
  // Basic actions
  setCurrentView: (view) => set({ currentView: view }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  toggleSafetyModal: (show) => set((state) => ({ showSafetyModal: show !== undefined ? show : !state.showSafetyModal })),
  
  // Journal actions
  setCurrentJournalId: (id) => set({ currentJournalId: id }),
  
  // Journal actions
  addJournalEntry: (entryData) => {
    const entry: JournalEntry = {
      ...entryData,
      id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      journalEntries: [entry, ...state.journalEntries],
    }));
  },
  
  updateJournalEntry: (id, updates) => {
    set((state) => ({
      journalEntries: state.journalEntries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date() }
          : entry
      ),
    }));
  },
  
  deleteJournalEntry: (id) => {
    set((state) => ({
      journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
    }));
  },
  
  setSelectedJournalEntry: (entry) => set({ selectedJournalEntry: entry }),
  toggleJournalModal: (show) => set((state) => ({ 
    showJournalModal: show !== undefined ? show : !state.showJournalModal 
  })),
  
  // Exercise actions
  completeExercise: (id, rating, notes) => {
    set((state) => ({
      exercises: state.exercises.map((exercise) =>
        exercise.id === id
          ? { ...exercise, completedAt: new Date(), rating, notes }
          : exercise
      ),
    }));
  },
  
  setSelectedExercise: (exercise) => set({ selectedExercise: exercise }),
  toggleExerciseModal: (show) => set((state) => ({ 
    showExerciseModal: show !== undefined ? show : !state.showExerciseModal 
  })),
  
  // Mood actions
  addMoodEntry: (entryData) => {
    const entry: MoodEntry = {
      ...entryData,
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
    };
    set((state) => ({
      moodEntries: [entry, ...state.moodEntries],
    }));
  },
  
  updateMoodEntry: (id, updates) => {
    set((state) => ({
      moodEntries: state.moodEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  },
  
  deleteMoodEntry: (id) => {
    set((state) => ({
      moodEntries: state.moodEntries.filter((entry) => entry.id !== id),
    }));
  },
  
  toggleMoodModal: (show) => set((state) => ({ 
    showMoodModal: show !== undefined ? show : !state.showMoodModal 
  })),
  
  // Goal actions
  addGoal: (goalData) => {
    const goal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      progress: 0,
      createdAt: new Date(),
    };
    set((state) => ({
      goals: [goal, ...state.goals],
    }));
  },
  
  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    }));
  },
  
  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    }));
  },
  
  toggleGoalCompletion: (id) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id 
          ? { ...goal, completed: !goal.completed, progress: goal.completed ? 0 : 100 }
          : goal
      ),
    }));
  },
  
  updateGoalProgress: (id, progress) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id 
          ? { ...goal, progress, completed: progress >= 100 }
          : goal
      ),
    }));
  },
  
  toggleMilestone: (goalId, milestoneId) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              milestones: goal.milestones.map((milestone) =>
                milestone.id === milestoneId
                  ? {
                      ...milestone,
                      completed: !milestone.completed,
                      completedAt: !milestone.completed ? new Date() : undefined,
                    }
                  : milestone
              ),
            }
          : goal
      ),
    }));
  },
  
  setSelectedGoal: (goal) => set({ selectedGoal: goal }),
  toggleGoalModal: (show) => set((state) => ({ 
    showGoalModal: show !== undefined ? show : !state.showGoalModal 
  })),
}));