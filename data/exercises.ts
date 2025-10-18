
import { Exercise } from '../types';
import { getExercises } from '../services/exerciseService';

// This will be replaced by API calls
export let exercises: Exercise[] = [];

// Load exercises from API
export const loadExercises = async (): Promise<Exercise[]> => {
  try {
    exercises = await getExercises();
    return exercises;
  } catch (error) {
    console.error('Failed to load exercises:', error);
    // Fallback to static data if API fails
    exercises = [
      {
        id: 'e1',
        title: 'The Appreciation Ritual',
        category: 'Connection',
        icon: 'heart',
        description: 'A daily practice to build a culture of appreciation by sharing genuine, specific things you appreciate about each other.',
        steps: [
          'Set aside 5-10 minutes each day, perhaps before bed or in the morning.',
          'Take turns sharing at least one thing you genuinely appreciate about your partner from the past 24 hours.',
          'Be specific. Instead of "Thanks for being nice," try "I really appreciated it when you made me coffee this morning; it made me feel cared for."',
          'The person receiving the appreciation should simply say "Thank you." Avoid dismissing or downplaying the compliment.',
        ],
      },
      {
        id: 'e2',
        title: 'The Gentle Start-Up',
        category: 'Conflict',
        icon: 'sparkles',
        description: "Learn to raise issues gently, without blame or criticism, to increase the chances of a productive conversation.",
        steps: [
          'Start with "I feel..." statements. For example, "I feel worried..." instead of "You are so...".',
          'Describe what is happening without judgment. "I noticed the trash wasn\'t taken out" instead of "You never take out the trash."',
          'State a positive need. "...and I need some help keeping the house tidy."',
          'Make a clear request. "Would you be willing to take out the trash now?"',
        ],
      },
      {
        id: 'e3',
        title: 'The State of the Union',
        category: 'Communication',
        icon: 'users',
        description: 'A weekly check-in to discuss what went well, what was challenging, and to share appreciation, creating a safe space for ongoing communication.',
        steps: [
          'Schedule a recurring, protected time each week (e.g., Sunday evening for 30 minutes).',
          'Take turns as the speaker and listener. Speaker, use a gentle start-up to raise one issue.',
          'Listener, your job is to listen, not to problem-solve. Summarize what you heard and ask "Did I get that right?"',
          'Validate your partner\'s feelings. "It makes sense to me that you would feel that way."',
          'Once both partners feel understood, you can move on to brainstorming solutions together.',
        ],
      },
    ];
    return exercises;
  }
};
