import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/services': path.resolve(__dirname, './src/services'),
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Feature chunks (lazy loaded)
          'landing': ['./src/features/landing/LandingPage.jsx'],
          'dashboard': ['./src/features/dashboard/DashboardPage.jsx'],
          'missions': ['./src/features/missions/MissionsPage.jsx'],
          'candidates': ['./src/features/candidates/CandidatesPage.jsx'],
          'pipeline': ['./src/features/pipeline/PipelinePage.jsx'],
          'cvtheque': ['./src/features/cvtheque/CVThequePage.jsx'],
          'calendar': ['./src/features/calendar/CalendarPage.jsx'],
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
