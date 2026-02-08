import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/vitest-setup.ts'],
    testTimeout: 10000,
  },
  resolve: {
    extensions: ['.ts'],
  },
});
