import { copy } from '@/content/copy';

// Contact form rules (PRODUCT.md §7.7, UX-GUIDELINES.md §6).

export type ContactFields = { name: string; email: string; message: string };
export type ContactField = keyof ContactFields;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  messageMin: 10,
  messageMax: 2000,
} as const;

export const RATE_LIMIT_MS = 30_000;

// Deliberately simple: one @, something on both sides, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateField = (field: ContactField, raw: string): string | undefined => {
  const value = raw.trim();
  const { errors } = copy.contact;
  switch (field) {
    case 'name':
      if (!value) return errors.nameRequired;
      if (value.length < LIMITS.nameMin || value.length > LIMITS.nameMax) return errors.nameLength;
      return undefined;
    case 'email':
      return EMAIL_PATTERN.test(value) ? undefined : errors.emailInvalid;
    case 'message':
      if (value.length < LIMITS.messageMin) return errors.messageShort;
      if (value.length > LIMITS.messageMax) return errors.messageLong;
      return undefined;
  }
};

export const validateContact = (fields: ContactFields): ContactErrors => {
  const result: ContactErrors = {};
  for (const field of ['name', 'email', 'message'] as const) {
    const error = validateField(field, fields[field]);
    if (error) result[field] = error;
  }
  return result;
};

export const secondsUntilAllowed = (lastSentAt: number | null, now: number) =>
  lastSentAt === null ? 0 : Math.max(0, Math.ceil((lastSentAt + RATE_LIMIT_MS - now) / 1000));
