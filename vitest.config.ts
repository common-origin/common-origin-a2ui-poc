import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Tests that need jsdom use the // @vitest-environment jsdom directive
    setupFiles: ['./src/test-setup.ts'],
    // Inline DS deps so Vite resolves React/styled-components through our aliases
    deps: {
      optimizer: {
        web: {
          include: ['@common-origin/design-system', 'styled-components'],
        },
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/**/*.render.test.*', 'src/**/*.d.ts', 'src/test-setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@/src': path.resolve(__dirname, 'src'),
      // Force single React instance — DS bundles its own React which causes
      // "Cannot read properties of null (reading 'useState')" in tests
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', 'styled-components'],
  },
});
