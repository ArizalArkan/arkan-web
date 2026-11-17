import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// Layer boundaries from ARCHITECTURE.md §3. Files in `layer` may not import
// anything matching `banned` (aliases) or `packages` (npm modules).
const layerRules = [
  {
    layer: 'content',
    banned: ['@/game/*', '@/world/*', '@/ui/*', '@/services/*', '@/app/*'],
    packages: ['react', 'three', '@react-three/*', 'zustand'],
  },
  {
    layer: 'game',
    banned: ['@/world/*', '@/ui/*', '@/app/*'],
    packages: ['react', 'react-dom', 'three', '@react-three/*'],
  },
  { layer: 'world', banned: ['@/ui/*', '@/app/*'], packages: [] },
  {
    layer: 'ui',
    banned: ['@/world/*', '@/app/*'],
    packages: ['three', '@react-three/*'],
  },
  {
    layer: 'services',
    banned: ['@/world/*', '@/ui/*', '@/app/*', '@/game/*'],
    packages: ['react', 'three', '@react-three/*'],
  },
  {
    layer: 'lib',
    banned: ['@/world/*', '@/ui/*', '@/app/*', '@/game/*', '@/content/*', '@/services/*'],
    packages: ['three', '@react-three/*'],
  },
];

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx,js}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Named exports only (ARCHITECTURE.md §12.1).',
        },
      ],
    },
  },
  ...layerRules.map(({ layer, banned, packages }) => ({
    files: [`src/${layer}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [...banned, ...packages],
              message: `src/${layer} may not import this (ARCHITECTURE.md §3).`,
            },
          ],
        },
      ],
    },
  })),
  {
    // Config files and lazy-loaded app entries need a default export.
    files: [
      '*.config.{ts,js}',
      'src/app/AdventureApp.tsx',
      'src/app/QuickReadApp.tsx',
      'src/app/ComponentCatalog.tsx',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**', 'e2e/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);
