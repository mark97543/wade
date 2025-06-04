import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  resolve:{
    alias: {
      '@wade-usa/components': path.resolve(__dirname, '../_components'),
      '@wade-usa/contexts': path.resolve(__dirname, '../contexts'), // Points to wade/contexts
    }
  },
  // REMOVE optimizeDeps.exclude if it was here
})