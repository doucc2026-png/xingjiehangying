import { defineConfig } from 'vite';

export default defineConfig({
  // This configuration can be used for Vitest or custom Vite builds
  // Note: Angular CLI uses its own internal Vite configuration for 'ng build'
  // and 'ng serve', but some tools look for this file.
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    mainFields: ['module'],
  },
  build: {
    commonjsOptions: {
      include: [/leaflet/, /node_modules/],
    },
  },
});
