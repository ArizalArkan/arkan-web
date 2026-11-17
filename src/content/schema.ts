import { z } from 'zod';
import { LOCATION_IDS, RARITIES, SKILL_SLOTS, WINDOW_IDS } from './ids';

// Schemas run in tests (content validation, QA-CHECKLIST A11). Runtime code
// imports types from here and id lists from ./ids, never the schemas.
export * from './ids';

export type SkillId = string;

// ---------- schemas ----------

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be a kebab-case slug');
// Owner copy rule: no em dashes, no unfilled template placeholders.
const text = z
  .string()
  .min(1)
  .refine((value) => !value.includes('—'), 'em dash is not allowed in copy')
  .refine((value) => !/\{\{.*\}\}|lorem ipsum/i.test(value), 'placeholder text left in copy');

export const linkSchema = z.object({
  label: text,
  href: z.string().regex(/^(https:\/\/|mailto:|tel:)/, 'must be https, mailto or tel'),
});

export const mediaSchema = z.object({
  src: z.string().startsWith('/'),
  alt: text,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type Media = z.infer<typeof mediaSchema>;

export const questSchema = z.object({
  id: slug,
  title: text,
  tagline: text,
  year: z.number().int().min(2000).max(2100),
  period: text,
  role: text,
  rank: z.enum(['S', 'A', 'B', 'C']),
  summary: text,
  problem: text,
  solution: z.array(text).min(1),
  /** null = the owner has not supplied a measurable result yet. */
  outcome: text.nullable(),
  stack: z.array(slug).min(1),
  tags: z.array(text),
  links: z.array(linkSchema.extend({ kind: z.enum(['demo', 'repo', 'article']) })),
  media: z.array(mediaSchema),
  featured: z.boolean().optional(),
});
export type Quest = z.infer<typeof questSchema>;

export const skillSchema = z.object({
  id: slug,
  name: text,
  slot: z.enum(SKILL_SLOTS),
  /** null = not yet rated by the owner; shown as "Unranked". */
  rarity: z.enum(RARITIES).nullable(),
  /** Quest ids that prove the skill (PRODUCT.md §7.4). */
  provenBy: z.array(slug),
});
export type Skill = z.infer<typeof skillSchema>;

export const experienceSchema = z.object({
  id: slug,
  company: text,
  product: text,
  productTagline: text,
  period: text,
  isCurrent: z.boolean(),
  /** Matching quest, if the product is also on the Quest Board. */
  questId: slug.nullable(),
  roles: z
    .array(
      z.object({
        title: text,
        period: text,
        achievements: z.array(text).min(1),
      }),
    )
    .min(1),
});
export type Experience = z.infer<typeof experienceSchema>;

export const educationSchema = z.object({ school: text, program: text, period: text });
export type Education = z.infer<typeof educationSchema>;

export const profileSchema = z.object({
  name: text,
  shortName: text,
  role: text,
  heroClass: text,
  tagline: text,
  bio: z.array(text).min(2).max(3),
  location: text,
  availability: text,
  portrait: mediaSchema,
  stats: z.array(z.object({ label: text, value: text })).min(1),
  industries: z.array(text),
  email: z.string().email(),
  phone: z.object({ label: text, href: z.string().startsWith('tel:') }),
  links: z.array(linkSchema.extend({ id: slug })),
  /** null until the owner supplies public/cv.pdf. */
  cv: z.object({ href: z.string().startsWith('/'), fileName: text }).nullable(),
  certifications: z.array(text),
});
export type Profile = z.infer<typeof profileSchema>;

const vec3 = z.tuple([z.number(), z.number(), z.number()]);
const rect = z.object({ x: z.number(), z: z.number(), w: z.number(), d: z.number() });
export type Rect = z.infer<typeof rect>;

export const locationSchema = z.object({
  id: z.enum(LOCATION_IDS),
  /** Themed name, e.g. "Guild Hall". */
  name: text,
  /** Literal meaning, e.g. "About" (UX-GUIDELINES.md §1.4). */
  literal: text,
  window: z.enum(WINDOW_IDS),
  route: z.string().startsWith('/'),
  kind: z.enum(['building', 'board']),
  /** Center of the structure on the ground. */
  position: vec3,
  /** Solid area on the collision grid, centered on position. */
  footprint: z.object({ w: z.number().positive(), d: z.number().positive() }),
  /** Where the hero stands to interact / arrives by Fast Travel. */
  door: vec3,
  zoneRadius: z.number().positive(),
  prompt: text,
  cameraFocus: z.object({ offset: vec3 }).optional(),
});
export type Location = z.infer<typeof locationSchema>;

export const npcSchema = z.object({
  id: slug,
  name: text,
  position: vec3,
  dialogId: slug,
  behavior: z.enum(['idle', 'wander', 'patrol']),
});
export type NpcDef = z.infer<typeof npcSchema>;

export const worldSchema = z.object({
  name: text,
  /** World bounds in units; x from -w/2..w/2, z from -d/2..d/2. */
  size: z.object({ w: z.number().positive(), d: z.number().positive() }),
  spawn: vec3,
  locations: z.array(locationSchema).length(LOCATION_IDS.length),
  npcs: z.array(npcSchema),
  /** Extra solid rectangles: fountain, gate posts, trees. */
  obstacles: z.array(rect.extend({ id: slug })),
  lanterns: z.array(z.object({ position: vec3, castLight: z.boolean() })),
  signpost: z.object({ position: vec3 }),
});
export type World = z.infer<typeof worldSchema>;

const dialogLine = text.max(140, 'dialog page must be 140 characters or fewer');
export const dialogSchema = z.object({
  id: slug,
  speaker: text,
  /** Max 3 pages per turn (UX-GUIDELINES.md §9.1). */
  lines: z.array(dialogLine).min(1).max(3),
  /** Shorter version shown once the visitor has read it. */
  repeatLines: z.array(dialogLine).min(1).max(2).optional(),
});
export type Dialog = z.infer<typeof dialogSchema>;
