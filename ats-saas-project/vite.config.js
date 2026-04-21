import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    minify: 'terser', // Terser for better console.log removal
    terserOptions: {
      compress: {
        drop_console: true,        // Remove all console.log
        drop_debugger: true,       // Remove debugger statements
        pure_funcs: ['console.info', 'console.debug'], // Remove specific console methods
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React vendor bundle
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }

          // Shared components bundle
          if (id.includes('/src/shared/components/')) {
            return 'shared-components';
          }

          // Core utilities bundle (contexts, hooks, utils)
          if (id.includes('/src/core/')) {
            return 'core-utils';
          }

          // Landing pages bundle
          if (id.includes('/src/features/landing/')) {
            return 'landing';
          }

          // Public pages bundle (blog, integrations, case studies, demo)
          if (id.includes('/src/features/pages/')) {
            return 'public-pages';
          }

          // App pages bundle (dashboard, missions, candidates, etc.)
          if (id.includes('/src/features/dashboard/') ||
              id.includes('/src/features/missions/') ||
              id.includes('/src/features/candidates/') ||
              id.includes('/src/features/pipeline/') ||
              id.includes('/src/features/cvtheque/') ||
              id.includes('/src/features/calendar/') ||
              id.includes('/src/features/team/') ||
              id.includes('/src/features/clients/')) {
            return 'app-pages';
          }

          // Admin pages bundle
          if (id.includes('/src/features/admin/') ||
              id.includes('/src/features/superadmin/')) {
            return 'admin-pages';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Additional optimizations
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    cssCodeSplit: true, // Split CSS
  }
})
