import type { Dialog } from './schema';

// NPC scripts. Max 140 characters per page and 3 pages per turn. Nothing
// here is the only place a portfolio fact lives (UX-GUIDELINES.md §9.1).
export const dialogs: Dialog[] = [
  {
    id: 'guide-intro',
    speaker: 'Wren',
    lines: [
      'Welcome to Arkan Journey. I’m Wren, and this little town is Arizal Arkan’s portfolio.',
      'Each building holds a chapter: his story, his quests (projects), his skills, his work history, and a post office.',
      'Walk with WASD or tap the ground. Short on time? Press M for Fast Travel.',
    ],
    repeatLines: [
      'Good to see you again. Press M for Fast Travel, or Q to see what you haven’t visited.',
    ],
  },
  {
    id: 'guide-returning',
    speaker: 'Wren',
    lines: ['Welcome back to Arkan Journey. Your progress is right where you left it.'],
  },
  {
    id: 'guide-idle-hint',
    speaker: 'Wren',
    lines: ['Not sure where to start? The Guild Hall to the north tells you who Arkan is.'],
  },
  {
    id: 'guide-ending',
    speaker: 'Wren',
    lines: [
      'You’ve seen the whole town. That’s every chapter of Arkan’s story so far.',
      'If he sounds like the engineer you need, the Post Office is open.',
    ],
  },
];

/** Loading tips: useful, 80 characters or fewer (UX-GUIDELINES.md §2.3). */
export const loadingTips: string[] = [
  'Press M for Fast Travel. Every location is one menu away.',
  'In a hurry? Quick Read has everything on one page.',
  'Click a building and the hero walks there on his own.',
  'Press Q to see what you haven’t visited yet.',
  'Arkan has shipped in banking, e-commerce, streaming, telco and audit.',
];
