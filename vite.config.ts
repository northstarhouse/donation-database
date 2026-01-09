import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/donation-database/',
  plugins: [react()],
  build: {
    outDir: 'docs',
    emptyOutDir: true
  }
});
