import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node', // server actions run in node
    exclude: ['playwright-tests/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 80,
        lines: 80,
      },
    },
  },
});
