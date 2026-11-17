import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { palette } from './theme';

const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const toTokenName = (key: string) => key.replace(/([a-z])(\d)/, '$1-$2');

describe('world theme', () => {
  it.each(Object.entries(palette))('%s matches tokens.css', (key, hex) => {
    const match = tokensCss.match(
      new RegExp(`--color-${toTokenName(key)}:\\s*(#[0-9a-f]{6})`, 'i'),
    );
    expect(match?.[1]?.toLowerCase()).toBe(hex.toLowerCase());
  });
});
