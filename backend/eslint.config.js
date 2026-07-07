import js from '@eslint/js';

/**
 * ESLint flat config — Backend Node.js — T-309
 */
export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    rules: {
      // Qualité
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off', // Le backend utilise logger, mais console reste utile en dev
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-duplicate-imports': 'error',

      // Sécurité
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',

      // Async
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',
      'require-await': 'warn',
    },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        global: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'logs/**',
      'load-tests/**',
    ],
  },
];
