import { defineConfig } from 'vitest/config';

// Standalone config. Kept separate from vite.config.ts so the test runner
// (which bundles its own Vite) never has to load the app's ESM build config.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Exclude macOS AppleDouble metadata files (created on non-HFS volumes).
    exclude: ['**/node_modules/**', '**/dist/**', '**/._*'],
  },
});
