import type { Rarity, Skill, SkillSlot } from './schema';

// Skill list comes from the CV. Rarity follows the definitions in
// PRODUCT.md §7.4 and is only set where the CV's work history backs it up;
// everything else stays null ("Unranked") until the owner rates it.
// TODO(owner): confirm the derived rarities and rate the null ones.
export const skills: Skill[] = [
  // Frontend
  {
    id: 'javascript',
    name: 'JavaScript',
    slot: 'frontend',
    rarity: 'legendary',
    provenBy: ['bank-saqu', 'ruparupa', 'vision-plus', 'my-indihome', 'palapa-one'],
  },
  {
    id: 'react',
    name: 'React.js',
    slot: 'frontend',
    rarity: 'legendary',
    provenBy: ['bank-saqu', 'vision-plus', 'my-indihome', 'dataexchange', 'palapa-one'],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    slot: 'frontend',
    rarity: 'epic',
    provenBy: ['altaraone', 'ruparupa'],
  },
  {
    id: 'react-native',
    name: 'React Native',
    slot: 'frontend',
    rarity: 'rare',
    provenBy: ['bank-saqu'],
  },
  { id: 'typescript', name: 'TypeScript', slot: 'frontend', rarity: null, provenBy: [] },
  { id: 'vue', name: 'Vue.js', slot: 'frontend', rarity: null, provenBy: [] },
  { id: 'nuxt', name: 'Nuxt.js', slot: 'frontend', rarity: null, provenBy: [] },
  { id: 'tanstack', name: 'TanStack', slot: 'frontend', rarity: null, provenBy: [] },
  { id: 'redwoodjs', name: 'RedwoodJS', slot: 'frontend', rarity: null, provenBy: [] },

  // Backend
  { id: 'express', name: 'Express.js', slot: 'backend', rarity: 'rare', provenBy: ['ruparupa'] },
  { id: 'nestjs', name: 'Nest.js', slot: 'backend', rarity: 'rare', provenBy: ['ruparupa'] },
  {
    id: 'socket-io',
    name: 'Socket.io',
    slot: 'backend',
    rarity: 'rare',
    provenBy: ['my-indihome'],
  },
  { id: 'nodejs', name: 'Node.js', slot: 'backend', rarity: null, provenBy: ['ruparupa'] },
  { id: 'golang', name: 'Golang', slot: 'backend', rarity: null, provenBy: [] },
  { id: 'echo', name: 'Echo', slot: 'backend', rarity: null, provenBy: [] },

  // Database
  { id: 'postgresql', name: 'PostgreSQL', slot: 'database', rarity: null, provenBy: [] },
  { id: 'mongodb', name: 'MongoDB', slot: 'database', rarity: null, provenBy: [] },

  // Tools
  { id: 'vite', name: 'Vite', slot: 'tools', rarity: null, provenBy: [] },
  { id: 'webpack', name: 'Webpack', slot: 'tools', rarity: null, provenBy: [] },
  { id: 'babel', name: 'Babel.js', slot: 'tools', rarity: null, provenBy: [] },
];

export const slotLabels: Record<SkillSlot, { name: string; equipment: string }> = {
  frontend: { name: 'Frontend', equipment: 'Weapons' },
  backend: { name: 'Backend', equipment: 'Shields' },
  database: { name: 'Database', equipment: 'Armor' },
  tools: { name: 'Tools', equipment: 'Accessories' },
};

export const rarityMeaning: Record<Rarity, string> = {
  legendary: 'Used daily for years, in production, and can teach it to others.',
  epic: 'Used in several production projects.',
  rare: 'Used in a real project.',
  common: 'Currently learning, or used in personal projects.',
};
