import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);// Get the absolute path to the current directory (e.g., wade/1_client/)



export default defineConfig({
  plugins: [react()],
  resolve:{
    alias: {
      // Define the alias for your _components directory
      // '@wade-usa/components' will map to the actual path on your filesystem
      '@wade-usa/components': path.resolve(__dirname, '../_components')
      // Explanation for path.resolve(__dirname, '../src/_components'):
      // - __dirname:  This is the directory of the current vite.config.js file (e.g., wade/1_client/)
      // - '../':      Go up one level (from wade/1_client/ to wade/)
      // - 'src/':     Go into the 'src' directory (wade/src/)
      // - '_components': Then into the '_components' directory (wade/src/_components/)
    }
  }
})
