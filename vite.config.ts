import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// WEB=1 builds the self-hosted web bundle (served from the server root, talking
// to /api). The default build targets the Electron renderer (loaded over
// file://, so it needs relative asset paths).
const isWeb = process.env.WEB === '1';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/renderer'),
  base: isWeb ? '/' : './',
  build: {
    outDir: resolve(__dirname, isWeb ? 'dist/web' : 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    // In `WEB=1 vite dev`, proxy API calls to the running server.
    proxy: isWeb ? { '/api': 'http://localhost:8787' } : undefined,
  },
});