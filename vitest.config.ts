import { defineConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // Add Vite plugins here if needed
  ],
  test: {
    globals: true,
    environment: 'jsdom', // or 'node' depending on your project needs
    // Additional Vitest configurations can go here
  },
});
