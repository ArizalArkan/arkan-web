import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/game/**', 'src/services/**', 'src/ui/primitives/**', 'src/ui/patterns/**'],
      exclude: ['**/*.test.{ts,tsx}', '**/index.ts'],
      thresholds: {
        'src/game/**': { lines: 90, statements: 90 },
        'src/services/**': { lines: 80, statements: 80 },
        'src/ui/primitives/**': { lines: 70, statements: 70 },
        'src/ui/patterns/**': { lines: 70, statements: 70 },
      },
    },
  },
});
