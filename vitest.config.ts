import { defineConfig } from 'vitest/config';

// Standalone config so vitest does not try to load the app's Vite 8 (ESM-only)
// build config, which its bundled Vite cannot require().
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Exclude macOS AppleDouble metadata files (created on non-HFS volumes).
    exclude: ['**/node_modules/**', '**/dist/**', '**/._*'],
  },
});
