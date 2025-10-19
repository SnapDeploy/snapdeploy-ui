import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Ensure proper minification
    minify: true,
  },
  // Ensure proper base path for deployment
  base: '/',
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@clerk/clerk-react', '@tanstack/react-query']
  }
})
