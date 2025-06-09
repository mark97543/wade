import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve:{
    alias: {
      '@wade-usa/components': path.resolve(__dirname, '../_components'),
      '@wade-usa/contexts': path.resolve(__dirname, '../contexts'),
    }
  },
  // The optimizeDeps block should be removed from here
})