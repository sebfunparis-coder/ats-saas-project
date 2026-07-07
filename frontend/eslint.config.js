import js from '@eslint/js';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * ESLint flat config — T-309
 * Règles : erreurs JS courantes + hooks React + pas de console.log en prod
 */
export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Qualité JS
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',

      // Sécurité
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        crypto: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        React: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    // Ignorer les fichiers générés et les configs
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'src/i18n/*.json',
    ],
  },
];
