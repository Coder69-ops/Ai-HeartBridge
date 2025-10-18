import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Exercise } from '../models/Exercise';

dotenv.config();

const exercises = [
  {
    title: 'The Appreciation Ritual',
    category: 'Connection',
    icon: 'heart',
    description: 'A daily practice to build a culture of appreciation by sharing genuine, specific things you appreciate about each other.',
    steps: [
      'Set aside 5-10 minutes each day, perhaps before bed or in the morning.',
      'Take turns sharing at least one thing you genuinely appreciate about your partner from the past 24 hours.',
      'Be specific. Instead of "Thanks for being nice," try "I really appreciated it when you made me coffee this morning; it made me feel cared for."',
      'The person receiving the appreciation should simply say "Thank you." Avoid dismissing or downplaying the compliment.'
    ],
    duration: 10,
    difficulty: 'beginner',
    tags: ['appreciation', 'daily', 'gratitude'],
    framework: 'Gottman'
  },
  {
    title: 'The Gentle Start-Up',
    category: 'Conflict Resolution',
    icon: 'sparkles',
    description: 'Learn to raise issues gently, without blame or criticism, to increase the chances of a productive conversation.',
    steps: [
      'Start with "I feel..." statements. For example, "I feel worried..." instead of "You are so...".',
      'Describe what is happening without judgment. "I noticed the trash wasn\'t taken out" instead of "You never take out the trash."',
      'State a positive need. "...and I need some help keeping the house tidy."',
      'Make a clear request. "Would you be willing to take out the trash now?"'
    ],
    duration: 15,
    difficulty: 'intermediate',
    tags: ['communication', 'conflict', 'gottman'],
    framework: 'Gottman'
  },
  {
    title: 'The State of the Union',
    category: 'Communication',
    icon: 'users',
    description: 'A weekly check-in to discuss what went well, what was challenging, and to share appreciation, creating a safe space for ongoing communication.',
    steps: [
      'Schedule a recurring, protected time each week (e.g., Sunday evening for 30 minutes).',
      'Take turns as the speaker and listener. Speaker, use a gentle start-up to raise one issue.',
      'Listener, your job is to listen, not to problem-solve. Summarize what you heard and ask "Did I get that right?"',
      'Validate your partner\'s feelings. "It makes sense to me that you would feel that way."',
      'Once both partners feel understood, you can move on to brainstorming solutions together.'
    ],
    duration: 30,
    difficulty: 'intermediate',
    tags: ['weekly', 'communication', 'check-in'],
    framework: 'Gottman'
  },
  {
    title: 'Nonviolent Communication Practice',
    category: 'Communication',
    icon: 'lightbulb',
    description: 'Practice the four components of NVC: Observation, Feelings, Needs, and Requests to improve understanding.',
    steps: [
      'Choose a recent situation that caused tension between you.',
      'Partner A shares using NVC format: "When I observed [specific behavior], I felt [emotion] because I need [underlying need]. Would you be willing to [specific request]?"',
      'Partner B reflects back what they heard before responding.',
      'Partner B then shares their perspective using the same NVC format.',
      'Work together to find solutions that meet both partners\' needs.'
    ],
    duration: 20,
    difficulty: 'intermediate',
    tags: ['nvc', 'feelings', 'needs', 'requests'],
    framework: 'NVC'
  },
  {
    title: 'Emotional Check-In',
    category: 'Emotional Connection',
    icon: 'heart',
    description: 'A simple exercise to stay connected with each other\'s emotional world.',
    steps: [
      'Sit facing each other without distractions.',
      'Take turns sharing: "Right now I\'m feeling..." and name the emotion.',
      'Share what might be contributing to that feeling.',
      'The listening partner reflects: "I hear that you\'re feeling... because..."',
      'Offer support: "What do you need from me right now?"'
    ],
    duration: 10,
    difficulty: 'beginner',
    tags: ['emotions', 'connection', 'support'],
    framework: 'EFT'
  },
  {
    title: 'The Stress-Reducing Conversation',
    category: 'Support',
    icon: 'users',
    description: 'Help each other manage external stress without trying to solve each other\'s problems.',
    steps: [
      'Set a timer for 10 minutes each (20 minutes total).',
      'Partner A shares about their current stress or challenges.',
      'Partner B listens without offering advice, just understanding and validation.',
      'Partner B can ask: "How are you feeling about this?" or "What\'s the hardest part?"',
      'Switch roles after 10 minutes.',
      'End with appreciation for sharing and listening.'
    ],
    duration: 20,
    difficulty: 'beginner',
    tags: ['stress', 'support', 'listening'],
    framework: 'Gottman'
  },
  {
    title: 'Love Map Building',
    category: 'Connection',
    icon: 'heart',
    description: 'Deepen your knowledge of your partner\'s inner world, dreams, and daily experiences.',
    steps: [
      'Ask your partner: "What\'s been on your mind lately that I might not know about?"',
      'Share something new about your childhood, a dream, or a worry.',
      'Ask about their current stressors, hopes, or something they\'re excited about.',
      'Listen with curiosity, not judgment.',
      'End by appreciating what you learned about each other.'
    ],
    duration: 15,
    difficulty: 'beginner',
    tags: ['intimacy', 'knowledge', 'dreams'],
    framework: 'Gottman'
  },
  {
    title: 'Repair Attempt Practice',
    category: 'Conflict Resolution',
    icon: 'arrow-uturn-left',
    description: 'Learn to recognize and make repair attempts during heated discussions.',
    steps: [
      'Think of a recent argument or tension.',
      'Identify where the conversation went wrong.',
      'Practice repair phrases: "I\'m feeling overwhelmed, can we take a break?" or "I\'m sorry, let me try again."',
      'Take turns practicing these phrases.',
      'Agree on a signal you can use in real conversations to call for a repair.'
    ],
    duration: 15,
    difficulty: 'advanced',
    tags: ['repair', 'conflict', 'de-escalation'],
    framework: 'Gottman'
  },
  {
    title: 'Attachment Dialogue',
    category: 'Emotional Connection',
    icon: 'heart',
    description: 'Explore attachment needs and fears to create deeper emotional bonds.',
    steps: [
      'Partner A shares: "When we argue, I sometimes feel..." (afraid, alone, rejected, etc.)',
      'Continue: "What I need most from you in those moments is..."',
      'Partner B reflects what they heard and validates the feeling.',
      'Partner B then shares their own attachment feelings and needs.',
      'Discuss how you can support each other\'s attachment needs going forward.'
    ],
    duration: 25,
    difficulty: 'advanced',
    tags: ['attachment', 'vulnerability', 'safety'],
    framework: 'EFT'
  },
  {
    title: 'Gratitude Jar',
    category: 'Connection',
    icon: 'sparkles',
    description: 'Create an ongoing practice of noticing and celebrating the good in your relationship.',
    steps: [
      'Get a jar or container and place it somewhere visible.',
      'Throughout the week, write small notes about things you appreciate about your partner.',
      'Include specific moments, qualities, or actions.',
      'Every Sunday, read the notes from the week together.',
      'Take turns reading them aloud and saying thank you.'
    ],
    duration: 10,
    difficulty: 'beginner',
    tags: ['gratitude', 'appreciation', 'weekly'],
    framework: 'General'
  }
];

const seedExercises = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing exercises
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises');

    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`Seeded ${exercises.length} exercises`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedExercises();
}

export { seedExercises };