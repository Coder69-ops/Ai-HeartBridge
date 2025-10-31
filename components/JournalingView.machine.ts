import { createMachine, assign } from 'xstate';
import { Message, User } from '../types';
import { completeJournalReflection, JournalSessionStatus } from '../services/journalSessionService';

export const journalingMachine = createMachine({
  id: 'journaling',
  initial: 'idle',
  context: {
    user: null as User | null,
    partner: null as User | null,
    sessionId: null as string | null,
    userChat: [] as Message[],
    partnerChat: [] as Message[],
    insights: null as string | null,
    error: null as string | null,
  },
  states: {
    idle: {
      on: {
        START_JOURNALING: 'journaling',
      },
    },
    journaling: {
      initial: 'userReflection',
      states: {
        userReflection: {
          on: {
            COMPLETE_REFLECTION: 'completingReflection',
          },
        },
        completingReflection: {
          invoke: {
            src: 'completeReflection',
            onDone: 'waitingForPartner',
            onError: 'userReflection',
          },
        },
        waitingForPartner: {
          on: {
            PARTNER_COMPLETED: 'generatingInsights',
          },
        },
        generatingInsights: {
          invoke: {
            src: 'generateInsights',
            onDone: 'insightsReady',
            onError: 'insightsFailed',
          },
        },
        insightsReady: {
          type: 'final',
        },
        insightsFailed: {
          on: {
            RETRY: 'generatingInsights',
          },
        },
      },
    },
  },
  services: {
    completeReflection: (context, event) => {
      return completeJournalReflection(context.sessionId!, event.chatHistory);
    },
    generateInsights: (context) => {
      return generateInsights(context.sessionId!);
    },
  },
});
