import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const sentryPlugin = env.VITE_SENTRY_DSN && env.SENTRY_AUTH_TOKEN
    ? sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: { assets: './dist/**' },
        release: { name: env.VITE_APP_VERSION || '1.0.0' },
      })
    : null

  return {
  plugins: [react(), sentryPlugin].filter(Boolean),
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
    sourcemap: env.VITE_SENTRY_DSN ? 'hidden' : false,
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

          // T-432 : règle 'public-pages' supprimée ici — ciblait
          // /src/features/pages/, un dossier qui n'existe pas dans ce
          // projet (blog/integrations/case-studies/demo vivent sous
          // /src/features/marketing/ et /src/features/landing/, déjà
          // couverts par la règle 'landing' ci-dessus ou l'auto-split).
          // Règle morte depuis toujours, sans effet, mais source de
          // confusion pour quiconque relit ce fichier.

          // T-261 : les pages app (missions, candidats, pipeline, cvthèque…) et admin
          // étaient regroupées en un seul gros chunk (app-pages) qui court-circuitait
          // le code-splitting naturel de React.lazy() — elles sont maintenant laissées
          // à l'auto-split de Rollup/Vite, ce qui donne un chunk par page, chargé
          // uniquement à la navigation vers cette page.
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Additional optimizations
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
  },
  // T-306 — Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/__tests__/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/core/**/*.{js,jsx}', 'src/shared/components/**/*.{js,jsx}'],
      exclude: ['src/__tests__/**', 'src/**/*.test.{js,jsx}'],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/config': path.resolve(__dirname, './src/config'),
    },
  },
  }
})
