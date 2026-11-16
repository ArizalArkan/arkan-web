import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('keeps a custom font size and a color together', () => {
    expect(cn('text-body-md', 'text-gold-400')).toBe('text-body-md text-gold-400');
  });

  it('lets the last font size win', () => {
    expect(cn('text-body-md', 'text-ui-sm')).toBe('text-ui-sm');
  });

  it('drops falsy values', () => {
    expect(cn('p-4', false, undefined, 'm-2')).toBe('p-4 m-2');
  });
});
