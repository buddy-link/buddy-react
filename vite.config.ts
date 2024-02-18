// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Import Vitest's plugin
import { defineConfig as defineVitestConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest test configurations
    globals: true,
    environment: 'jsdom',
  },
  ...defineVitestConfig({
    // Optional Vitest specific configurations
  })
});
